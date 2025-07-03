import { ReactNode } from 'react'
import { TopNav } from './TopNav'
import { Footer } from './Footer'
import { FloatingChatButton } from '../ai/FloatingChatButton'
import { useHouseholds } from '@/hooks/useHouseholds'

export const AppShell = ({ children }: { children: ReactNode }) => {
  console.log('AppShell: Rendering...')
  
  const { households, loading } = useHouseholds()
  const activeHousehold = households && households.length > 0 ? households[0] : undefined

  console.log('AppShell: Households:', households?.length, 'Loading:', loading)

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 p-4">{children}</main>
      <Footer />
      
      {/* Global Floating Chat Button - only show when not loading and household exists */}
      {!loading && activeHousehold && (
        <FloatingChatButton household={activeHousehold} />
      )}
    </div>
  )
}
