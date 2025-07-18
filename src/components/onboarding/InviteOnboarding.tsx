import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { HOUSEHOLD_ROLES } from '@/config/roles'
import { supabase } from '@/integrations/supabase/client'
import { Invitation } from '@/types/invitation'

interface InviteOnboardingProps {
  invitation: Invitation
  onComplete: () => void
}

export const InviteOnboarding = ({ invitation, onComplete }: InviteOnboardingProps) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState(invitation.name || user?.user_metadata?.full_name || '')
  const [role, setRole] = useState<string>(invitation.role || 'null')
  const [saving, setSaving] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  const handleAccept = async () => {
    if (!user) {
      toast({
        title: 'Fehler',
        description: 'Sie müssen angemeldet sein, um eine Einladung anzunehmen.',
        variant: 'destructive'
      })
      return
    }

    if (!name.trim()) {
      setNameError('Bitte gib deinen Namen an.')
      return
    }

    setSaving(true)
    
    try {
      const { error } = await supabase.rpc('accept_household_invitation', {
        p_member_id: invitation.id,
        p_user_id: user.id,
        p_name: name.trim(),
        p_role: role === 'null' ? null : role
      })

      if (error) {
        console.error('Error accepting invitation:', error)
        throw error
      }

      toast({ 
        title: 'Einladung angenommen',
        description: `Du bist jetzt Mitglied von "${invitation.households.name}".`
      })
      
      onComplete()
    } catch (error) {
      console.error('Error accepting invitation:', error)
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Aktion fehlgeschlagen',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Haushaltseinladung</CardTitle>
          <CardDescription>
            Du wurdest zu &quot;{invitation.households.name}&quot; eingeladen
            <br />
            <span className="text-sm text-gray-600">
              Umzug am {new Date(invitation.households.move_date).toLocaleDateString('de-DE')}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Dein Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (e.target.value.trim()) setNameError(null)
              }}
              className={nameError ? 'border-red-500' : ''}
              placeholder="z.B. Max Mustermann"
            />
            {nameError && (
              <p className="text-sm text-red-600 mt-1">{nameError}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="role">Rolle (optional)</Label>
            <Select value={role} onValueChange={(v) => setRole(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Rolle auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Keine Rolle</SelectItem>
                {HOUSEHOLD_ROLES.map((r) => (
                <SelectItem key={r.key} value={r.key}>
                  <span className="mr-1">👤</span>
                  {r.name}
                </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            onClick={handleAccept}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={saving || !name.trim()}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Wird gespeichert...
              </span>
            ) : (
              'Einladung annehmen'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}