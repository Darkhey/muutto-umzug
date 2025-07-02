import { UpgradeCTA } from '@/components/premium/UpgradeCTA'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'

const Premium = () => {
  const { status, loading } = usePremiumStatus()

  if (loading) {
    return <p className="p-4">Lädt...</p>
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Rechts- & Behördenassistent</h1>
      {status?.is_premium ? (
        <p>Premium aktiviert. Du hast Zugriff auf alle Funktionen.</p>
      ) : (
        <>
          <p>Aktiviere den Premium-Assistenten für rechtliche Aufgaben und Erinnerungen.</p>
          <UpgradeCTA />
        </>
      )}
    </div>
  )
}

export default Premium
