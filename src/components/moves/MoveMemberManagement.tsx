import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useMoves } from '@/hooks/useMoves'
import { useAuth } from '@/contexts/AuthContext'
import { MOVE_ROLES, getMoveRoleByKey } from '@/config/moveRoles'
import { Users, UserPlus, Trash2, Settings } from 'lucide-react'
import { MoveMemberRole } from '@/types/move'
import { supabase } from '@/integrations/supabase/client'

interface MoveMemberManagementProps {
  moveId: string
}

export const MoveMemberManagement = ({ moveId }: MoveMemberManagementProps) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const { moves, addMoveMemberRole, removeMoveMemberRole, fetchMoves } = useMoves()
  const currentMove = moves.find(m => m.id === moveId)
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [newMemberForm, setNewMemberForm] = useState({
    userId: '',
    role: ''
  })

  // For simplicity, we'll fetch all profiles to select from. In a real app, you'd paginate or search.
  interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
}

  const [allProfiles, setAllProfiles] = useState<Profile[]>([])
  const [profilesLoading, setProfilesLoading] = useState(true)

  useEffect(() => {
    const fetchProfiles = async () => {
      setProfilesLoading(true)
      const { data, error } = await supabase.from('profiles').select('id, full_name, email')
      if (error) {
        console.error("Error fetching profiles:", error)
        toast({
          title: "Fehler",
          description: "Profile konnten nicht geladen werden.",
          variant: "destructive"
        })
      } else {
        setAllProfiles(data || [])
      }
      setProfilesLoading(false)
    }
    fetchProfiles()
  }, [])

  const handleAddMemberRole = async () => {
    if (!newMemberForm.userId || !newMemberForm.role) {
      toast({
        title: "Ungültige Eingabe",
        description: "Bitte wählen Sie einen Benutzer und eine Rolle aus.",
        variant: "destructive"
      })
      return
    }
    try {
      await addMoveMemberRole(moveId, newMemberForm.userId, newMemberForm.role)
      setNewMemberForm({ userId: '', role: '' })
      setShowAddMemberDialog(false)
    } catch (error) {
      toast({
        title: "Fehler beim Hinzufügen der Rolle",
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
    }
  }

  const handleRemoveMemberRole = async (roleId: string) => {
    try {
      await removeMoveMemberRole(roleId)
    } catch (error) {
      toast({
        title: "Fehler beim Entfernen der Rolle",
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: "destructive"
      })
    }
  }

  const getProfileDisplayName = (userId: string) => {
    const profile = allProfiles.find(p => p.id === userId)
    return profile?.full_name || profile?.email || 'Unbekannter Benutzer'
  }

  if (!currentMove) {
    return <div className="text-center">Umzug nicht gefunden.</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Rollen im Umzug: {currentMove.name}
        </CardTitle>
        <CardDescription>Verwalte die Rollen der Mitglieder für diesen gemeinsamen Umzug.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Rolle zuweisen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rolle zuweisen</DialogTitle>
                <DialogDescription>Wähle einen Benutzer und eine Rolle für diesen Umzug.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="select-user">Benutzer</Label>
                  <Select
                    value={newMemberForm.userId}
                    onValueChange={(value) => setNewMemberForm({ ...newMemberForm, userId: value })}
                    disabled={profilesLoading}
                  >
                    <SelectTrigger id="select-user">
                      <SelectValue placeholder="Benutzer auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {profilesLoading ? (
                        <SelectItem value="loading" disabled>Lädt Profile...</SelectItem>
                      ) : (
                        allProfiles.map(profile => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.full_name || profile.email}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="select-role">Rolle</Label>
                  <Select
                    value={newMemberForm.role}
                    onValueChange={(value) => setNewMemberForm({ ...newMemberForm, role: value })}
                  >
                    <SelectTrigger id="select-role">
                      <SelectValue placeholder="Rolle auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOVE_ROLES.map(role => (
                        <SelectItem key={role.key} value={role.key}>
                          <div className="flex items-center">
                            {role.icon && React.createElement(role.icon, { className: "mr-2" })}
                            {role.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>Abbrechen</Button>
                <Button onClick={handleAddMemberRole}>Rolle zuweisen</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {currentMove.members_roles && currentMove.members_roles.length > 0 ? (
          <div className="grid gap-3">
            {currentMove.members_roles.map((memberRole) => (
              <div key={memberRole.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{getProfileDisplayName(memberRole.user_id).charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{getProfileDisplayName(memberRole.user_id)}</p>
                    <Badge variant="secondary" className="mt-1">
                      {getMoveRoleByKey(memberRole.role)?.icon && React.createElement(getMoveRoleByKey(memberRole.role)!.icon, { className: "mr-1" })}
                      {getMoveRoleByKey(memberRole.role)?.name || memberRole.role}
                    </Badge>
                  </div>
                </div>
                {user?.id === currentMove.created_by && ( // Only move creator can remove roles
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Rolle entfernen</AlertDialogTitle>
                        <AlertDialogDescription>
                          Möchtest du die Rolle &apos;{getMoveRoleByKey(memberRole.role)?.name || memberRole.role}&apos; für &apos;{getProfileDisplayName(memberRole.user_id)}&apos; wirklich entfernen?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveMemberRole(memberRole.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Entfernen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Noch keine Rollen für diesen Umzug zugewiesen.</p>
        )}
      </CardContent>
    </Card>
  )
}
