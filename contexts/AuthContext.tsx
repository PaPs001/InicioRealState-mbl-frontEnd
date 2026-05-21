import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { User, UserRole, Property, PropertyLead, Appointment, Notification } from '@/lib/types'
import { mockUsers, mockProperties, mockLeads, mockAppointments, mockNotifications } from '@/lib/mock-data'
import { CataLogData } from '@/lib/api-catalog-data'

interface AuthContextType {
  currentUser: User | null
  authToken: string | null
  isLoading: boolean
  isLoggedIn: boolean
  
  isInvestor: boolean
  isSearching: boolean
  isTenant: boolean
  isAgent: boolean
  isAdmin: boolean
  isClient: boolean
  
  login: (userId: string) => Promise<void>
  logout: () => Promise<void>
  setCurrentUser: (user: BackendUser | User | null) => void
  setAuthSession: (user: BackendUser | User | null, token: string | null) => Promise<void>
  
  userProperties: Property[]
  availableProperties: Property[]
  catalogProperties: Property[]
  isCatalogLoading: boolean
  hasLoadedCatalog: boolean
  userLeads: PropertyLead[]
  userAppointments: Appointment[]
  notifications: Notification[]
  
  favorites: string[]
  toggleFavorite: (propertyId: string) => void
  isFavorite: (propertyId: string) => boolean
  
  getPropertyById: (id: string) => Property | undefined
  loadCatalogProperties: () => Promise<void>
  
  markNotificationAsRead: (id: string) => void
  unreadNotificationsCount: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const AUTH_USER_STORAGE_KEY = 'authUser'
const AUTH_TOKEN_STORAGE_KEY = 'authToken'
const CURRENT_USER_ID_STORAGE_KEY = 'currentUserId'

type BackendUser = Partial<User> & {
  _id?: string
  userId?: string
  roles?: string[]
}

function mapBackendRoleToAppRole(roles?: string[], role?: string): UserRole {
  const normalizedRoles = roles?.map(item => item.toUpperCase()) ?? []
  const normalizedRole = role?.toUpperCase()

  if (normalizedRoles.includes('CLIENT') || normalizedRole === 'CLIENT') {
    return 'searching'
  }

  if (normalizedRoles.includes('AGENT') || normalizedRole === 'AGENT') {
    return 'agent'
  }

  if (normalizedRoles.includes('ADMIN') || normalizedRole === 'ADMIN') {
    return 'admin'
  }

  if (normalizedRole === 'INVESTOR') {
    return 'investor'
  }

  if (normalizedRole === 'TENANT') {
    return 'tenant'
  }

  if (normalizedRole === 'SEARCHING') {
    return 'searching'
  }

  return 'searching'
}

function normalizeUser(user: BackendUser | User | null): User | null {
  if (!user) return null

  const backendUser = user as BackendUser

  return {
    id: user.id ?? backendUser._id ?? backendUser.userId ?? '',
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    role: mapBackendRoleToAppRole(backendUser.roles, user.role ? String(user.role) : undefined),
    avatar: user.avatar,
    createdAt: user.createdAt ?? new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [catalogProperties, setCatalogProperties] = useState<Property[]>([])
  const [isCatalogLoading, setIsCatalogLoading] = useState(false)
  const [hasLoadedCatalog, setHasLoadedCatalog] = useState(false)

  useEffect(() => {
    loadStoredUser()
  }, [])

  const setCurrentUser = (user: BackendUser | User | null) => {
    setCurrentUserState(normalizeUser(user))
  }

  const setAuthSession = async (user: BackendUser | User | null, token: string | null) => {
    const normalizedUser = normalizeUser(user)
    setCurrentUserState(normalizedUser)
    setAuthToken(token)

    if (normalizedUser?.id) {
      await AsyncStorage.setItem(CURRENT_USER_ID_STORAGE_KEY, normalizedUser.id)
      await AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(normalizedUser))
    } else {
      await AsyncStorage.removeItem(CURRENT_USER_ID_STORAGE_KEY)
      await AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY)
    }

    if (token) {
      await AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    } else {
      await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    }
  }

  const loadStoredUser = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem(CURRENT_USER_ID_STORAGE_KEY)
      const storedAuthToken = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
      const storedAuthUser = await AsyncStorage.getItem(AUTH_USER_STORAGE_KEY)
      setAuthToken(storedAuthToken)
      if (storedAuthUser) {
        setCurrentUserState(JSON.parse(storedAuthUser) as User)
      }
      if (storedUserId) {
        const storedFavorites = await AsyncStorage.getItem(`favorites_${storedUserId}`)
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites))
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
      setAuthToken(null)
      await AsyncStorage.setItem(CURRENT_USER_ID_STORAGE_KEY, userId)
      await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
      await AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY)
      const storedFavorites = await AsyncStorage.getItem(`favorites_${userId}`)
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites))
      } else {
        setFavorites([])
      }
    }
  }

  const logout = async () => {
    setCurrentUserState(null)
    setAuthToken(null)
    setFavorites([])
    await AsyncStorage.removeItem(CURRENT_USER_ID_STORAGE_KEY)
    await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    await AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY)
  }

  const isInvestor = currentUser?.role === 'investor'
  const isSearching = currentUser?.role === 'searching'
  const isTenant = currentUser?.role === 'tenant'
  const isAgent = currentUser?.role === 'agent'
  const isAdmin = currentUser?.role === 'admin'
  const isClient = isInvestor || isSearching || isTenant

  const userProperties = mockProperties.filter(p => p.ownerId === currentUser?.id)
  
  const propertySource = hasLoadedCatalog ? catalogProperties : mockProperties
  const availableProperties = propertySource.filter(p => {
    if (p.ownerId === currentUser?.id) return false
    if (!isAgent && !isAdmin && (p.status === 'pending_sale' || p.status === 'pending_rent')) {
      return false
    }
    return true
  })

  const userLeads = isAgent || isAdmin 
    ? mockLeads.filter(l => isAdmin || l.agentId === currentUser?.id)
    : []

  const userAppointments = mockAppointments.filter(a => {
    if (isClient) return a.userId === currentUser?.id
    if (isAgent || isAdmin) return isAdmin || a.agentId === currentUser?.id
    return false
  })

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

  const getPropertyById = (id: string) =>
    catalogProperties.find(p => p.id === id) ?? mockProperties.find(p => p.id === id)

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
      authToken,
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
      setAuthSession,
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
