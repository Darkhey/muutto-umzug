import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthResponse } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ExtendedUser extends User {
  profile?: Profile | null;
}

interface AuthContextType {
  user: ExtendedUser | null
  session: Session | null
  signUp: (email: string, password: string, fullName?: string) => Promise<AuthResponse>
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<{ error: Error | null }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('AuthContext: Initializing...')
    
    const fetchUserProfile = async (userId: string) => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }
      return profile
    }

    const handleAuthChange = async (session: Session | null) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id)
        setUser({ ...session.user, profile })
      } else {
        setUser(null)
      }
      setSession(session)
      setLoading(false)
    }

    try {
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('AuthContext: Auth state changed:', event, session?.user?.email)
          handleAuthChange(session)
        }
      )

      // Check for existing session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error('AuthContext: Error getting session:', error)
        } else {
          console.log('AuthContext: Initial session:', session?.user?.email)
        }
        handleAuthChange(session)
      }).catch((error) => {
        console.error('AuthContext: Failed to get session:', error)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('AuthContext: Failed to initialize:', error)
      setLoading(false)
    }
  }, [])

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || ''
        }
      }
    })
    return { error, data }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signUp,
      signIn,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}