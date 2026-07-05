import { useEffect, useState } from 'react'

let hiddenRequestCount = 0
const listeners = new Set<(isHidden: boolean) => void>()

function emitVisibility() {
  const isHidden = hiddenRequestCount > 0
  listeners.forEach((listener) => listener(isHidden))
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
  useEffect(() => {
    hiddenRequestCount += 1
    emitVisibility()

    return () => {
      hiddenRequestCount = Math.max(0, hiddenRequestCount - 1)
      emitVisibility()
    }
  }, [])
}
