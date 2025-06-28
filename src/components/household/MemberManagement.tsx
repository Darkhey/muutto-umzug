import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useHouseholdMembers } from '@/hooks/useHouseholdMembers'
import { useAuth } from '@/contexts/AuthContext'
import { HOUSEHOLD_ROLES, getRoleIcon, getRoleColor } from '@/config/roles'
import { HouseholdRole } from '@/types/household'
import { Users, UserPlus, Mail, Crown, Clock, CheckCircle, Trash2, Settings, Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface MemberManagementProps {
  householdId: string
  isOwner?: boolean
}

export const MemberManagement = ({ householdId, isOwner = false }: MemberManagementProps) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const { members, loading, inviteMember, updateMemberRole, removeMember } = useHouseholdMembers(householdId)

  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'null' as string
  })
  const [invitationCode, setInvitationCode] = useState('')

  useEffect(() => {
    const fetchCode = async () => {
      const { data } = await supabase
        .from('households')
        .select('invitation_code')
        .eq('id', householdId)
        .single()
      if (data?.invitation_code) {
        setInvitationCode(data.invitation_code)
      }
    }
    if (householdId) fetchCode()
  }, [householdId])

  const handleInvite = async () => {
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      toast({
        title: "Ungültige Eingabe",
        description: "Name und E-Mail sind erforderlich.",
        variant: "destructive"
      })
      return
    }

    try {
      await inviteMember(
        inviteForm.email.trim(),
        inviteForm.name.trim(),
        inviteForm.role === 'null' ? undefined : inviteForm.role as HouseholdRole
      )
      
      setInviteForm({ name: '', email: '', role: 'null' })
      setShowInviteDialog(false)
    } catch (error) {
      toast({
        title: "Fehler beim Einladen",
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await updateMemberRole(memberId, newRole === 'null' ? null : newRole as HouseholdRole)
    } catch (error) {
      toast({
        title: "Fehler beim Ändern der Rolle",
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(memberId)
    } catch (error) {
      toast({
        title: "Fehler beim Entfernen",
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getStatusBadge = (member: any) => {
    if (member.is_owner) {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800"><Crown className="h-3 w-3 mr-1" />Besitzer</Badge>
    }
    if (member.user_id && member.joined_at) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Aktiv</Badge>
    }
    return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Eingeladen</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Lädt Mitglieder...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Haushaltsmitglieder
          </h2>
          <p className="text-gray-600 mt-1">
            {members.length} {members.length === 1 ? 'Mitglied' : 'Mitglieder'}
          </p>
          {isOwner && invitationCode && (
            <div className="flex items-center mt-2 space-x-2">
              <span className="text-sm text-gray-600">Einladungscode:</span>
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                {invitationCode}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(invitationCode)
                  toast({ title: 'Code kopiert' })
                }}
              >
                <Copy className="h-3 w-3 mr-1" />
                Kopieren
              </Button>
            </div>
          )}
        </div>

        {isOwner && (
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Mitglied einladen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neues Mitglied einladen</DialogTitle>
                <DialogDescription>
                  Lade eine Person zu deinem Haushalt ein und weise optional eine Rolle zu.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-name">Name</Label>
                  <Input
                    id="invite-name"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    placeholder="z.B. Max Mustermann"
                  />
                </div>
                
                <div>
                  <Label htmlFor="invite-email">E-Mail-Adresse</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="max@beispiel.de"
                  />
                </div>
                
                <div>
                  <Label htmlFor="invite-role">Rolle (optional)</Label>
                  <Select 
                    value={inviteForm.role} 
                    onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Rolle auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Keine Rolle</SelectItem>
                      {HOUSEHOLD_ROLES.map((role) => (
                        <SelectItem key={role.key} value={role.key}>
                          <div className="flex items-center">
                            <span className="mr-2">{role.icon}</span>
                            {role.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleInvite}>
                  <Mail className="h-4 w-4 mr-2" />
                  Einladung senden
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Members List */}
      <div className="grid gap-4">
        {members.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      {getStatusBadge(member)}
                    </div>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    
                    {member.role && (
                      <div className="flex items-center mt-1">
                        <Badge className={getRoleColor(member.role)}>
                          <span className="mr-1">{getRoleIcon(member.role)}</span>
                          {HOUSEHOLD_ROLES.find(r => r.key === member.role)?.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {isOwner && !member.is_owner && (
                  <div className="flex items-center space-x-2">
                    <Select
                      value={member.role || 'null'}
                      onValueChange={(value) => handleRoleChange(member.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <Settings className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Rolle ändern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">Keine Rolle</SelectItem>
                        {HOUSEHOLD_ROLES.map((role) => (
                          <SelectItem key={role.key} value={role.key}>
                            <div className="flex items-center">
                              <span className="mr-2">{role.icon}</span>
                              {role.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Mitglied entfernen</AlertDialogTitle>
                          <AlertDialogDescription>
                            Möchtest du {member.name} wirklich aus diesem Haushalt entfernen? 
                            Diese Aktion kann nicht rückgängig gemacht werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleRemoveMember(member.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Entfernen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verfügbare Rollen</CardTitle>
          <CardDescription>
            Jede Rolle hat spezifische Aufgaben und Verantwortlichkeiten im Umzugsprozess.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOUSEHOLD_ROLES.map((role) => (
              <div key={role.key} className="p-4 border rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{role.icon}</span>
                  <h4 className="font-semibold">{role.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  {role.responsibilities.slice(0, 3).map((resp, index) => (
                    <li key={index}>• {resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}