import { useCallback } from 'react'
import { useFocusEffect, useNavigation } from 'expo-router'

// Direct links must have the same predecessors as navigation from Seguimiento.
export function useTrackingHistory(screen: 'selecting' | 'detail' | 'followups') {
  const navigation = useNavigation()
  useFocusEffect(useCallback(() => {
    const state = navigation.getState()
    if (!state) return
    const current = state.routes[state.index]
    if (current.name !== screen) return
    const params = (current.params || {}) as Record<string, string | undefined>
    const names = ['index']
    if (screen !== 'selecting' && params.status) names.push('selecting')
    if (screen === 'followups') names.push('detail')
    names.push(screen)
    const existing = state.routes.slice(0, state.index + 1).map(route => route.name)
    if (existing.join('/') === names.join('/')) return
    navigation.dispatch({ type: 'RESET', payload: {
      index: names.length - 1,
      routes: names.map(name => ({
        name,
        params: name === 'index' ? undefined : {
          ...params,
          selectedLeadId: params.selectedLeadId || params.leadId,
        },
      })),
    } })
  }, [navigation, screen]))
}
