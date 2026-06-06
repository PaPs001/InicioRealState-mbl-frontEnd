import { Text, View } from 'react-native'

import type { PropertyCatalogItemResponse } from '@/lib/api/endpoints/catalog'
import { formatCurrency } from '@/lib/utils'

import { resolveInternalPriceAmount } from '../helpers'
import { styles } from './shared'

type SummaryStepProps = {
  clientName: string
  clientPhone: string
  currency: 'MXN' | 'USD'
  customAmount: string
  listingSource: 'internal' | 'external' | null
  ownerName: string
  priceOption: 'original' | 'min' | 'custom'
  propertyAddress: string
  propertyCity: string
  propertyName: string
  propertyPrice: string
  selectedDocuments: string[]
  selectedPropertyRaw: PropertyCatalogItemResponse | null
  transactionType: 'sale' | 'rent' | null
}

export function SummaryStep(props: SummaryStepProps) {
  const {
    clientName,
    clientPhone,
    currency,
    customAmount,
    listingSource,
    ownerName,
    priceOption,
    propertyAddress,
    propertyCity,
    propertyName,
    propertyPrice,
    selectedDocuments,
    selectedPropertyRaw,
    transactionType,
  } = props

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepQuestion}>Resumen del registro</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tipo de transacción</Text>
          <Text style={styles.summaryValue}>{transactionType === 'sale' ? 'Venta' : 'Renta'}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Origen</Text>
          <Text style={styles.summaryValue}>{listingSource === 'internal' ? 'Listado Interno' : 'Listado Externo'}</Text>
        </View>

        {listingSource === 'internal' && selectedPropertyRaw && (
          <>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Propiedad</Text>
              <Text style={styles.summaryValue}>{selectedPropertyRaw.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Precio acordado</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(resolveInternalPriceAmount(priceOption, customAmount, selectedPropertyRaw))}
              </Text>
            </View>
          </>
        )}

        {listingSource === 'external' && (
          <>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Inmueble</Text>
              <Text style={styles.summaryValue}>{propertyName || 'Sin nombre'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ubicacion</Text>
              <Text style={styles.summaryValue}>{propertyCity || propertyAddress}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Precio</Text>
              <Text style={styles.summaryValue}>{formatCurrency(parseFloat(propertyPrice) || 0)} {currency}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Propietario</Text>
              <Text style={styles.summaryValue}>{ownerName}</Text>
            </View>
          </>
        )}

        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Cliente</Text>
          <Text style={styles.summaryValue}>{clientName}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Telefono</Text>
          <Text style={styles.summaryValue}>{clientPhone}</Text>
        </View>

        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Documentos</Text>
          <Text style={styles.summaryValue}>{selectedDocuments.length} seleccionados</Text>
        </View>
      </View>
    </View>
  )
}
