import { ReactNode } from 'react'
import { Footer } from './Footer'
import { FloatingChatButton } from '../ai/FloatingChatButton'
import { useHouseholds } from '@/hooks/useHouseholds'
import { Sidebar } from './Sidebar'

export const AppShell = ({ children }: { children: ReactNode }) => {
  console.log('AppShell: Rendering...')
  
  const { households, loading } = useHouseholds()
  const activeHousehold = households && households.length > 0 ? households[0] : undefined

  console.log('AppShell: Households:', households?.length, 'Loading:', loading)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <main className="flex-1 p-4">{children}</main>
        <Footer />
        
        {/* Global Floating Chat Button - only show when not loading and household exists */}
        {!loading && activeHousehold && (
          <FloatingChatButton household={activeHousehold} />
        )}
      </div>
    </div>
  )
}