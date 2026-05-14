import { useEffect } from 'react'
import { useRouter } from 'expo-router'

// Este componente redirige a la pantalla standalone de mensajes
export default function MessagesTab() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/messages-screen')
  }, [router])

  return null
}
