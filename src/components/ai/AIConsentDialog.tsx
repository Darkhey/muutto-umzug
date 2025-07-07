
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Shield, Bot, Info } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface AIConsentDialogProps {
  onConsent: () => void
  className?: string
}

export const AIConsentDialog = ({ onConsent, className }: AIConsentDialogProps) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleConsent = async () => {
    if (!user || !agreed) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ai_assistant_consent: true,
          ai_assistant_consent_date: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: 'KI-Assistent aktiviert',
        description: 'Du kannst jetzt den muutto KI-Assistenten verwenden.',
      })

      onConsent()
    } catch (error) {
      console.error('Error updating consent:', error)
      toast({
        title: 'Fehler',
        description: 'Die Zustimmung konnte nicht gespeichert werden.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Bot className="h-12 w-12 text-indigo-600" />
            <Shield className="h-6 w-6 text-green-600 absolute -bottom-1 -right-1" />
          </div>
        </div>
        <CardTitle className="text-2xl">
          muutto KI-Assistent aktivieren
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Was passiert mit deinen Daten?</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Deine Haushaltsdaten werden zur Personalisierung verwendet</li>
                <li>• Nachrichten werden sicher über OpenAI GPT-4 verarbeitet</li>
                <li>• Keine Weitergabe an Dritte außer OpenAI</li>
                <li>• Chat-Verlauf wird lokal in deinem muutto-Account gespeichert</li>
                <li>• Du kannst die Zustimmung jederzeit in den Einstellungen widerrufen</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-800 mb-2">Das kann der KI-Assistent für dich tun:</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Personalisierte Umzugstipps basierend auf deiner Situation</li>
            <li>• Erinnerungen an wichtige Fristen und Aufgaben</li>
            <li>• Hilfe bei rechtlichen Fragen rund um den Umzug</li>
            <li>• Kostenschätzungen und Budgetplanung</li>
            <li>• Lokale Tipps für deine Region</li>
          </ul>
        </div>

        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
          <Checkbox
            id="consent"
            checked={agreed}
            onCheckedChange={checked => setAgreed(checked === true)}
          />
          <label htmlFor="consent" className="text-sm text-gray-700 leading-relaxed">
            Ich stimme zu, dass meine Haushaltsdaten zur Personalisierung des KI-Assistenten 
            verwendet werden. Ich habe die Datenschutzhinweise gelesen und verstanden.
          </label>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleConsent}
            disabled={!agreed || isLoading}
            className="flex-1"
          >
            {isLoading ? 'Aktiviere...' : 'KI-Assistent aktivieren'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
