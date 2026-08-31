import { useEffect, type ReactNode } from 'react'
import { ActivityIndicator, BackHandler, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  ChevronDown,
  Search,
  SlidersHorizontal,
} from 'lucide-react-native'
import { useHideBottomNav } from '@/lib/navigation/bottom-nav-visibility'
import { styles } from './properties-list.styles'
import { generalColors } from '@/theme'
import { FlashList } from '@shopify/flash-list'
import { PropertyCard } from '@/modules/users/properties/components/propertiesList/PropertyListCard'
import { 
  getSortLabel, 
  PDF_AGENTS, 
  PDF_AGENT_LABELS, 
  usePropertiesScreen 
} from '@/modules/users/properties/hooks/usePropertiesScreen'



export default function CoordinatorPropertiesListScreen() {
  const {
    operationMode, 
    canvasWidth, 
    filteredListings, 
    keyExtractor, 
    shouldSkipPdfAgentList,
    searchQuery, 
    setSearchQuery, 
    isMapMode, 
    isGeneratingPdf, 
    isPdfCleanupMode,
    isSelectingProperties, 
    selectedPropertyIds, 
    activePropertyId,
    isPdfOptionsVisible, 
    setIsPdfOptionsVisible,
    pdfAgentName, 
    setPdfAgentName, 
    listingFilter, 
    setListingFilter,
    isFiltersVisible, 
    setIsFiltersVisible, 
    isSortVisible, 
    setIsSortVisible,
    zoneFilter, 
    setZoneFilter, 
    minPriceFilter, 
    setMinPriceFilter, 
    maxPriceFilter, 
    setMaxPriceFilter,
    bedroomsFilter, 
    setBedroomsFilter, 
    bathroomsFilter, 
    setBathroomsFilter,
    parkingFilter, 
    setParkingFilter, 
    furnishingFilter, 
    setFurnishingFilter,
    sortOption, 
    setSortOption, 
    activeAdvancedFilterCount, 
    availableSortOptions,
    resetAdvancedFilters, 
    togglePropertySelection, 
    handlePropertyPress,
    handleGenerateSinglePdf,
    openPdfOptions,
    handleToggleSelectionMode, 
    handleGeneratePdf,
  } = usePropertiesScreen()

  const renderProperty = ({ item }: { item: (typeof filteredListings)[number] }) => (
    <PropertyCard
      property={item}
      isSelected={selectedPropertyIds.includes(item.id)}
      isSelecting={isSelectingProperties}
      onToggleSelection={togglePropertySelection}
      onPress={() => handlePropertyPress(item.id)}
    />
  )

  const ListHeader = (
    <View style={[styles.listCanvas, { width: canvasWidth }]}>
      <View style={styles.headerCanvas}>
        {/*<TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (isMapMode) {
              setIsMapMode(false)
              return
            }

            router.replace(`${routeBase}/properties` as never)
          }}
          activeOpacity={0.85}
        >
          <BackButton/>
        </TouchableOpacity>*/}

        <Text style={styles.title}>Propiedades Disponibles</Text>
        <Text style={styles.subtitle}>
          {operationMode === 'rent'
            ? 'Inventario de renta'
            : operationMode === 'sale'
              ? 'Inventario de venta'
              : 'Inventario de renta y venta'}
        </Text>

        <View style={styles.controlsBlock}>
          {operationMode === 'both' ? (
            <View style={styles.segmentedControl}>
              {/*<FilterChip
                label="Todo"
                active={listingFilter === 'all'}
                onPress={() => setListingFilter('all')}
              />*/}

              <FilterChip
                label="Renta"
                active={listingFilter === 'rent'}
                activeColor={generalColors.rentColor}
                onPress={() => setListingFilter('rent')}
              />

              <FilterChip
                label="Venta"
                active={listingFilter === 'sale'}
                activeColor={generalColors.saleColor}
                onPress={() => setListingFilter('sale')}
              />
            </View>
          ): null}

          <View style={styles.searchRow}>
            <Search size={13} color="#717171" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por zona, nombre o ID"
              placeholderTextColor="#717171"
              style={styles.searchInput}
            />
          </View>

          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlButton} activeOpacity={0.85} onPress={() => setIsFiltersVisible(true)}>
              <SlidersHorizontal size={13} color="#0c6740" />
              <Text style={styles.toggleText}>Filtros</Text>
              {activeAdvancedFilterCount > 0 ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeAdvancedFilterCount}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} activeOpacity={0.85} onPress={() => setIsSortVisible(true)}>
              <Text style={styles.toggleText}>{getSortLabel(sortOption)}</Text>
              <ChevronDown size={15} color="#0c6740" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )

  if (isPdfCleanupMode) {
    return <PdfLoadingScreen />
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <FlashList
        data={isMapMode ? [] : filteredListings}
        keyExtractor={keyExtractor}
        renderItem={renderProperty}
        ListHeaderComponent={ListHeader}
        ItemSeparatorComponent={ListSeparator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        drawDistance={500}
      />

      {/** Panel de exportado de pdf */}
      <View style={styles.exportPanel}>
        {activePropertyId && !isSelectingProperties ? (
          <TouchableOpacity
            style={styles.exportButtonSingle}
            activeOpacity={0.85}
            onPress={handleGenerateSinglePdf}
            disabled={isGeneratingPdf}
          >
            <Text style={styles.exportButtonSingleText}>
              {isGeneratingPdf ? 'Generando...' : 'PDF'}{isGeneratingPdf ? '' : '\n'}{isGeneratingPdf ? '' : 'individual'}
            </Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={styles.exportButtonSecondary}
          activeOpacity={0.85}
          onPress={shouldSkipPdfAgentList ? handleGeneratePdf : openPdfOptions}
          disabled={isGeneratingPdf}
        >
          <Text style={styles.exportButtonSecondaryText}>
            {isGeneratingPdf ? 'Generando...' : 'Generar'}{'\n'}Pdf / Cards
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButtonPrimary} activeOpacity={0.85} onPress={handleToggleSelectionMode}>
          <Text style={styles.exportButtonPrimaryText}>
            {isSelectingProperties ? 'Terminar' : 'Seleccionar'}{'\n'}propiedades
          </Text>
        </TouchableOpacity>
        <Text style={styles.exportHint}>
          {selectedPropertyIds.length ? `${selectedPropertyIds.length} seleccionadas` : 'Comparte tu inventario'}{'\n'}con un clic
        </Text>
      </View>

      <Modal
        visible={isPdfOptionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPdfOptionsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pdfOptionsPanel}>
            <Text style={styles.pdfOptionsTitle}>Opciones del PDF</Text>
            <Text style={styles.pdfOptionsMeta}>
              {selectedPropertyIds.length ? `${selectedPropertyIds.length} propiedades seleccionadas` : 'Sin seleccion: se enviaran todas'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pdfOptionsScroll}>
              {!shouldSkipPdfAgentList ? (
                <PdfOptionGroup title="Asesor">
                  {PDF_AGENTS.map(agent => (
                    <PdfChip
                      key={agent}
                      label={PDF_AGENT_LABELS[agent]}
                      active={pdfAgentName === agent}
                      onPress={() => setPdfAgentName(agent)}
                    />
                  ))}
                </PdfOptionGroup>
              ) : null}

              <View style={styles.pdfActionsRow}>
                <TouchableOpacity
                  style={styles.pdfCancelButton}
                  activeOpacity={0.85}
                  onPress={() => setIsPdfOptionsVisible(false)}
                >
                  <Text style={styles.pdfCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.pdfGenerateButton}
                  activeOpacity={0.85}
                  onPress={handleGeneratePdf}
                  disabled={isGeneratingPdf}
                >
                  <Text style={styles.pdfGenerateButtonText}>Generar PDF</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/** hasta aqui llegan los modales de creacion de pdf y exportacion */}

      {/** aqui empiezan los modales de filtrado */}
      <Modal
        visible={isFiltersVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFiltersVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsFiltersVisible(false)}>
          <Pressable style={styles.filterOptionsPanel} onPress={event => event.stopPropagation()}>
            <View style={styles.filterModalHeader}>
              <View>
                <Text style={styles.pdfOptionsTitle}>Filtros</Text>
                <Text style={styles.pdfOptionsMeta}>
                  {activeAdvancedFilterCount ? `${activeAdvancedFilterCount} filtros activos` : 'Sin filtros avanzados'}
                </Text>
              </View>
              <View style={styles.filterHeaderActions}>
                <TouchableOpacity style={styles.clearFiltersButton} activeOpacity={0.85} onPress={resetAdvancedFilters}>
                  <Text style={styles.clearFiltersButtonText}>Limpiar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeFiltersButton} activeOpacity={0.85} onPress={() => setIsFiltersVisible(false)}>
                  <Text style={styles.closeFiltersButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pdfOptionsScroll}>
              <Text style={styles.pdfFieldLabel}>Zona</Text>
              <TextInput
                value={zoneFilter}
                onChangeText={setZoneFilter}
                placeholder="Ej. Temozon, Centro, Altabrisa"
                placeholderTextColor="#717171"
                style={styles.filterTextInput}
              />

              <View style={styles.filterPriceRow}>
                <View style={styles.filterPriceField}>
                  <Text style={styles.pdfFieldLabel}>Precio minimo</Text>
                  <TextInput
                    value={minPriceFilter}
                    onChangeText={setMinPriceFilter}
                    placeholder="0"
                    placeholderTextColor="#717171"
                    keyboardType="numeric"
                    style={styles.filterTextInput}
                  />
                </View>
                <View style={styles.filterPriceField}>
                  <Text style={styles.pdfFieldLabel}>Precio maximo</Text>
                  <TextInput
                    value={maxPriceFilter}
                    onChangeText={setMaxPriceFilter}
                    placeholder="Sin limite"
                    placeholderTextColor="#717171"
                    keyboardType="numeric"
                    style={styles.filterTextInput}
                  />
                </View>
              </View>

              <FilterOptionGroup title="Recamaras">
                <FilterValueChip label="Todas" active={bedroomsFilter === null} onPress={() => setBedroomsFilter(null)} />
                {[1, 2, 3, 4].map(value => (
                  <FilterValueChip key={value} label={`${value}+`} active={bedroomsFilter === value} onPress={() => setBedroomsFilter(value)} />
                ))}
              </FilterOptionGroup>

              <FilterOptionGroup title="Baños">
                <FilterValueChip label="Todos" active={bathroomsFilter === null} onPress={() => setBathroomsFilter(null)} />
                {[1, 2, 3, 4].map(value => (
                  <FilterValueChip key={value} label={`${value}+`} active={bathroomsFilter === value} onPress={() => setBathroomsFilter(value)} />
                ))}
              </FilterOptionGroup>

              <FilterOptionGroup title="Estacionamientos">
                <FilterValueChip label="Todos" active={parkingFilter === null} onPress={() => setParkingFilter(null)} />
                {[1, 2, 3, 4].map(value => (
                  <FilterValueChip key={value} label={`${value}+`} active={parkingFilter === value} onPress={() => setParkingFilter(value)} />
                ))}
              </FilterOptionGroup>

              <FilterOptionGroup title="Mobiliario">
                <FilterValueChip label="Todos" active={furnishingFilter === 'all'} onPress={() => setFurnishingFilter('all')} />
                <FilterValueChip label="Amueblados" active={furnishingFilter === 'furnished'} onPress={() => setFurnishingFilter('furnished')} />
                <FilterValueChip label="Sin amueblar" active={furnishingFilter === 'unfurnished'} onPress={() => setFurnishingFilter('unfurnished')} />
              </FilterOptionGroup>

              <TouchableOpacity style={styles.applyFiltersButton} activeOpacity={0.85} onPress={() => setIsFiltersVisible(false)}>
                <Text style={styles.applyFiltersButtonText}>Aplicar filtros</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
      {/**hasta aqui llega el primer modal de filtrado completo */}

      {/** aqui empieza el segundo modal de filtrado por precios */}
      <Modal
        visible={isSortVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSortVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sortOptionsPanel}>
            <Text style={styles.pdfOptionsTitle}>Ordenar</Text>
            <Text style={styles.pdfOptionsMeta}>
              {listingFilter === 'rent' ? 'Incluye rangos especiales para rentas' : 'Orden disponible para esta vista'}
            </Text>

            <View style={styles.sortOptionsList}>
              {availableSortOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[styles.sortOptionButton, sortOption === option && styles.sortOptionButtonActive]}
                  activeOpacity={0.85}
                  onPress={() => {
                    setSortOption(option)
                    setIsSortVisible(false)
                  }}
                >
                  <Text style={[styles.sortOptionText, sortOption === option && styles.sortOptionTextActive]}>
                    {getSortLabel(option)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/** aqui es solo la parte del mapa */}
      {/*{isMapMode ? null : (
        <TouchableOpacity style={styles.mapFloatingButton} onPress={() => setIsMapMode(true)} activeOpacity={0.85}>
          <Text style={styles.mapFloatingButtonText}>Mapa</Text>
          <MapIcon size={16} color="#ffffff" fill="#ffffff" />
        </TouchableOpacity>
      )}*/}

    </SafeAreaView>
  )
}

function ListSeparator() {
  return <View style={styles.listSeparator} />
}

function FilterChip({
  label,
  active,
  activeColor,
  onPress,
}: {
  label: string
  active: boolean
  activeColor?: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        active && styles.filterChipActive,
        active && activeColor ? { backgroundColor: activeColor } : null,
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  )
}

function PdfLoadingScreen() {
  useHideBottomNav()

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true)

    return () => {
      subscription.remove()
    }
  }, [])

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.pdfWorkState}>
        <ActivityIndicator size="large" color="#0c6740" />
        <Text style={styles.pdfWorkTitle}>Cargando PDF</Text>
        <Text style={styles.pdfWorkText}>Preparando el archivo para descargar...</Text>
      </View>
    </SafeAreaView>
  )
}

function PdfOptionGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.pdfOptionGroup}>
      <Text style={styles.pdfFieldLabel}>{title}</Text>
      <View style={styles.pdfChipWrap}>{children}</View>
    </View>
  )
}

function PdfChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.pdfChip, active && styles.pdfChipActive]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.pdfChipText, active && styles.pdfChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  )
}

function FilterOptionGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.filterOptionGroup}>
      <Text style={styles.pdfFieldLabel}>{title}</Text>
      <View style={styles.filterChipWrap}>{children}</View>
    </View>
  )
}

function FilterValueChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.filterValueChip, active && styles.filterValueChipActive]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.filterValueChipText, active && styles.filterValueChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  )
}
