import { ReactNode } from 'react'
import { TopNav } from './TopNav'

export const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 p-4">{children}</main>
    </div>
  )
}
