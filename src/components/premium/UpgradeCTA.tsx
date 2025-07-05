import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import { useNavigate } from 'react-router-dom'
import { Crown } from 'lucide-react'

export const UpgradeCTA = () => {
  const { status, loading } = usePremiumStatus()
  const navigate = useNavigate()

  if (loading) return null
  if (status?.is_premium) {
    return <Badge variant="outline">Premium aktiviert</Badge>
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Schalte alle Funktionen frei, um deinen Umzug noch reibungsloser zu gestalten:
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
        <li>Mehrere Haushalte pro Umzug</li>
        <li>KI-gestützte Aufgabenplanung</li>
        <li>Merge-Analyse und Vergleich von Haushalten</li>
        <li>Smart-Timeline mit Drag&Drop</li>
        <li>Automatische Vertragsanalyse (via Banking API)</li>
        <li>Individuelle Rollenvergabe & Exportmöglichkeiten</li>
      </ul>

      <Button
        onClick={() => navigate('/premium')}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
      >
        <Crown className="h-4 w-4 mr-2" />
        Premium freischalten
      </Button>
    </div>
  )
}

export default UpgradeCTA 