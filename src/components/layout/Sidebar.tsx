import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Settings, 
  LogOut, 
  Menu, 
  LayoutDashboard, 
  CalendarDays, 
  Crown, 
  ClipboardList, 
  Lightbulb,
  Package
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
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
  { label: 'Kartonverwaltung', to: '/box-management', icon: <Package className="h-5 w-5" /> },
  { label: 'Umzüge', to: '/moves', icon: <CalendarDays className="h-5 w-5" /> },
  { label: 'Checkliste', to: '/checklist', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Insights', to: '/insights', icon: <Lightbulb className="h-5 w-5" />, premium: true },
]

const settingsNavItems: NavItem[] = [
  { label: 'Einstellungen', to: '/settings', icon: <Settings className="h-5 w-5" /> },
  { label: 'Premium', to: '/premium', icon: <Crown className="h-5 w-5" /> },
]

export const Sidebar = () => {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { status: premiumStatus, loading: premiumLoading } = usePremiumStatus()

  const getInitials = (name: string | null | undefined) => {
    if (!name) return ''
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const userDisplayName = user?.user_metadata?.full_name || user?.email || 'Gast'
  const userInitials = getInitials(userDisplayName)

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.to;
    return (
      <Link
        key={item.to}
        to={item.to}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive && 'bg-muted text-primary'}`}>
        {item.icon}
        {item.label}
        {item.premium && !premiumStatus?.is_premium && (
            <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-black">
                <Crown className="h-4 w-4" />
            </Badge>
        )}
      </Link>
    )
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
        <div className="flex h-16 items-center border-b px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
                <Package className="h-6 w-6" />
                <span>muutto</span>
            </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
                {mainNavItems.map(renderNavItem)}
                <Separator className="my-4" />
                {settingsNavItems.map(renderNavItem)}
            </nav>
        </div>
        <div className="mt-auto p-4 border-t">
            {!premiumLoading && !premiumStatus?.is_premium && (
                <div className="mb-4">
                    <UpgradeCTA />
                </div>
            )}
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={userDisplayName} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-semibold text-sm">{userDisplayName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-red-500">
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Navigation öffnen</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            {sidebarContent}
          </SheetContent>
        </Sheet>
        
        <div className="flex-1 flex justify-center">
            <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
                <Package className="h-6 w-6" />
                <span>muutto</span>
            </Link>
        </div>

        {/* Placeholder to center the logo correctly */}
        <div className="w-10" />
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 border-r bg-background h-screen sticky top-0">
        {sidebarContent}
      </aside>
    </>
  )
}