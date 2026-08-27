import { useEffect } from 'react'
import { ActivityIndicator, BackHandler, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useHideBottomNav } from '@/lib/navigation/bottom-nav-visibility'
import { generalColors } from '@/theme'

export function PropertyPdfLoadingScreen() {
  useHideBottomNav()

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => subscription.remove()
  }, [])

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.pdfWorkState}>
        <ActivityIndicator size="large" color="#0c6740" />
        <Text style={styles.pdfWorkTitle}>Cargando PDF</Text>
        <Text style={styles.pdfWorkText}>Preparando el archivo para descargar...</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: generalColors.background,
  },
  pdfWorkState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  pdfWorkTitle: {
    marginTop: 18,
    color: '#0c6740',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  pdfWorkText: {
    marginTop: 8,
    color: '#717171',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
})
