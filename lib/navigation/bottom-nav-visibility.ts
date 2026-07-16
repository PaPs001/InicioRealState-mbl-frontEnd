import { useCallback, useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'

let hiddenRequestCount = 0
const listeners = new Set<(isHidden: boolean) => void>()

function emitVisibility() {
  const isHidden = hiddenRequestCount > 0
  listeners.forEach((listener) => listener(isHidden))
}

function requestHideBottomNav() {
  hiddenRequestCount += 1
  emitVisibility()
}

function releaseHideBottomNav() {
  hiddenRequestCount = Math.max(0, hiddenRequestCount - 1)
  emitVisibility()
}

export function useBottomNavHidden() {
  const [isHidden, setIsHidden] = useState(hiddenRequestCount > 0)

  useEffect(() => {
    listeners.add(setIsHidden)
    return () => {
      listeners.delete(setIsHidden)
    }
  }, [])

  return isHidden
}

export function useHideBottomNav() {
  useFocusEffect(
    useCallback(() => {
      requestHideBottomNav()

      return () => {
        releaseHideBottomNav()
      }
    }, []),
  )
}
