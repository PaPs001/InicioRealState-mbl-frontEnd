import type { User, Property, PropertyLead, Appointment, Notification, Commission, ActiveRental, Message, Conversation, PropertyEarnings } from './types'

// Usuarios de ejemplo
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Carlos Rodriguez',
    email: 'carlos@email.com',
    phone: '+52 55 1234 5678',
    role: 'investor',
    referralCode: 'CARLOS2024',
    createdAt: '2024-01-15',
  },
  {
    id: 'user-2',
    name: 'Maria Garcia',
    email: 'maria@email.com',
    phone: '+52 55 2345 6789',
    role: 'searching',
    referralCode: 'MARIA2024',
    createdAt: '2024-02-20',
  },
  {
    id: 'user-3',
    name: 'Juan Martinez',
    email: 'juan@email.com',
    phone: '+52 55 3456 7890',
    role: 'tenant',
    referralCode: 'JUAN2024',
    createdAt: '2024-03-10',
  },
  {
    id: 'user-4',
    name: 'Ana Lopez',
    email: 'ana@iniciorealestate.com',
    phone: '+52 55 4567 8901',
    role: 'agent',
    createdAt: '2023-06-01',
  },
  {
    id: 'user-5',
    name: 'Roberto Sanchez',
    email: 'roberto@iniciorealestate.com',
    phone: '+52 55 5678 9012',
    role: 'admin',
    createdAt: '2023-01-01',
  },
]

// Propiedades de ejemplo
export const mockProperties: Property[] = [
  {
    id: 'prop-1',
    title: 'Casa Moderna en Polanco',
    address: 'Av. Presidente Masaryk 123',
    city: 'Ciudad de Mexico',
    price: 8500000,
    currentValue: 9200000,
    type: 'house',
    status: 'owned',
    bedrooms: 4,
    bathrooms: 3,
    sqMeters: 350,
    description: 'Hermosa casa moderna con acabados de lujo',
    amenities: ['Jardin', 'Alberca', 'Estacionamiento 3 autos'],
    features: ['Jardin', 'Alberca', 'Estacionamiento 3 autos'],
    ownerId: 'user-1',
    agentId: 'user-4',
    createdAt: '2024-01-20',
  },
  {
    id: 'prop-2',
    title: 'Departamento Vista al Mar',
    address: 'Blvd. Kukulcan Km 12',
    city: 'Cancun',
    price: 4200000,
    type: 'apartment',
    status: 'for_sale',
    bedrooms: 2,
    bathrooms: 2,
    sqMeters: 120,
    description: 'Departamento con vista panoramica al mar',
    amenities: ['Vista al mar', 'Gimnasio', 'Seguridad 24/7'],
    features: ['Vista al mar', 'Gimnasio', 'Seguridad 24/7'],
    agentId: 'user-4',
    createdAt: '2024-02-15',
  },
  {
    id: 'prop-3',
    title: 'Penthouse en Santa Fe',
    address: 'Av. Santa Fe 500',
    city: 'Ciudad de Mexico',
    price: 12000000,
    type: 'apartment',
    status: 'for_rent',
    bedrooms: 3,
    bathrooms: 3,
    sqMeters: 280,
    monthlyRent: 85000,
    description: 'Penthouse de lujo con terraza privada',
    amenities: ['Terraza', 'Vista panoramica', 'Amenidades'],
    features: ['Terraza', 'Vista panoramica', 'Amenidades'],
    agentId: 'user-4',
    createdAt: '2024-03-01',
  },
  {
    id: 'prop-4',
    title: 'Terreno en Tulum',
    address: 'Carretera Tulum-Boca Paila',
    city: 'Tulum',
    price: 2800000,
    type: 'land',
    status: 'available',
    sqMeters: 1500,
    description: 'Terreno ideal para desarrollo turistico',
    amenities: ['Cerca de la playa', 'Servicios disponibles'],
    features: ['Cerca de la playa', 'Servicios disponibles'],
    agentId: 'user-4',
    createdAt: '2024-03-15',
  },
  {
    id: 'prop-5',
    title: 'Casa Colonial en Centro',
    address: 'Calle 60 x 47',
    city: 'Merida',
    price: 5500000,
    type: 'house',
    status: 'rented',
    bedrooms: 5,
    bathrooms: 4,
    sqMeters: 420,
    monthlyRent: 45000,
    description: 'Casa colonial restaurada en el centro historico',
    amenities: ['Patio interior', 'Techos altos', 'Acabados originales'],
    features: ['Patio interior', 'Techos altos', 'Acabados originales'],
    ownerId: 'user-1',
    agentId: 'user-4',
    createdAt: '2024-01-10',
  },
]

// Leads de ejemplo
export const mockLeads: PropertyLead[] = [
  {
    id: 'lead-1',
    propertyId: 'prop-2',
    agentId: 'user-4',
    name: 'Pedro Hernandez',
    phone: '+52 55 1111 2222',
    email: 'pedro@email.com',
    status: 'nuevo',
    source: 'Facebook',
    createdDate: '2024-05-01',
  },
  {
    id: 'lead-2',
    propertyId: 'prop-3',
    agentId: 'user-4',
    name: 'Laura Diaz',
    phone: '+52 55 3333 4444',
    email: 'laura@email.com',
    status: 'contactado',
    source: 'Instagram',
    createdDate: '2024-04-28',
    lastContactDate: '2024-05-02',
  },
  {
    id: 'lead-3',
    propertyId: 'prop-2',
    agentId: 'user-4',
    name: 'Miguel Torres',
    phone: '+52 55 5555 6666',
    status: 'cita_agendada',
    source: 'Referido',
    createdDate: '2024-04-20',
    lastContactDate: '2024-05-01',
  },
  {
    id: 'lead-4',
    propertyId: 'prop-4',
    agentId: 'user-4',
    name: 'Sofia Ruiz',
    phone: '+52 55 7777 8888',
    email: 'sofia@empresa.com',
    status: 'negociando',
    source: 'Sitio Web',
    createdDate: '2024-04-15',
    lastContactDate: '2024-05-03',
  },
]

// Citas de ejemplo
export const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    propertyId: 'prop-2',
    userId: 'user-2',
    agentId: 'user-4',
    date: '2024-05-10',
    time: '10:00',
    status: 'confirmed',
    createdAt: '2024-05-01',
  },
  {
    id: 'apt-2',
    propertyId: 'prop-3',
    userId: 'user-2',
    agentId: 'user-4',
    date: '2024-05-12',
    time: '15:00',
    status: 'pending',
    createdAt: '2024-05-02',
  },
]

// Notificaciones de ejemplo
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    title: 'Actualizacion de valor',
    message: 'Tu propiedad en Polanco ha incrementado su valor estimado',
    type: 'success',
    read: false,
    createdAt: '2024-05-05T10:00:00',
  },
  {
    id: 'notif-2',
    userId: 'user-4',
    title: 'Nuevo lead asignado',
    message: 'Se te ha asignado un nuevo lead para la propiedad en Cancun',
    type: 'info',
    read: false,
    createdAt: '2024-05-05T09:30:00',
  },
]

// Comisiones de ejemplo
export const mockCommissions: Commission[] = [
  {
    id: 'comm-1',
    agentId: 'user-4',
    propertyId: 'prop-5',
    transactionType: 'rent',
    amount: 4500,
    rate: 10,
    status: 'paid',
    createdDate: '2024-01-15',
    paidDate: '2024-02-01',
  },
  {
    id: 'comm-2',
    agentId: 'user-4',
    propertyId: 'prop-2',
    transactionType: 'sale',
    amount: 210000,
    rate: 5,
    status: 'pending',
    createdDate: '2024-05-01',
  },
]

// Renta activa de ejemplo (para inquilinos)
export const mockActiveRental: ActiveRental = {
  id: 'rental-1',
  propertyId: 'prop-5',
  tenantId: 'user-3',
  landlordId: 'user-1',
  agentId: 'user-4',
  startDate: '2024-01-15',
  endDate: '2025-01-15',
  monthlyRent: 45000,
  paymentDay: 5,
  depositAmount: 90000,
  rules: [
    'No se permiten mascotas grandes',
    'Horario de silencio de 10pm a 8am',
    'No se permite subarrendar',
    'Mantenimiento de jardin incluido',
    'Maximo 4 ocupantes',
  ],
  utilities: {
    electricity: {
      provider: 'CFE',
      phone: '071',
      accountNumber: '123456789012',
    },
    water: {
      provider: 'SAPAS',
      phone: '+52 55 5555 1234',
      accountNumber: '987654321',
    },
    gas: {
      provider: 'Gas Natural',
      phone: '+52 55 5555 5678',
      accountNumber: 'GN-456789',
    },
    internet: {
      provider: 'Telmex',
      phone: '800 123 4567',
      accountNumber: 'TEL-789012',
    },
  },
  documents: [
    {
      id: 'doc-1',
      name: 'Contrato de arrendamiento',
      type: 'contract',
      url: '/documents/contrato.pdf',
      uploadDate: '2024-01-15',
      status: 'approved',
    },
    {
      id: 'doc-2',
      name: 'Inventario inicial',
      type: 'inventory',
      url: '/documents/inventario.pdf',
      uploadDate: '2024-01-15',
      status: 'approved',
    },
  ],
  status: 'active',
}

// Conversaciones de ejemplo
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: ['user-1', 'user-4'],
    lastMessage: 'Claro, te envio los documentos manana',
    lastMessageDate: '2024-05-05T14:30:00',
    unreadCount: 2,
    propertyId: 'prop-1',
  },
  {
    id: 'conv-2',
    participants: ['user-1', 'user-3'],
    lastMessage: 'Ya realice el deposito de este mes',
    lastMessageDate: '2024-05-04T10:15:00',
    unreadCount: 0,
    propertyId: 'prop-5',
  },
  {
    id: 'conv-3',
    participants: ['user-2', 'user-4'],
    lastMessage: 'Perfecto, nos vemos el jueves para la visita',
    lastMessageDate: '2024-05-03T16:45:00',
    unreadCount: 1,
    propertyId: 'prop-2',
  },
  {
    id: 'conv-4',
    participants: ['user-3', 'user-4'],
    lastMessage: 'El plomero pasara manana entre 10 y 12',
    lastMessageDate: '2024-05-02T09:20:00',
    unreadCount: 0,
    propertyId: 'prop-5',
  },
]

// Mensajes de ejemplo
export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-4',
    receiverId: 'user-1',
    content: 'Buenos dias, le escribo para informarle sobre el estado de su propiedad',
    read: true,
    createdAt: '2024-05-05T14:00:00',
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-1',
    receiverId: 'user-4',
    content: 'Hola Ana, gracias por el seguimiento. Como va todo?',
    read: true,
    createdAt: '2024-05-05T14:15:00',
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'user-4',
    receiverId: 'user-1',
    content: 'Todo muy bien, el inquilino esta al corriente con los pagos. Necesito enviarle los documentos actualizados',
    read: true,
    createdAt: '2024-05-05T14:20:00',
  },
  {
    id: 'msg-4',
    conversationId: 'conv-1',
    senderId: 'user-1',
    receiverId: 'user-4',
    content: 'Claro, te envio los documentos manana',
    read: false,
    createdAt: '2024-05-05T14:30:00',
  },
]

// Ganancias de propiedades (para inversionistas)
export const mockPropertyEarnings: PropertyEarnings[] = [
  {
    propertyId: 'prop-5',
    totalEarnings: 540000,
    monthlyEarnings: 45000,
    occupancyRate: 100,
    lastPaymentDate: '2024-05-05',
    nextPaymentDate: '2024-06-05',
    paymentHistory: [
      { month: '2024-05', amount: 45000, status: 'paid' },
      { month: '2024-04', amount: 45000, status: 'paid' },
      { month: '2024-03', amount: 45000, status: 'paid' },
      { month: '2024-02', amount: 45000, status: 'paid' },
      { month: '2024-01', amount: 45000, status: 'paid' },
    ],
  },
  {
    propertyId: 'prop-1',
    totalEarnings: 0,
    monthlyEarnings: 0,
    occupancyRate: 0,
    paymentHistory: [],
  },
]

// Funciones auxiliares
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatShortDate(date: string): string {
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  })
}
