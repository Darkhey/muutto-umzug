import { HouseholdMember } from './household'

export interface Invitation extends HouseholdMember {
  households: {
    name: string
    move_date: string
  }
}
