import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Bot, User, Send, Loader2, Lightbulb, Calendar, AlertTriangle } from 'lucide-react'
import { ExtendedHousehold } from '@/types/household'

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hallo! 👋 Ich bin dein muutto-Assistent und helfe dir bei deinem Umzug. ${
        household 
          ? `Ich sehe, dass dein Umzug "${household.name}" am ${new Date(household.move_date).toLocaleDateString('de-DE')} geplant ist.` 
          : 'Wie kann ich dir heute helfen?'
      }`,
      timestamp: new Date(),
      suggestions: [
        'Was muss ich als erstes tun?',
        'Welche Fristen sind wichtig?',
        'Wie organisiere ich den Umzugstag?',
        'Was kostet ein Umzug?'
      ]
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const generateResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI response based on context
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('frist') || lowerMessage.includes('deadline')) {
      return `📅 **Wichtige Fristen für deinen Umzug:**

• **3 Monate vorher:** Mietvertrag kündigen
• **6-8 Wochen vorher:** Umzugsunternehmen buchen
• **4 Wochen vorher:** Strom, Gas, Internet ummelden
• **2 Wochen vorher:** Nachsendeauftrag bei der Post
• **Nach dem Umzug:** Binnen 14 Tagen beim Einwohnermeldeamt anmelden

${household ? `Für deinen Umzug am ${new Date(household.move_date).toLocaleDateString('de-DE')} habe ich bereits eine personalisierte Checkliste erstellt!` : ''}`
    }
    
    if (lowerMessage.includes('kosten') || lowerMessage.includes('preis')) {
      return `💰 **Umzugskosten im Überblick:**

• **Umzugsunternehmen:** 800-2000€ (je nach Entfernung)
• **Kartons & Material:** 50-150€
• **Renovierung:** 200-800€
• **Ummeldungen:** meist kostenlos
• **Kaution neue Wohnung:** 2-3 Monatsmieten

**Spartipp:** Vergleiche mehrere Angebote und plane rechtzeitig!`
    }
    
    if (lowerMessage.includes('umzugstag') || lowerMessage.includes('organisation')) {
      return `📦 **Umzugstag perfekt organisieren:**

1. **Früh starten:** Um 7-8 Uhr beginnen
2. **Team koordinieren:** Helfer einteilen und briefen
3. **Verpflegung:** Snacks und Getränke bereitstellen
4. **Notfall-Karton:** Wichtigste Sachen griffbereit
5. **Übergabe:** Protokolle für alte und neue Wohnung

**Pro-Tipp:** Erstelle einen Zeitplan und teile ihn mit allen Helfern!`
    }
    
    if (lowerMessage.includes('anfang') || lowerMessage.includes('erste')) {
      return `🚀 **Deine ersten Schritte:**

1. **Umzugstermin festlegen** ✅
2. **Checkliste erstellen** (mache ich für dich!)
3. **Budget planen** (800-2000€ einkalkulieren)
4. **Umzugsunternehmen kontaktieren**
5. **Kündigungsfristen prüfen**

Soll ich dir bei einem dieser Punkte konkret helfen?`
    }
    
    // Default response
    return `Ich verstehe deine Frage zu "${userMessage}". Als dein Umzugs-Assistent kann ich dir bei folgenden Themen helfen:

• **Fristen & Deadlines** - Wann muss was erledigt werden?
• **Kosten & Budget** - Was kostet ein Umzug?
• **Organisation** - Wie plane ich den Umzugstag?
• **Rechtliches** - Welche Ummeldungen sind nötig?
• **Tipps & Tricks** - Wie wird der Umzug stressfrei?

Stelle mir gerne eine konkretere Frage! 😊`
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
      
      const response = await generateResponse(userMessage.content)
      
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
      toast({
        title: 'Fehler',
        description: 'Der KI-Assistent ist momentan nicht verfügbar.',
        variant: 'destructive'
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
          <Bot className="h-5 w-5 text-indigo-600" />
          muutto KI-Assistent
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
            Beta
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
        </div>
      </CardContent>
    </Card>
  )
}