
import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  Home, Calendar, Settings, Move, Crown, Package, TrendingUp, 
  Menu, X, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { APP_CONFIG } from '@/config/app'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Timeline', href: '/timeline', icon: Calendar },
  { name: 'Umzüge', href: '/moves', icon: Move },
  { name: 'Kartons', href: '/box-management', icon: Package },
  { name: 'Insights', href: '/insights', icon: TrendingUp },
  { name: 'Premium', href: '/premium', icon: Crown },
  { name: 'Einstellungen', href: '/settings', icon: Settings },
]

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { signOut } = useAuth()

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const toggleSidebar = () => setIsOpen(!isOpen)

  const handleLogout = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSidebar}
          className="bg-white shadow-md"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{APP_CONFIG.name}</h1>
                <p className="text-xs text-gray-500">Dein Umzugsplaner</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                  )} />
                  {item.name}
                  {item.name === 'Premium' && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Neu
                    </Badge>
                  )}
                  {isActive && (
                    <ChevronRight className="ml-auto h-4 w-4 text-blue-500" />
                  )}
                </NavLink>
              )
            })}
          </nav>

          <Separator />

          {/* Footer */}
          <div className="p-4 text-center">
            <Button
              variant="outline"
              className="w-full mb-2"
              onClick={handleLogout}
            >
              Abmelden
            </Button>
            <p className="text-xs text-gray-500">
              Version {APP_CONFIG.version}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
