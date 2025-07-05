import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  LayoutDashboard, 
  CalendarDays, 
  Crown, 
  Users, 
  ClipboardList, 
  Lightbulb
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useHouseholds } from '@/hooks/useHouseholds'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import { UpgradeCTA } from '@/components/premium/UpgradeCTA'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  premium?: boolean
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Timeline', to: '/timeline', icon: <CalendarDays className="h-5 w-5" /> },
  { label: 'Haushalte', to: '/household-module', icon: <Home className="h-5 w-5" /> },
  { label: 'Umzüge', to: '/moves', icon: <CalendarDays className="h-5 w-5" /> },
  { label: 'Checkliste', to: '/checklist', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Insights', to: '/insights', icon: <Lightbulb className="h-5 w-5" /> },
]

const settingsNavItems: NavItem[] = [
  { label: 'Einstellungen', to: '/settings', icon: <Settings className="h-5 w-5" /> },
  { label: 'Premium', to: '/premium', icon: <Crown className="h-5 w-5" />, premium: true },
]

export const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { households } = useHouseholds()
  const { status: premiumStatus, loading: premiumLoading } = usePremiumStatus()

  const getInitials = (name: string | null | undefined) => {
    if (!name) return ''
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const userDisplayName = user?.user_metadata?.full_name || user?.email || 'Gast'
  const userInitials = getInitials(userDisplayName)

  const renderNavItem = (item: NavItem) => (
    <Link
      key={item.to}
      to={item.to}
      className={`flex items-center space-x-3 p-2 rounded-md ${location.pathname === item.to ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
    >
      {item.icon}
      <span className="flex-1">{item.label}</span>
      {item.premium && premiumStatus?.is_premium && (
        <Badge variant="outline" className="text-xs">
          <Crown className="h-3 w-3 mr-1" />
          Aktiv
        </Badge>
      )}
    </Link>
  )



  return (
    <>
      {/* Mobile Sidebar Trigger */}
      <div className="md:hidden flex items-center p-4 border-b border-border">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Navigation öffnen</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full bg-background">
              <div className="p-4 border-b border-border flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{userDisplayName}</p>
                  {user?.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                  {!premiumLoading && premiumStatus?.is_premium && (
                    <Badge variant="outline" className="text-xs mt-1">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium {premiumStatus.premium_mode === 'monthly' ? '(Abo)' : '(Einmalig)'}
                    </Badge>
                  )}
                </div>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {mainNavItems.map(renderNavItem)}
                <Separator className="my-4" />
                {settingsNavItems.map(renderNavItem)}
              </nav>
              <div className="p-4 border-t border-border">
                {!premiumLoading && !premiumStatus?.is_premium && (
                  <div className="mb-4">
                    <UpgradeCTA />
                  </div>
                )}
                <Button variant="ghost" onClick={signOut} className="w-full justify-start text-red-600">
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Abmelden</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link to="/" className="text-lg font-bold text-primary ml-4">
          muutto
        </Link>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-background h-screen sticky top-0">
        <div className="p-4 border-b border-border flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm">{userDisplayName}</p>
            {user?.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
            {!premiumLoading && premiumStatus?.is_premium && (
              <Badge variant="outline" className="text-xs mt-1">
                <Crown className="h-3 w-3 mr-1" />
                Premium {premiumStatus.premium_mode === 'monthly' ? '(Abo)' : '(Einmalig)'}
              </Badge>
            )}
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {mainNavItems.map(renderNavItem)}
          <Separator className="my-4" />
          {settingsNavItems.map(renderNavItem)}
        </nav>
        <div className="p-4 border-t border-border">
          {!premiumLoading && !premiumStatus?.is_premium && (
            <div className="mb-4">
              <UpgradeCTA />
            </div>
          )}
          <Button variant="ghost" onClick={signOut} className="w-full justify-start text-red-600">
            <LogOut className="mr-2 h-5 w-5" />
            <span>Abmelden</span>
          </Button>
        </div>
      </aside>
    </>
  )
}
