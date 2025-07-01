import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface HouseholdInfo {
  name: string
  move_date: string
}

const JoinHousehold = ({ code }: { code: string }) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [household, setHousehold] = useState<HouseholdInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    const fetchHousehold = async () => {
      const { data, error } = await supabase
        .from('households')
        .select('name, move_date')
        .eq('invitation_code', code)
        .single()
      if (error || !data) {
        toast({
          title: 'Ungültige Einladung',
          description: 'Dieser Einladungslink ist nicht mehr gültig.',
          variant: 'destructive'
        })
        setLoading(false)
        return
      }
      setHousehold(data as HouseholdInfo)
      setLoading(false)
    }
    fetchHousehold()
  }, [code, toast])

  const handleJoin = async () => {
    if (!user) {
      navigate('/?login')
      return
    }
    setJoining(true)
    const { error } = await supabase.rpc('join_household_by_code', {
      p_invitation_code: code,
      p_user_id: user.id,
      p_user_name: user.user_metadata?.full_name || user.email || 'Unbekannt',
      p_user_email: user.email || ''
    })
    if (error) {
      toast({
        title: 'Beitritt fehlgeschlagen',
        description: error.message,
        variant: 'destructive'
      })
    } else {
      toast({ title: 'Haushalt beigetreten' })
      navigate('/')
    }
    setJoining(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Lädt...</div>
    )
  }

  if (!household) {
    return (
      <div className="min-h-screen flex items-center justify-center">Einladung nicht gefunden.</div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Haushalt beitreten</CardTitle>
          <CardDescription>
            Du wurdest zu "{household.name}" eingeladen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleJoin}
              disabled={joining}
            >
              {joining ? 'Beitreten...' : 'Haushalt beitreten'}
            </Button>
          ) : (
            <p className="text-center text-gray-600">Bitte melde dich an, um beizutreten.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default JoinHousehold
