import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Bot, User, Send, Loader2, Lightbulb, Calendar, AlertTriangle, Sparkles } from 'lucide-react'
import { ExtendedHousehold } from '@/types/household'
import { supabase } from '@/integrations/supabase/client'

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
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Initialize with welcome message
  useEffect(() => {
    if (!isInitialized) {
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: `Hallo! 👋 Ich bin dein muutto KI-Assistent und helfe dir bei deinem Umzug. ${
          household 
            ? `Ich sehe, dass dein Umzug "${household.name}" am ${new Date(household.move_date).toLocaleDateString('de-DE')} geplant ist.` 
            : 'Wie kann ich dir heute helfen?'
        }

Ich kann dir bei folgenden Themen helfen:
• **Fristen & Deadlines** - Wann muss was erledigt werden?
• **Kosten & Budget** - Was kostet ein Umzug?
• **Organisation** - Wie plane ich den Umzugstag?
• **Rechtliches** - Welche Ummeldungen sind nötig?

Stelle mir gerne deine erste Frage! 😊`,
        timestamp: new Date(),
        suggestions: [
          'Was muss ich als erstes tun?',
          'Welche Fristen sind wichtig?',
          'Wie organisiere ich den Umzugstag?',
          'Was kostet ein Umzug?'
        ]
      }
      
      setMessages([welcomeMessage])
      setIsInitialized(true)
    }
  }, [household, isInitialized])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const getDaysUntilMove = () => {
    if (!household) return null
    const today = new Date()
    const moveDate = new Date(household.move_date)
    const diffTime = moveDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const callAIAssistant = async (userMessage: string): Promise<string> => {
    try {
      const householdContext = household ? {
        name: household.name,
        moveDate: household.move_date,
        householdSize: household.household_size,
        childrenCount: household.children_count,
        petsCount: household.pets_count,
        propertyType: household.property_type,
        daysUntilMove: getDaysUntilMove() || 0
      } : undefined

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

    try {
      const response = await callAIAssistant(userMessage.content)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        suggestions: [
          'Weitere Tipps?',
          'Was ist als nächstes zu tun?',
          'Wie spare ich Kosten?'
        ]
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error calling AI assistant:', error)
      
      // Fallback message
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Entschuldigung, ich bin momentan nicht verfügbar. Hier sind einige wichtige Umzugstipps:

📅 **Wichtige Fristen:**
• 3 Monate vorher: Mietvertrag kündigen
• 6-8 Wochen vorher: Umzugsunternehmen buchen
• 4 Wochen vorher: Verträge ummelden
• 2 Wochen vorher: Nachsendeauftrag

💡 **Sofort-Tipps:**
• Erstelle eine Checkliste
• Hole mehrere Umzugsangebote ein
• Sammle wichtige Dokumente
• Plane ein Umzugsbudget (800-2000€)

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

  return (
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
  )
}