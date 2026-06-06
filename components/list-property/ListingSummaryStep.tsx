import { Text, TouchableOpacity, View } from 'react-native'
import { Home } from 'lucide-react-native'

import type { ListingType } from './constants'
import { investorColors, styles } from './shared'
import { formatCurrency } from '@/lib/utils'

type ListingSummaryStepProps = {
  address: string
  listingType: ListingType | null
  price: string
  propertyAddress: string
  propertyTitle: string
  skipPhotos: boolean
  onConfirm: (confirmed: boolean) => void
}

export function ListingSummaryStep(props: ListingSummaryStepProps) {
  const { address, listingType, price, propertyAddress, propertyTitle, skipPhotos, onConfirm } = props

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Confirmar listado</Text>
      <Text style={styles.stepSubtitle}>Revisa los detalles antes de publicar tu propiedad</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Home size={24} color={investorColors.accent} />
          <Text style={styles.summaryTitle}>{propertyTitle}</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tipo de listado</Text>
          <Text style={styles.summaryValue}>{listingType === 'sale' ? 'Venta' : 'Renta'}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{listingType === 'sale' ? 'Precio' : 'Renta mensual'}</Text>
          <Text style={[styles.summaryValue, { color: investorColors.accent }]}>
            {formatCurrency(Number(price))}
            {listingType === 'rent' ? '/mes' : ''}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Fotos</Text>
          <Text style={styles.summaryValue}>{skipPhotos ? 'Por agregar (asesor)' : 'Por subir'}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Ubicacion</Text>
          <Text style={styles.summaryValue}>{address || propertyAddress}</Text>
        </View>
      </View>

      <Text style={styles.confirmQuestion}>Estas seguro que quieres enlistar esta propiedad?</Text>

      <View style={styles.confirmButtons}>
        <TouchableOpacity style={styles.confirmButtonNo} onPress={() => onConfirm(false)}>
          <Text style={styles.confirmButtonNoText}>No, cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.confirmButtonYes} onPress={() => onConfirm(true)}>
          <Text style={styles.confirmButtonYesText}>Si, enlistar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
