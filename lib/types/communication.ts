/**
 * Tipos de Comunicacion
 */

export interface Appointment {
  id: string
  propertyId: string
  userId: string
  agentId?: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  read: boolean
  createdAt: string
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage?: string
  lastMessageDate?: string
  unreadCount: number
  propertyId?: string
}

export interface Document {
  id: string
  name: string
  type: string
  url: string
  uploadDate: string
  status: 'pending' | 'approved' | 'rejected'
}
