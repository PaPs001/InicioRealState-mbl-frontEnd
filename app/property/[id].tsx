import { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'
import { formatCurrency } from '@/lib/mock-data'
import { 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize,
  Home,
  Building2,
  Map,
  Calendar,
  Phone,
  MessageCircle,
  X,
  Check
} from 'lucide-react-native'

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { getPropertyById, isFavorite, toggleFavorite, isClient } = useAuth()
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')

  const property = getPropertyById(id || '')
  const favorite = property ? isFavorite(property.id) : false

  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Propiedad no encontrada</Text>
        </View>
      </SafeAreaView>
    )
  }

  const getPropertyIcon = () => {
    switch (property.type) {
      case 'house': return Home
      case 'apartment': return Building2
      case 'land': return Map
      default: return Home
    }
  }

  const Icon = getPropertyIcon()

  const handleScheduleAppointment = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Por favor selecciona fecha y hora')
      return
    }
    Alert.alert(
      'Cita Agendada',
      `Tu cita ha sido agendada para el ${selectedDate} a las ${selectedTime}`,
      [{ text: 'OK', onPress: () => setShowAppointmentModal(false) }]
    )
    setSelectedDate('')
    setSelectedTime('')
    setNotes('')
  }

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Imagen placeholder */}
        <View style={styles.imageContainer}>
          <Icon size={64} color={colors.textMuted} />
          
          {/* Badges */}
          <View style={styles.badgesContainer}>
            <View style={styles.locationBadge}>
              <MapPin size={12} color={colors.accent} />
              <Text style={styles.locationBadgeText}>{property.city}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.imageActions}>
            <TouchableOpacity 
              style={[styles.actionButton, favorite && styles.actionButtonActive]}
              onPress={() => toggleFavorite(property.id)}
            >
              <Heart 
                size={20} 
                color={favorite ? '#fff' : colors.text} 
                fill={favorite ? '#fff' : 'transparent'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Rent badge */}
          {property.status === 'for_rent' && property.monthlyRent && (
            <View style={styles.rentBadgeContainer}>
              <Text style={styles.rentLabel}>RENTA MENSUAL</Text>
              <Text style={styles.rentPrice}>{formatCurrency(property.monthlyRent)}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Price */}
          <Text style={styles.title}>{property.title}</Text>
          <View style={styles.addressRow}>
            <MapPin size={16} color={colors.textMuted} />
            <Text style={styles.address}>{property.address}</Text>
          </View>
          <Text style={styles.price}>{formatCurrency(property.price)}</Text>

          {/* Features */}
          {property.type !== 'land' && (
            <View style={styles.featuresCard}>
              <View style={styles.featureItem}>
                <Bed size={24} color={colors.accent} />
                <Text style={styles.featureValue}>{property.bedrooms}</Text>
                <Text style={styles.featureLabel}>Recamaras</Text>
              </View>
              <View style={styles.featureDivider} />
              <View style={styles.featureItem}>
                <Bath size={24} color={colors.accent} />
                <Text style={styles.featureValue}>{property.bathrooms}</Text>
                <Text style={styles.featureLabel}>Banos</Text>
              </View>
              <View style={styles.featureDivider} />
              <View style={styles.featureItem}>
                <Maximize size={24} color={colors.accent} />
                <Text style={styles.featureValue}>{property.sqMeters}</Text>
                <Text style={styles.featureLabel}>m2</Text>
              </View>
            </View>
          )}

          {/* Description */}
          {property.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripcion</Text>
              <Text style={styles.description}>{property.description}</Text>
            </View>
          )}

          {/* Features list */}
          {property.features && property.features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Caracteristicas</Text>
              <View style={styles.featuresList}>
                {property.features.map((feature, index) => (
                  <View key={index} style={styles.featureChip}>
                    <Check size={14} color={colors.accent} />
                    <Text style={styles.featureChipText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      {isClient && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.contactButton}>
            <Phone size={20} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.whatsappButton}>
            <MessageCircle size={20} color="#25D366" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.scheduleButton}
            onPress={() => setShowAppointmentModal(true)}
          >
            <Calendar size={20} color={colors.primary} />
            <Text style={styles.scheduleButtonText}>Agendar Visita</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Appointment Modal */}
      <Modal
        visible={showAppointmentModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAppointmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agendar Visita</Text>
              <TouchableOpacity onPress={() => setShowAppointmentModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Fecha</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.textMuted}
              value={selectedDate}
              onChangeText={setSelectedDate}
            />

            <Text style={styles.modalLabel}>Hora</Text>
            <View style={styles.timeSlots}>
              {timeSlots.map(time => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeSlot, selectedTime === time && styles.timeSlotActive]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeSlotText, selectedTime === time && styles.timeSlotTextActive]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Notas (opcional)</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Algun comentario adicional..."
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleScheduleAppointment}
            >
              <Text style={styles.confirmButtonText}>Confirmar Cita</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
  },
  imageContainer: {
    height: 280,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgesContainer: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  locationBadgeText: {
    fontSize: typography.caption.fontSize,
    color: colors.accent,
    fontWeight: '500',
  },
  imageActions: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: colors.error,
  },
  rentBadgeContainer: {
    position: 'absolute',
    bottom: spacing.md,
    alignItems: 'center',
  },
  rentLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
  },
  rentPrice: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomLeftRadius: borderRadius.sm,
    borderBottomRightRadius: borderRadius.sm,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  address: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  price: {
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  featuresCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
  },
  featureValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  featureLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
  featureDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureChipText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  contactButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  whatsappButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
  },
  scheduleButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  modalLabel: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeSlot: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeSlotActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  timeSlotText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text,
  },
  timeSlotTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  confirmButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.textInverse,
  },
})
