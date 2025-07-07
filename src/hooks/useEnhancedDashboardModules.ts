
import { ReactNode } from 'react'

export interface DashboardModule {
  id: string
  title: string
  icon: ReactNode
  component: ReactNode
  enabled: boolean
  category: 'primary' | 'secondary'
  description: string
  size: 'small' | 'medium' | 'large'
}
