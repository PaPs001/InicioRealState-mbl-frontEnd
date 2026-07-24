import { useState } from 'react'
import { Building2, Home, Map } from 'lucide-react-native'
import { useLocalSearchParams } from 'expo-router'
import { useAppTheme } from './useAppTheme'
import {
  getPortfolioPropertyDetail,
  getPortfolioPropertyIncomeProjection,
} from '@/lib/services/property-portfolio'

export type PortfolioPropertyTab = 'general' | 'tenant' | 'earnings'

export function usePortfolioPropertyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { theme } = useAppTheme()
  const [activeTab, setActiveTab] = useState<PortfolioPropertyTab>('general')

  const detail = getPortfolioPropertyDetail(id)
  const property = detail.property
  const isRented = property?.status === 'rented'
  const incomeProjection = property ? getPortfolioPropertyIncomeProjection(property) : null

  const PropertyIcon =
    property?.type === 'house'
      ? Home
      : property?.type === 'apartment'
        ? Building2
        : Map

  return {
    theme,
    activeTab,
    setActiveTab,
    ...detail,
    isRented,
    incomeProjection,
    PropertyIcon,
  }
}

export default usePortfolioPropertyDetail
