import {
  Modal,
  Text,
  Pressable,
  View,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import { usePropertiesScreen } from "../../hooks/usePropertiesScreen";
import { ReactNode } from "react";
import { getSortLabel } from "../../hooks/usePropertiesScreen";

type PropertiesController = ReturnType<typeof usePropertiesScreen>;

export const PropertyFiltersModal = ({ controller }: { controller: PropertiesController }) => {
  const {
    isFiltersVisible,
    setIsFiltersVisible,
    activeAdvancedFilterCount,
    resetAdvancedFilters,
    maxPriceFilter,
    setMaxPriceFilter,
    zoneFilter,
    setZoneFilter,
    minPriceFilter,
    setMinPriceFilter,
    setBedroomsFilter,
    setBathroomsFilter,
    bedroomsFilter,
    bathroomsFilter,
    listingFilter,
    parkingFilter,
    setParkingFilter,
    furnishingFilter,
    setFurnishingFilter,
  } = controller;
  return (
    <Modal
      visible={isFiltersVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setIsFiltersVisible(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setIsFiltersVisible(false)}
      >
        <Pressable
          style={styles.filterOptionsPanel}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.filterModalHeader}>
            <View>
              <Text style={styles.filterTitle}>Filtros</Text>
              <Text style={styles.filterMetaText}>
                {activeAdvancedFilterCount
                  ? `${activeAdvancedFilterCount} filtros activos`
                  : "Sin filtros avanzados"}
              </Text>
            </View>
            <View style={styles.filterHeaderActions}>
              <Pressable
                style={styles.clearFiltersButton}
                onPress={resetAdvancedFilters}
              >
                <Text style={styles.clearFiltersButtonText}>Limpiar</Text>
              </Pressable>
              <Pressable
                style={styles.closeFiltersButton}
                onPress={() => setIsFiltersVisible(false)}
              >
                <Text style={styles.closeFiltersButtonText}>Cerrar</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollOptions}
          >
            <Text style={styles.filterFieldLab}>Zona</Text>
            <TextInput
              value={zoneFilter}
              onChangeText={setZoneFilter}
              placeholder="Ej. Temozon, Centro, Altabrisa"
              placeholderTextColor="#717171"
              style={styles.filterTextInput}
            />

            <View style={styles.filterPriceRow}>
              <View style={styles.filterPriceField}>
                <Text style={styles.filterFieldLab}>Precio minimo</Text>
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
                <Text style={styles.filterFieldLab}>Precio maximo</Text>
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
              <FilterValueChip
                label="Todas"
                active={bedroomsFilter === null}
                onPress={() => setBedroomsFilter(null)}
              />
              {[1, 2, 3, 4].map((value) => (
                <FilterValueChip
                  key={value}
                  label={`${value}+`}
                  active={bedroomsFilter === value}
                  onPress={() => setBedroomsFilter(value)}
                />
              ))}
            </FilterOptionGroup>

            <FilterOptionGroup title="Baños">
              <FilterValueChip
                label="Todos"
                active={bathroomsFilter === null}
                onPress={() => setBathroomsFilter(null)}
              />
              {[1, 2, 3, 4].map((value) => (
                <FilterValueChip
                  key={value}
                  label={`${value}+`}
                  active={bathroomsFilter === value}
                  onPress={() => setBathroomsFilter(value)}
                />
              ))}
            </FilterOptionGroup>

            <FilterOptionGroup title="Estacionamientos">
              <FilterValueChip
                label="Todos"
                active={parkingFilter === null}
                onPress={() => setParkingFilter(null)}
              />
              {[1, 2, 3, 4].map((value) => (
                <FilterValueChip
                  key={value}
                  label={`${value}+`}
                  active={parkingFilter === value}
                  onPress={() => setParkingFilter(value)}
                />
              ))}
            </FilterOptionGroup>

            <FilterOptionGroup title="Mobiliario">
              <FilterValueChip
                label="Todos"
                active={furnishingFilter === "all"}
                onPress={() => setFurnishingFilter("all")}
              />
              <FilterValueChip
                label="Amueblados"
                active={furnishingFilter === "furnished"}
                onPress={() => setFurnishingFilter("furnished")}
              />
              <FilterValueChip
                label="Sin amueblar"
                active={furnishingFilter === "unfurnished"}
                onPress={() => setFurnishingFilter("unfurnished")}
              />
            </FilterOptionGroup>

            <Pressable
              style={styles.applyFiltersButton}
              onPress={() => setIsFiltersVisible(false)}
            >
              <Text style={styles.applyFiltersButtonText}>Aplicar filtros</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export const PropertySortModal = ({ controller }: { controller: PropertiesController }) => {
  const {
    isSortVisible,
    setIsSortVisible,
    listingFilter,
    availableSortOptions,
    setSortOption,
    sortOption
    
  } = controller

  
  return (
    <Modal
      visible={isSortVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setIsSortVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sortOptionsPanel}>
          <Text style={styles.filterTitle}>Ordenar</Text>
          <Text style={styles.filterMetaText}>
            {listingFilter === "rent"
              ? "Incluye rangos especiales para rentas"
              : "Orden disponible para esta vista"}
          </Text>

          <View style={styles.sortOptionsList}>
            {availableSortOptions.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.sortOptionButton,
                  sortOption === option && styles.sortOptionButtonActive,
                ]}
                onPress={() => {
                  setSortOption(option);
                  setIsSortVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortOption === option && styles.sortOptionTextActive,
                  ]}
                >
                  {getSortLabel(option)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

function FilterOptionGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.filterOptionGroup}>
      <Text style={styles.filterFieldLab}>{title}</Text>
      <View style={styles.filterChipWrap}>{children}</View>
    </View>
  );
}

function FilterValueChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.filterValueChip, active && styles.filterValueChipActive]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterValueChipText,
          active && styles.filterValueChipTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  filterOptionsPanel: {
    width: "100%",
    maxWidth: 410,
    maxHeight: "88%",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 0.5,
    borderColor: "#d8d0c5",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  filterModalHeader: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  filterTitle: {},
  filterMetaText: {},
  filterHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clearFiltersButton: {
    minWidth: 70,
    height: 32,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#969696",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  clearFiltersButtonText: {
    color: "#505050",
    fontSize: 11,
    fontWeight: "600",
  },
  closeFiltersButton: {
    minWidth: 70,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#0c6740",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  closeFiltersButtonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  filterScrollOptions: {},
  filterFieldLab: {},
  filterTextInput: {
    marginTop: 7,
    height: 38,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#969696",
    color: "#19191f",
    fontSize: 12,
    paddingHorizontal: 10,
  },
  filterPriceRow: {
    marginTop: 13,
    flexDirection: "row",
    gap: 10,
  },
  filterPriceField: {
    flex: 1,
    minWidth: 0,
  },
  applyFiltersButton: {
    marginTop: 16,
    height: 39,
    borderRadius: 8,
    backgroundColor: "#0c6740",
    alignItems: "center",
    justifyContent: "center",
  },
  applyFiltersButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  filterOptionGroup: {
    marginTop: 13,
  },
  filterValueChip: {
    minWidth: 62,
    minHeight: 31,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#969696",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  filterValueChipActive: {
    borderColor: "#0c6740",
    backgroundColor: "#0c6740",
  },
  filterValueChipText: {
    color: "#505050",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
  },
  filterValueChipTextActive: {
    color: "#ffffff",
  },
  filterChipWrap: {
    marginTop: 7,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },


  // segundo modal

  sortOptionsPanel: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: '#d8d0c5',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  sortOptionsList: {
    marginTop: 13,
    gap: 8,
  },
  sortOptionButton: {
    minHeight: 39,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#969696',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  sortOptionButtonActive: {
    borderColor: '#0c6740',
    backgroundColor: '#0c6740',
  },
  sortOptionText: {
    color: '#505050',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sortOptionTextActive: {
    color: '#ffffff',
  },
});
