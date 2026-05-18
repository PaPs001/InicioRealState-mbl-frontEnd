import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { User, UserRole, Property, PropertyLead, Appointment, Notification } from '@/lib/types'
import { mockUsers, mockProperties, mockLeads, mockAppointments, mockNotifications } from '@/lib/mock-data'
import { CataLogData } from '@/lib/api-catalog-data'

interface AuthContextType {
  // Usuario actual
  currentUser: User | null
  isLoading: boolean
  isLoggedIn: boolean
  
  // Roles
  isInvestor: boolean
  isSearching: boolean
  isTenant: boolean
  isAgent: boolean
  isAdmin: boolean
  isClient: boolean
  
  // Acciones de autenticacion
  login: (userId: string) => Promise<void>
  logout: () => Promise<void>
  setCurrentUser: (user: User | null) => void
  
  // Datos del usuario
  userProperties: Property[]
  availableProperties: Property[]
  catalogProperties: Property[]
  isCatalogLoading: boolean
  hasLoadedCatalog: boolean
  userLeads: PropertyLead[]
  userAppointments: Appointment[]
  notifications: Notification[]
  
  // Favoritos
  favorites: string[]
  toggleFavorite: (propertyId: string) => void
  isFavorite: (propertyId: string) => boolean
  
  // Funciones de propiedades
  getPropertyById: (id: string) => Property | undefined
  loadCatalogProperties: () => Promise<void>
  
  // Funciones de notificaciones
  markNotificationAsRead: (id: string) => void
  unreadNotificationsCount: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [catalogProperties, setCatalogProperties] = useState<Property[]>([])
  const [isCatalogLoading, setIsCatalogLoading] = useState(false)
  const [hasLoadedCatalog, setHasLoadedCatalog] = useState(false)

  // Cargar usuario guardado al iniciar
  useEffect(() => {
    loadStoredUser()
  }, [])

  const loadStoredUser = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('currentUserId')
      if (storedUserId) {
        const user = mockUsers.find(u => u.id === storedUserId)
        if (user) {
          setCurrentUser(user)
          const storedFavorites = await AsyncStorage.getItem(`favorites_${storedUserId}`)
          if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites))
          }
        }
      }
    } catch (error) {
      console.error('Error loading stored user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (userId: string) => {
    const user = mockUsers.find(u => u.id === userId)
    if (user) {
      setCurrentUser(user)
      await AsyncStorage.setItem('currentUserId', userId)
      const storedFavorites = await AsyncStorage.getItem(`favorites_${userId}`)
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites))
      } else {
        setFavorites([])
      }
    }
  }

  const logout = async () => {
    setCurrentUser(null)
    setFavorites([])
    await AsyncStorage.removeItem('currentUserId')
  }

  // Roles
  const isInvestor = currentUser?.role === 'investor'
  const isSearching = currentUser?.role === 'searching'
  const isTenant = currentUser?.role === 'tenant'
  const isAgent = currentUser?.role === 'agent'
  const isAdmin = currentUser?.role === 'admin'
  const isClient = isInvestor || isSearching || isTenant

  // Propiedades del usuario
  const userProperties = mockProperties.filter(p => p.ownerId === currentUser?.id)
  
  // Propiedades disponibles (no propias)
  const propertySource = hasLoadedCatalog ? catalogProperties : mockProperties
  const availableProperties = propertySource.filter(p => {
    if (p.ownerId === currentUser?.id) return false
    if (!isAgent && !isAdmin && (p.status === 'pending_sale' || p.status === 'pending_rent')) {
      return false
    }
    return true
  })

  // Leads del usuario (si es agente)
  const userLeads = isAgent || isAdmin 
    ? mockLeads.filter(l => isAdmin || l.agentId === currentUser?.id)
    : []

  // Citas del usuario
  const userAppointments = mockAppointments.filter(a => {
    if (isClient) return a.userId === currentUser?.id
    if (isAgent || isAdmin) return isAdmin || a.agentId === currentUser?.id
    return false
  })

  // Favoritos
  const toggleFavorite = async (propertyId: string) => {
    const newFavorites = favorites.includes(propertyId)
      ? favorites.filter(id => id !== propertyId)
      : [...favorites, propertyId]
    setFavorites(newFavorites)
    if (currentUser) {
      await AsyncStorage.setItem(`favorites_${currentUser.id}`, JSON.stringify(newFavorites))
    }
  }

  const isFavorite = (propertyId: string) => favorites.includes(propertyId)

  const loadCatalogProperties = useCallback(async () => {
    setIsCatalogLoading(true)
    setHasLoadedCatalog(true)
    try {
      const properties = await CataLogData()
      setCatalogProperties(properties)
    } catch (error) {
      console.error('Error loading catalog properties:', error)
      setCatalogProperties([])
    } finally {
      setIsCatalogLoading(false)
    }
  }, [])

  // Obtener propiedad por ID
  const getPropertyById = (id: string) =>
    catalogProperties.find(p => p.id === id) ?? mockProperties.find(p => p.id === id)

  // Notificaciones
  const userNotifications = notifications.filter(n => n.userId === currentUser?.id)
  const unreadNotificationsCount = userNotifications.filter(n => !n.read).length

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoading,
      isLoggedIn: !!currentUser,
      isInvestor,
      isSearching,
      isTenant,
      isAgent,
      isAdmin,
      isClient,
      login,
      logout,
      setCurrentUser,
      userProperties,
      availableProperties,
      catalogProperties,
      isCatalogLoading,
      hasLoadedCatalog,
      userLeads,
      userAppointments,
      notifications: userNotifications,
      favorites,
      toggleFavorite,
      isFavorite,
      getPropertyById,
      loadCatalogProperties,
      markNotificationAsRead,
      unreadNotificationsCount,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
