/**
 * Hook para manejar el estado de modales
 */
import { useState, useCallback } from 'react'

interface UseModalResult<T = undefined> {
  isOpen: boolean
  data: T | undefined
  open: (data?: T) => void
  close: () => void
  toggle: () => void
}

export function useModal<T = undefined>(initialOpen = false): UseModalResult<T> {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [data, setData] = useState<T | undefined>(undefined)

  const open = useCallback((modalData?: T) => {
    setData(modalData)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    // Limpiamos data despues de un delay para permitir animaciones
    setTimeout(() => setData(undefined), 300)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  }
}

export default useModal
