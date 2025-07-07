
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import { Crown, ChevronDown } from 'lucide-react'

const Settings = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { status: premiumStatus, loading: premiumLoading } = usePremiumStatus()

  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [premiumBenefitsOpen, setPremiumBenefitsOpen] = useState(false)

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      })
      if (error) throw error
      toast({
        title: "Profil aktualisiert",
        description: "Dein Profil wurde erfolgreich aktualisiert.",
      })
    } catch (error: unknown) {
      toast({
        title: "Fehler beim Aktualisieren des Profils",
        description: error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Passwort muss mindestens 8 Zeichen lang sein';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Passwort muss mindestens einen Großbuchstaben enthalten';
    }
    if (!/[a-z]/.test(password)) {
      return 'Passwort muss mindestens einen Kleinbuchstaben enthalten';
    }
    if (!/\d/.test(password)) {
      return 'Passwort muss mindestens eine Zahl enthalten';
    }
    return null;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Password strength validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        title: "Passwort zu schwach",
        description: passwordError,
        variant: "destructive",
      })
      return
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwortfehler",
        description: "Passwörter stimmen nicht überein.",
        variant: "destructive",
      })
      return
    }
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })
      if (error) throw error
      toast({
        title: "Passwort geändert",
        description: "Dein Passwort wurde erfolgreich geändert.",
      })
      setPassword('')
      setConfirmPassword('')
    } catch (error: unknown) {
      toast({
        title: "Fehler beim Ändern des Passworts",
        description: error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-portal')
      if (error) throw error
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("URL für das Kundenportal nicht erhalten.")
      }
    } catch (error: unknown) {
      toast({
        title: "Fehler beim Öffnen des Kundenportals",
        description: error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Einstellungen</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="account">Konto</TabsTrigger>
          <TabsTrigger value="billing">Zahlung & Abos</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil bearbeiten</CardTitle>
              <CardDescription>Aktualisiere deine persönlichen Informationen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Vollständiger Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input id="email" type="email" value={email} disabled />
                </div>
                <Button type="submit">Profil speichern</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Passwort ändern</CardTitle>
              <CardDescription>Ändere dein Passwort hier.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Neues Passwort</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type="submit">Passwort ändern</Button>
              </form>
              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-2">Konto löschen</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Wenn du dein Konto löschst, werden alle deine Daten dauerhaft entfernt.
                  Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
                <Button variant="destructive" onClick={() => alert('Konto löschen Funktion noch nicht implementiert.')}>Konto löschen</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Zahlung & Abos</CardTitle>
              <CardDescription>Verwalte deine Premium-Mitgliedschaft.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!premiumLoading && (
                premiumStatus?.is_premium ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      <p className="text-sm font-medium">Du bist Premium-Mitglied!</p>
                    </div>
                    {premiumStatus.premium_mode === 'monthly' && (
                       <Button onClick={handleManageSubscription}>Abonnement verwalten</Button>
                    )}
                    
                    <Collapsible open={premiumBenefitsOpen} onOpenChange={setPremiumBenefitsOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          Premium-Vorteile anzeigen
                          <ChevronDown className={`h-4 w-4 transition-transform ${premiumBenefitsOpen ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4 space-y-2">
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border">
                          <h4 className="font-semibold text-yellow-800 mb-2">Deine Premium-Vorteile:</h4>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            <li>✓ Unbegrenzte Haushalte</li>
                            <li>✓ KI-gestützte Aufgabenplanung</li>
                            <li>✓ Erweiterte Inventarverwaltung</li>
                            <li>✓ Smart-Timeline mit Drag & Drop</li>
                            <li>✓ Automatische Vertragsanalyse</li>
                            <li>✓ Prioritärer Support</li>
                            <li>✓ Export-Funktionen</li>
                            <li>✓ Individuelle Rollenvergabe</li>
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ) : (
                  <div className="space-y-4">
                     <p className="text-sm text-muted-foreground">Du hast noch kein Premium-Abo.</p>
                     <Button onClick={() => navigate('/premium')} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                       <Crown className="h-4 w-4 mr-2" />
                       Jetzt Premium freischalten
                     </Button>
                     
                     <Collapsible open={premiumBenefitsOpen} onOpenChange={setPremiumBenefitsOpen}>
                       <CollapsibleTrigger asChild>
                         <Button variant="outline" className="w-full justify-between">
                           Premium-Vorteile anzeigen
                           <ChevronDown className={`h-4 w-4 transition-transform ${premiumBenefitsOpen ? 'rotate-180' : ''}`} />
                         </Button>
                       </CollapsibleTrigger>
                       <CollapsibleContent className="mt-4 space-y-2">
                         <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
                           <h4 className="font-semibold text-blue-800 mb-2">Mit Premium erhältst du:</h4>
                           <ul className="text-sm text-blue-700 space-y-1">
                             <li>• Unbegrenzte Haushalte</li>
                             <li>• KI-gestützte Aufgabenplanung</li>
                             <li>• Erweiterte Inventarverwaltung</li>
                             <li>• Smart-Timeline mit Drag & Drop</li>
                             <li>• Automatische Vertragsanalyse</li>
                             <li>• Prioritärer Support</li>
                             <li>• Export-Funktionen</li>
                             <li>• Individuelle Rollenvergabe</li>
                           </ul>
                         </div>
                       </CollapsibleContent>
                     </Collapsible>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings
