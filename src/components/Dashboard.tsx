
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useHouseholds } from '@/hooks/useHouseholds'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Users, CheckCircle, Calendar, Plus, Home, User, LogOut } from 'lucide-react'
import { OnboardingFlow } from './onboarding/OnboardingFlow'
import { TaskList } from './TaskList'
import { AuthPage } from './auth/AuthPage'
import { useToast } from '@/hooks/use-toast'
import { Database } from '@/types/database'

type Household = Database['public']['Tables']['households']['Row']

export const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth()
  const { households, loading, createHousehold, addMembers } = useHouseholds()
  const { toast } = useToast()
  
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [activeHousehold, setActiveHousehold] = useState<Household | null>(null)

  // Show auth page if not logged in
  if (!authLoading && !user) {
    return <AuthPage />
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lädt...</p>
        </div>
      </div>
    )
  }

  const handleOnboardingComplete = async (data: any) => {
    try {
      const household = await createHousehold({
        name: data.householdName,
        move_date: data.moveDate,
        household_size: data.householdSize,
        children_count: data.childrenCount,
        pets_count: data.petsCount,
        property_type: data.propertyType,
        postal_code: data.postalCode
      })

      // Add members if any
      if (data.members && data.members.length > 0) {
        const validMembers = data.members.filter((m: any) => m.name.trim() && m.email.trim())
        if (validMembers.length > 0) {
          await addMembers(household.id, validMembers)
        }
      }

      setShowOnboarding(false)
      setActiveHousehold(household)
      
      toast({
        title: "Haushalt erfolgreich erstellt!",
        description: "Willkommen bei muutto. Lass uns mit der Planung beginnen."
      })
    } catch (error) {
      toast({
        title: "Fehler beim Erstellen",
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow 
        onComplete={handleOnboardingComplete}
        onSkip={() => setShowOnboarding(false)}
      />
    )
  }

  if (activeHousehold) {
    return (
      <TaskList 
        household={activeHousehold} 
        onBack={() => setActiveHousehold(null)} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              muutto<span className="text-blue-600"> Dashboard</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Willkommen zurück, {user?.user_metadata?.full_name || user?.email}!
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {households.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktive Umzüge</CardTitle>
                <Home className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{households.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nächste Frist</CardTitle>
                <Calendar className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold text-orange-600">
                  {households.length > 0 
                    ? `${Math.ceil((new Date(households[0].move_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Tage`
                    : 'Keine'
                  }
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fortschritt</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">25%</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Households Grid */}
        {households.length === 0 ? (
          <Card className="bg-white shadow-lg text-center py-12">
            <CardContent>
              <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Willkommen bei muutto! 🏠
              </h3>
              <p className="text-gray-600 mb-6">
                Erstelle deinen ersten Haushalt und lass uns gemeinsam deinen Umzug planen.
              </p>
              <Button 
                onClick={() => setShowOnboarding(true)} 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ersten Haushalt erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Deine Haushalte</h2>
              <Button 
                onClick={() => setShowOnboarding(true)} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Neuer Haushalt
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {households.map((household) => {
                const daysUntilMove = Math.ceil((new Date(household.move_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                const progress = Math.max(0, Math.min(100, 100 - (daysUntilMove / 90) * 100))
                
                return (
                  <Card key={household.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-lg">{household.name}</span>
                        <Badge variant="secondary">{Math.round(progress)}%</Badge>
                      </CardTitle>
                      <CardDescription>
                        Umzug: {new Date(household.move_date).toLocaleDateString('de-DE')}
                        {daysUntilMove > 0 && ` (in ${daysUntilMove} Tagen)`}
                        {daysUntilMove < 0 && ` (vor ${Math.abs(daysUntilMove)} Tagen)`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Fortschritt</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-1" />
                            {household.household_size} {household.household_size === 1 ? 'Person' : 'Personen'}
                            {household.children_count > 0 && `, ${household.children_count} Kinder`}
                            {household.pets_count > 0 && `, ${household.pets_count} Haustiere`}
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => setActiveHousehold(household)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Öffnen
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}

        {/* Quick Tips */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white mt-8">
          <CardHeader>
            <CardTitle className="text-white">💡 Tipp des Tages</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Beginne mit der Kündigung deines alten Mietvertrags mindestens 3 Monate vor dem geplanten Auszug. 
              So vermeidest du unnötige Kosten und Stress!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
