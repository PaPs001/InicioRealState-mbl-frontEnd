export type RentalType = 'with_us' | 'external' | null
export type AddDataNow = 'now' | 'later' | null

export interface RentalData {
  startDate: string
  endDate: string
  rentalType: 'house' | 'apartment' | 'room' | 'office' | ''
  location: string
  landlordName: string
  landlordPhone: string
  agentName: string
  agentPhone: string
  monthlyRent: string
  photos: string[]
  documents: string[]
}
