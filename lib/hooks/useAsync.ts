/**
 * Hook para manejar operaciones asincronas con estado de carga y errores
 */
import { useState, useCallback } from 'react'

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  initialData?: T
}

interface UseAsyncResult<T, P extends unknown[]> {
  data: T | null
  error: Error | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  execute: (...params: P) => Promise<T | null>
  reset: () => void
}

export function useAsync<T, P extends unknown[] = []>(
  asyncFunction: (...params: P) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncResult<T, P> {
  const { onSuccess, onError, initialData } = options

  const [data, setData] = useState<T | null>(initialData ?? null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(async (...params: P): Promise<T | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await asyncFunction(...params)
      setData(result)
      onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      onError?.(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [asyncFunction, onSuccess, onError])

  const reset = useCallback(() => {
    setData(initialData ?? null)
    setError(null)
    setIsLoading(false)
  }, [initialData])

  return {
    data,
    error,
    isLoading,
    isSuccess: data !== null && !error,
    isError: error !== null,
    execute,
    reset,
  }
}

export default useAsync
