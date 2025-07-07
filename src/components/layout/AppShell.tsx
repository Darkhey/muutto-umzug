
import { ReactNode } from 'react'
import { Footer } from './Footer'
import { FloatingChatButton } from '../ai/FloatingChatButton'
import { useHouseholds } from '@/hooks/useHouseholds'
import { Sidebar } from './Sidebar'

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { households, loading } = useHouseholds()
  const activeHousehold = households && households.length > 0 ? households[0] : undefined

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex">
      <Sidebar />
      <div className="flex flex-col flex-1 md:pl-0">
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
        <Footer />
      </div>
      {!loading && activeHousehold && (
        <FloatingChatButton household={activeHousehold} />
      )}
    </div>
  )
}
