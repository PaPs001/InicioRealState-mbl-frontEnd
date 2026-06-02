import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { User, UserProfile, BackendUserRole, Property, PropertyLead, Appointment, Notification } from '@/lib/types'
import { mockUsers, mockProperties, mockLeads, mockAppointments, mockNotifications } from '@/lib/mock-data'
import { 
  getAllCatalogProperties,
  getAllAgentCatalogProperties, 
  PropertyCatalogItemResponse, 
  addFavoriteProperty,
  getCatalogPropertiesCoreAPI,
  getFavoriteProperties,
  deleteFavoriteProperties
} from '@/lib/api/endpoints/catalog'
import { getCurrentUser } from '@/lib/api/endpoints/auth'

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
  agentCatalogProperties: Property[]
  agentCatalogRawData: PropertyCatalogItemResponse[]
  isCatalogLoading: boolean
  isAgentCatalogLoading: boolean
  hasLoadedCatalog: boolean
  hasLoadedAgentCatalog: boolean
  userLeads: PropertyLead[]
  userAppointments: Appointment[]
  notifications: Notification[]
  favoriteProperties: Property[]
  
  favorites: string[]
  loadFavoriteProperties: () => Promise<void>
  addNewFavoriteProperty: (propertyId: string) => Promise<void>
  toggleFavorite: (propertyId: string) => Promise<void>
  isFavorite: (propertyId: string) => boolean
  newLoadCatalogProperties: () => Promise<void>
  getPropertyById: (id: string) => Property | undefined
  loadCatalogProperties: () => Promise<void>
  loadAgentCatalogProperties: () => Promise<void>
  
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
  roles?: BackendUserRole[]
  permissions?: string[]
  clientProfile?: UserProfile
}

function decodeBase64(value: string): string | null {
  try {
    if (typeof globalThis.atob === 'function') {
      return globalThis.atob(value)
    }

    if (typeof Buffer !== 'undefined') {
      return Buffer.from(value, 'base64').toString('utf-8')
    }

    return null
  } catch {
    return null
  }
}

function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null

  try {
    const [, payload] = token.split('.')
    if (!payload) return null

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    )

    const decodedPayload = decodeBase64(paddedPayload)
    if (!decodedPayload) return null

    const parsedPayload = JSON.parse(decodedPayload) as { userId?: string }
    return parsedPayload.userId ?? null
  } catch {
    return null
  }
}


function mapBackendRolesToSystemRole(roles?: BackendUserRole[], systemRole?: BackendUserRole): BackendUserRole {
  if (systemRole) {
    return systemRole
  }

  if (roles?.includes('ADMIN')) {
    return 'ADMIN'
  }

  if (roles?.includes('COORDINATOR')) {
    return 'COORDINATOR'
  }

  if (roles?.includes('AGENT')) {
    return 'AGENT'
  }

  return 'CLIENT'
}

function mapPermissionsToClientProfile(permissions?: string[], clientProfile?: string): UserProfile {
  const normalizedPermissions = permissions?.map(item => item.toUpperCase()) ?? []
  const normalizedProfile = clientProfile?.toUpperCase()

  if (normalizedProfile === 'INVESTOR' || normalizedPermissions.includes('INVESTOR')) {
    return 'INVESTOR'
  }

  if (normalizedProfile === 'TENANT' || normalizedPermissions.includes('TENANT')) {
    return 'TENANT'
  }

  return 'SEEKER'
}

function normalizeUser(user: BackendUser | User | null): User | null {
  if (!user) return null

  const backendUser = user as BackendUser

  return {
    id: user.id ?? backendUser._id ?? backendUser.userId ?? '',
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    systemRole: mapBackendRolesToSystemRole(backendUser.roles, user.systemRole),
    clientProfile: mapPermissionsToClientProfile(backendUser.permissions, backendUser.clientProfile),
    permissions: backendUser.permissions ?? user.permissions,
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
  const [agentCatalogProperties, setAgentCatalogProperties] = useState<Property[]>([])
  const [agentCatalogRawData, setAgentCatalogRawData] = useState<PropertyCatalogItemResponse[]>([])
  const [isCatalogLoading, setIsCatalogLoading] = useState(false)
  const [isAgentCatalogLoading, setIsAgentCatalogLoading] = useState(false)
  const [hasLoadedCatalog, setHasLoadedCatalog] = useState(false)
  const [hasLoadedAgentCatalog, setHasLoadedAgentCatalog] = useState(false)
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([])

  useEffect(() => {
    loadStoredUser()
  }, [])

  const setCurrentUser = (user: BackendUser | User | null) => {
    setCurrentUserState(normalizeUser(user))
  }

  const setAuthSession = async (user: BackendUser | User | null, token: string | null) => {
    const normalizedUser = normalizeUser(user)
    const tokenUserId = getUserIdFromToken(token)
    const sessionUser = normalizedUser
      ? { ...normalizedUser, id: normalizedUser.id || tokenUserId || '' }
      : null

    console.log('[auth][setAuthSession] input', {
      incomingUserId: normalizedUser?.id ?? null,
      incomingEmail: normalizedUser?.email ?? null,
      incomingSystemRole: normalizedUser?.systemRole ?? null,
      incomingClientProfile: normalizedUser?.clientProfile ?? null,
      tokenUserId,
      hasToken: !!token,
    })

    setCurrentUserState(sessionUser)
    setAuthToken(token)

    if (sessionUser?.id) {
      await AsyncStorage.setItem(CURRENT_USER_ID_STORAGE_KEY, sessionUser.id)
      await AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(sessionUser))
    } else {
      await AsyncStorage.removeItem(CURRENT_USER_ID_STORAGE_KEY)
      await AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY)
    }

    if (token) {
      await AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    } else {
      await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    }

    console.log('[auth][setAuthSession] stored', {
      sessionUserId: sessionUser?.id ?? null,
      sessionEmail: sessionUser?.email ?? null,
      sessionSystemRole: sessionUser?.systemRole ?? null,
      sessionClientProfile: sessionUser?.clientProfile ?? null,
      hasToken: !!token,
    })
  }

  const hydrateSessionFromToken = useCallback(async (token: string) => {
    const backendUser = await getCurrentUser(token)
    await setAuthSession(backendUser, token)
  }, [])

  const loadStoredUser = async () => {
    try {
      const storedAuthToken = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
      const storedAuthUser = await AsyncStorage.getItem(AUTH_USER_STORAGE_KEY)
      const storedUserId = await AsyncStorage.getItem(CURRENT_USER_ID_STORAGE_KEY)

      if (storedAuthToken) {
        try {
          await hydrateSessionFromToken(storedAuthToken)
        } catch (error) {
          console.error('Error hydrating session from token:', error)
          setAuthToken(storedAuthToken)
          if (storedAuthUser) {
            setCurrentUserState(JSON.parse(storedAuthUser) as User)
          }
        }
      } else if (storedAuthUser) {
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
    setFavoriteProperties([])
    await AsyncStorage.removeItem(CURRENT_USER_ID_STORAGE_KEY)
    await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    await AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY)
  }
  const isClient = currentUser?.systemRole === 'CLIENT'
  const isCoordinator = currentUser?.systemRole === 'COORDINATOR'
  const isAgent = currentUser?.systemRole === 'AGENT'
  const isInvestor = currentUser?.clientProfile === 'INVESTOR'
  const isTenant = currentUser?.clientProfile === 'TENANT'
  const isSearching = currentUser?.clientProfile === 'SEEKER'
  const isAdmin = currentUser?.systemRole === 'ADMIN'

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
  const loadFavoriteProperties = useCallback(async () => {
    if(!currentUser?.id){
      setFavoriteProperties([])
      setFavorites([])
      return
    }

    try{
      console.log('loadFavoriteProperties payload:', {
        userId: currentUser.id,
        token: authToken,
      })
      const data = await getFavoriteProperties(currentUser?.id, authToken ?? undefined)
      setFavoriteProperties(data)
      setFavorites(data.map(properties => properties.id))
    }catch(error){
      console.error("Error cargando los datos mi buen amigo", error)
      setFavoriteProperties([])
      setFavorites([])
    }
  }, [currentUser?.id, authToken])

  useEffect(() => {
    loadFavoriteProperties()
  }, [loadFavoriteProperties])

  /*const deleteFavoriteProperty = async (propertyId: string) => {
    if(favorites.includes(propertyId)){
      return
    }

    console.log('deleteFavoriteProperties payload', {
      propertyId,
      token: authToken,
    })

    await deleteFavoriteProperties(propertyId, authToken ?? undefined)
    const deleteFavorites = [...favorites, propertyId]
    
  }*/

  const addNewFavoriteProperty = async (propertyId: string) => {
    if (favorites.includes(propertyId)) {
      return
    }

    console.log('addFavoriteProperty payload:', {
      propertyId,
      token: authToken,
    })

    await addFavoriteProperty(propertyId, authToken ?? undefined)

    const newFavorites = [...favorites, propertyId]
    setFavorites(newFavorites)

    const property = getPropertyById(propertyId)
    if (property) {
      setFavoriteProperties(prev =>
        prev.some(item => item.id === propertyId) ? prev : [...prev, property]
      )
    }

    if (currentUser) {
      await AsyncStorage.setItem(`favorites_${currentUser.id}`, JSON.stringify(newFavorites))
    }
  }

  const toggleFavorite = async (propertyId: string) => {
    if (favorites.includes(propertyId)) {
      console.log('deleteFavoriteProperties payload:', {
        propertyId,
        token: authToken,
      })
      await deleteFavoriteProperties(propertyId, authToken ?? undefined)
      const newFavorites = favorites.filter(id => id !== propertyId)
      setFavorites(newFavorites)
      setFavoriteProperties(prev => prev.filter(property => property.id !== propertyId))

      if (currentUser) {
        await AsyncStorage.setItem(`favorites_${currentUser.id}`, JSON.stringify(newFavorites))
      }

      return
    }

    await addNewFavoriteProperty(propertyId)
  }

  const isFavorite = (propertyId: string) => favorites.includes(propertyId)

  // funciones para cargar catalogos de propiedades
  const loadCatalogProperties = useCallback(async () => {
    setIsCatalogLoading(true)
    setHasLoadedCatalog(true)
    try {
      const properties = await getAllCatalogProperties()
      setCatalogProperties(properties)
    } catch (error) {
      console.error('Error loading catalog properties:', error)
      setCatalogProperties([])
    } finally {
      setIsCatalogLoading(false)
    }
  }, [])

  const newLoadCatalogProperties = useCallback(async () => {
    setIsCatalogLoading(true)
    setHasLoadedCatalog(true)
    try {
      const properties = await getCatalogPropertiesCoreAPI(authToken ?? undefined)
      setCatalogProperties(properties)
    } catch (error) {
      console.error('Error loading catalog properties:', error)
      setCatalogProperties([])
    } finally {
      setIsCatalogLoading(false)
    }
  }, [authToken])

  const loadAgentCatalogProperties = useCallback(async () => {
    setIsAgentCatalogLoading(true)
    setHasLoadedAgentCatalog(true)
    try {
      const { properties, rawData } = await getAllAgentCatalogProperties()
      setAgentCatalogProperties(properties)
      setAgentCatalogRawData(rawData)
    } catch (error) {
      console.error('Error loading agent catalog properties:', error)
      setAgentCatalogProperties([])
      setAgentCatalogRawData([])
    } finally {
      setIsAgentCatalogLoading(false)
    }
  }, [])

  const getPropertyById = (id: string) => {
    return favoriteProperties.find(p => p.id === id) ??
      agentCatalogProperties.find(p => p.id === id) ?? 
      catalogProperties.find(p => p.id === id) ?? 
      mockProperties.find(p => p.id === id)
  }

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
      agentCatalogProperties,
      newLoadCatalogProperties,
      agentCatalogRawData,
      isCatalogLoading,
      isAgentCatalogLoading,
      hasLoadedCatalog,
      hasLoadedAgentCatalog,
      userLeads,
      userAppointments,
      notifications: userNotifications,
      favoriteProperties,
      loadFavoriteProperties,
      favorites,
      addNewFavoriteProperty,
      toggleFavorite,
      isFavorite,
      getPropertyById,
      loadCatalogProperties,
      loadAgentCatalogProperties,
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
