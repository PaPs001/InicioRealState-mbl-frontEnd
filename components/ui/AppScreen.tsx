import type { ReactNode } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import type { Edge } from 'react-native-safe-area-context'

import { createScreenStyles } from '@/lib/style-helpers'
import { useAppTheme } from '@/lib/hooks/useAppTheme'

type AppScreenProps = {
  children: ReactNode
  edges?: Edge[]
}

export function AppScreen({ children, edges = ['top', 'bottom'] }: AppScreenProps) {
  const { theme } = useAppTheme()
  const styles = createScreenStyles(theme)

  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      {children}
    </SafeAreaView>
  )
}

export default AppScreen
