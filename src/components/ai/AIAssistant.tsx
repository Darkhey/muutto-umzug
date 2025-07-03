
import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Bot, User, Send, Loader2, Sparkles, PlusCircle } from 'lucide-react'
import { ExtendedHousehold } from '@/types/household'
import { supabase } from '@/integrations/supabase/client'
import { AIConsentDialog } from './AIConsentDialog'
import { AddTaskFromChatDialog } from '../tasks/AddTaskFromChatDialog'
import { useUserConsent } from '@/hooks/useUserConsent'
import { generatePersonalizedWelcomeMessage, buildHouseholdContext } from '@/utils/aiPersonalization'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface AIAssistantProps {
  household?: ExtendedHousehold
  className?: string
}

export const AIAssistant = ({ household, className }: AIAssistantProps) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const { hasConsent, isLoading: consentLoading, updateConsent } = useUserConsent()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [taskMessage, setTaskMessage] = useState<string>('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState<any>({})

  const onboardingQuestions = [
    "Wohin ziehst du um? (Stadt und Bundesland)",
    "Von wo ziehst du weg? (Stadt und Bundesland)",
    "Hast du einen Hund? (Ja/Nein)",
    "Hast du Kinder? (Ja/Nein)",
    "Hast du ein Auto? (Ja/Nein)",
    "Gibt es sonst noch etwas, das wir beachten sollten? (z.B. Zweitwohnsitz, Auslandsumzug, Pflegefall)"
  ]

  const updateProfile = async (profileUpdates: any) => {
    if (!user) return
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id)
      if (error) throw error
      toast({
        title: "Profil aktualisiert",
        description: "Deine Angaben wurden gespeichert.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Fehler beim Aktualisieren des Profils",
        description: "Bitte versuche es erneut.",
        variant: "destructive",
      })
    }
  }

  const createChatSession = async () => {
    if (!user || !household) return

    try {
      const context = buildHouseholdContext(household)
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          household_id: household.id,
          user_id: user.id,
          title: `Chat ${new Date().toLocaleDateString('de-DE')}`,
          context
        })
        .select()
        .single()

      if (error) throw error

      setSessionId(data.id)
    } catch (error) {
      console.error('Error creating chat session:', error)
    }
  }

  // Initialize with personalized welcome message when consent is given
  useEffect(() => {
    if (!hasConsent || !household || isInitialized) return

    // Check if profile data is complete for onboarding questions
    const isProfileComplete = user?.user_metadata?.has_children !== undefined &&
                              user?.user_metadata?.has_pets !== undefined &&
                              user?.user_metadata?.owns_car !== undefined &&
                              user?.user_metadata?.is_self_employed !== undefined &&
                              user?.user_metadata?.wants_notifications !== undefined

    if (!isProfileComplete) {
      // Start onboarding questions
      setMessages([{
        id: '1',
        role: 'assistant',
        content: onboardingQuestions[0],
        timestamp: new Date()
      }])
      setOnboardingStep(0)
      setIsInitialized(true)
    } else {
      const welcomeContent = generatePersonalizedWelcomeMessage(household)
      
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date(),
        suggestions: [
          'Was muss ich diese Woche erledigen?',
          'Welche Fristen sind kritisch?',
          'Tipps für den Umzugstag?',
          'Wie kann ich Kosten sparen?'
        ]
      }
      
      setMessages([welcomeMessage])
      setIsInitialized(true)
      
      // Create or get chat session
      createChatSession()
    }
  }, [hasConsent, household, isInitialized, user, createChatSession])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const callAIAssistant = async (userMessage: string): Promise<string> => {
    try {
      const householdContext = household ? buildHouseholdContext(household) : undefined

      const chatMessages = [
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: userMessage
        }
      ]

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          messages: chatMessages,
          householdContext
        }
      })

      if (error) {
        console.error('Supabase function error:', error)
        throw error
      }

      // Save messages to database if we have a session
      if (sessionId) {
        await Promise.all([
          supabase.from('chat_messages').insert({
            session_id: sessionId,
            role: 'user',
            content: userMessage
          }),
          supabase.from('chat_messages').insert({
            session_id: sessionId,
            role: 'assistant',
            content: data.message
          })
        ])
      }

      return data.message || 'Entschuldigung, ich konnte keine Antwort generieren.'
    } catch (error) {
      console.error('AI Assistant error:', error)
      throw error
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    if (onboardingStep < onboardingQuestions.length) {
      const question = onboardingQuestions[onboardingStep]
      const answer = userMessage.content
      setOnboardingData(prev => ({ ...prev, [question]: answer }))

      if (onboardingStep === onboardingQuestions.length - 1) {
        // Last question, process all data
        const profileUpdates: any = {}
        // Map answers to profile fields
        if (onboardingData["Hast du einen Hund? (Ja/Nein)"]?.toLowerCase() === "ja") {
          profileUpdates.has_pets = true
        }
        if (onboardingData["Hast du Kinder? (Ja/Nein)"]?.toLowerCase() === "ja") {
          profileUpdates.has_children = true
        }
        if (onboardingData["Hast du ein Auto? (Ja/Nein)"]?.toLowerCase() === "ja") {
          profileUpdates.owns_car = true
        }
        // Add more mappings for other questions as needed

        await updateProfile(profileUpdates)

        // Call the Supabase function to generate personalized tasks
        if (user && household) {
          try {
            const { data, error } = await supabase.rpc('generate_personalized_tasks', {
              p_user_id: user.id,
              p_move_from_state: onboardingData["Von wo ziehst du weg? (Stadt und Bundesland)"] || '',
              p_move_to_state: onboardingData["Wohin ziehst du um? (Stadt und Bundesland)"] || '',
              p_move_to_municipality: onboardingData["Wohin ziehst du um? (Stadt und Bundesland)"]?.split(' ')[0] || '',
              p_has_children: profileUpdates.has_children || false,
              p_has_pets: profileUpdates.has_pets || false,
              p_owns_car: profileUpdates.owns_car || false,
              p_is_self_employed: profileUpdates.is_self_employed || false,
            })
            if (error) throw error
            console.log('Personalized tasks generated:', data)
          } catch (error) {
            console.error('Error generating personalized tasks:', error)
            toast({
              title: "Fehler beim Generieren der Aufgaben",
              description: "Bitte versuche es erneut.",
              variant: "destructive",
            })
          }
        }
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Vielen Dank für deine Angaben! Ich habe dein Profil aktualisiert. Wie kann ich dir sonst noch helfen?",
          timestamp: new Date()
        }])
        setOnboardingStep(onboardingQuestions.length) // Mark onboarding as complete
      } else {
        setOnboardingStep(prev => prev + 1)
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: onboardingQuestions[onboardingStep + 1],
          timestamp: new Date()
        }])
      }
      setIsLoading(false)
      return
    }

    try {
      const response = await callAIAssistant(userMessage.content)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        suggestions: [
          'Weitere Details?',
          'Was ist als nächstes zu tun?',
          'Gibt es Alternativen?'
        ]
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error calling AI assistant:', error)
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Entschuldigung, ich bin momentan nicht verfügbar. Hier sind trotzdem einige wichtige Umzugstipps:

📅 **Wichtige Fristen:**
• 3 Monate vorher: Mietvertrag kündigen
• 6-8 Wochen vorher: Umzugsunternehmen buchen
• 4 Wochen vorher: Verträge ummelden
• 2 Wochen vorher: Nachsendeauftrag

💡 **Sofort-Tipps:**
• Erstelle eine Checkliste
• Hole mehrere Umzugsangebote ein
• Sammle wichtige Dokumente
• Plane ein Umzugsbudget

Versuche es gleich nochmal - ich bin normalerweise sofort da! 😊`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, fallbackMessage])
      
      toast({
        title: 'KI-Assistent temporär nicht verfügbar',
        description: 'Ich habe dir trotzdem einige wichtige Tipps zusammengestellt.',
        variant: 'default'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleConsent = () => {
    updateConsent(true)
    // Start onboarding questions after consent
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: onboardingQuestions[0],
      timestamp: new Date()
    }])
  }

  // Show loading state
  if (consentLoading) {
    return (
      <Card className={`h-[600px] flex items-center justify-center ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </Card>
    )
  }

  // Show consent dialog if no consent given
  if (!hasConsent) {
    return <AIConsentDialog onConsent={handleConsent} className={className} />
  }

  return (
    <>
    <Card className={`h-[600px] flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="relative">
            <Bot className="h-5 w-5 text-indigo-600" />
            <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
          </div>
          muutto KI-Assistent
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
            Powered by GPT-4
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-indigo-600" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('de-DE', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  
                  {message.suggestions && message.role === 'assistant' && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-6 bg-white hover:bg-gray-50"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6 mt-2 flex items-center gap-1"
                    onClick={() => {
                      setTaskMessage(message.content)
                      setTaskDialogOpen(true)
                    }}
                  >
                    <PlusCircle className="h-3 w-3" /> Aufgabe
                  </Button>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">Denke nach...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Frage mich alles über deinen Umzug..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Powered by OpenAI GPT-4 • Antworten können Fehler enthalten
          </p>
        </div>
      </CardContent>
    </Card>
    <AddTaskFromChatDialog
      open={taskDialogOpen}
      onOpenChange={setTaskDialogOpen}
      message={taskMessage}
      householdId={household?.id}
    />
    </>
  )
}
