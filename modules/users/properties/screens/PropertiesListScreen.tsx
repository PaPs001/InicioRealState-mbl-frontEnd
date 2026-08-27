import { StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'

import { PropertyCard } from '../components/propertiesList/PropertyListCard'
import { PropertyListHeader } from '../components/propertiesList/PropertyListHeader'
import { PropertyFiltersModal, PropertySortModal } from '../components/propertiesList/PropertySortModal'
import { usePropertiesScreen } from '../hooks/usePropertiesScreen'
import { generalColors } from '@/theme'
import { ExportPdfPanel } from '../components/propertiesList/PropertyExportPanel'
import { PropertyPdfLoadingScreen } from '../components/propertiesList/PropertyPdfLoadingScreen'
import { PropertyPdfOptionsModal } from '../components/propertiesList/PropertyPdfOptionsModal'


export const PropertiesListScreen = () => {
  const controller = usePropertiesScreen()
  const {
    filteredListings,
    isMapMode,
    isPdfCleanupMode,
    isSelectingProperties,
    keyExtractor,
    selectedPropertyIds,
    togglePropertySelection,
  } = controller

  const renderProperty = ({ item }: { item: (typeof filteredListings)[number] }) => (
    <PropertyCard
      property={item}
      isSelected={selectedPropertyIds.includes(item.id)}
      isSelecting={isSelectingProperties}
      onToggleSelection={togglePropertySelection}
    />
  )

  if (isPdfCleanupMode) {
    return <PropertyPdfLoadingScreen />
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <FlashList
        data={isMapMode ? [] : filteredListings}
        keyExtractor={keyExtractor}
        renderItem={renderProperty}
        ListHeaderComponent={<PropertyListHeader controller={controller} />}
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={ListEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        drawDistance={500}
      />

      <PropertyFiltersModal controller={controller} />
      <PropertySortModal controller={controller} />
      <PropertyPdfOptionsModal controller={controller} />
      <ExportPdfPanel controller={controller} />
    </SafeAreaView>
  )
}

function ListSeparator() {
  return <View style={styles.listSeparator} />
}

function ListEmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No se encontraron propiedades.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: generalColors.background,
  },
  listContent: {
    paddingBottom: 90,
  },
  listSeparator: {
    height: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyText: {
    color: '#717171',
    fontSize: 13,
    textAlign: 'center',
  },
})
