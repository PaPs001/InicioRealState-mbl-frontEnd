import { View, Text, Pressable, StyleSheet, TextInput } from "react-native";
import { generalColors } from "@/theme";
import { usePropertiesScreen } from "../../hooks/usePropertiesScreen";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react-native";
import { getSortLabel } from "../../hooks/usePropertiesScreen";
type PropertiesController = ReturnType<typeof usePropertiesScreen>;

export const PropertyListHeader = ({ controller }: { controller: PropertiesController }) => {
  const {
    listingFilter,
    setListingFilter,
    canvasWidth,
    searchQuery,
    setSearchQuery,
    activeAdvancedFilterCount,
    sortOption,
    setIsFiltersVisible,
    setIsSortVisible,
    operationMode,
  } = controller;

  return (
    <View style={[styles.listCanvas, { width: canvasWidth }]}>
      <View style={styles.headerCanvas}>
        <Text style={styles.title}>Propiedades Disponibles</Text>
        <Text style={styles.subtitle}>
          {operationMode === "rent"
            ? "Inventario de renta"
            : operationMode === "sale"
              ? "Inventario de venta"
              : "Inventario de renta y venta"}
        </Text>
        <View style={styles.filterButtonsContainer}>
          {operationMode === "both" ? (
            <View style={styles.filterChipContainer}>
              <FilterChip
                label="Renta"
                active={listingFilter === "rent"}
                activeColor={generalColors.rentColor}
                onPress={() => setListingFilter("rent")}
              />
              <FilterChip
                label="Venta"
                active={listingFilter === "sale"}
                activeColor={generalColors.saleColor}
                onPress={() => setListingFilter("sale")}
              />
              <FilterChip
                label="Desarrollos"
                active={listingFilter === "developments"}
                activeColor={generalColors.development}
                onPress={() => setListingFilter("developments")}
              />
            </View>
          ) : null}

          <View style={styles.textInputContainer}>
            <Search />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por zona, nombre o ID"
              placeholderTextColor={"#717171"}
              style={styles.searchInput}
            />
          </View>

          <View style={styles.controlRow}>
            <Pressable
              style={styles.controlButton}
              onPress={() => setIsFiltersVisible(true)}
            >
              <SlidersHorizontal size={13} color={'#0c6740'}/>
              <Text style={styles.toggleText}>Filtros</Text>
              {activeAdvancedFilterCount > 0 ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeAdvancedFilterCount}</Text>
                </View>
              ) : null}
            </Pressable>
            <Pressable
              style={styles.controlButton}
              onPress={() => setIsSortVisible(true)}
            >
              <Text style={styles.toggleText}>
                {getSortLabel(sortOption)}
              </Text>
              <ChevronDown size={15} color={'#0c6740'}/>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

function FilterChip({
  label,
  active,
  activeColor,
  onPress,
}: {
  label: string;
  active: boolean;
  activeColor?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.filterChip,
        active && styles.filterChipActive,
        active && activeColor ? { backgroundColor: activeColor } : null,
      ]}
      onPress={onPress}
    >
      <Text
        style={[styles.filterChipText, active && styles.filterChipTextActive]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listCanvas: {
    //backgroundColor: '#ffffff',
  },
  headerCanvas: {
    paddingTop: 32,
    paddingHorizontal: 17,
    paddingBottom: 14,
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 34,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginLeft: 46,
    color: "#3D5A40",
    fontSize: 23,
    lineHeight: 25,
    fontWeight: "500",
  },
  subtitle: {
    marginLeft: 46,
    color: "#afafaf",
    fontSize: 16,
  },
  filterButtonsContainer:{
    marginTop: 22,
    gap: 11,

  },
  filterChipContainer:{
    flexDirection: 'row',
    height: 38,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#969696',
    alignItems: 'center',
    padding: 4,
    gap: 5,
  },
  textInputContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    width: '100%',
    height: 43,
    borderRadius: 9.5,
    borderColor: '#969696',
    borderWidth: 1,
    backgroundColor: '#FEFEFE',
    gap: 8
  },
  searchInput:{
    flex: 1,
    minWidth: 0,
    color: '#19191f',
    fontSize: 12,
    padding: 0
  },

  controlRow:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  controlButton:{
    flex: 1,
    minWidth: 0,
    height: 36,
    borderRadius: 9.5,
    backgroundColor: '#FEFEFE',
    borderColor: '#969696',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  toggleText: {
    flexShrink: 1,
    color: '#0c6740',
    fontSize: 11,
    textAlign: 'center',
  },
  filterBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0c6740',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    lineHeight: 10,
  },
  //// filterChip

  filterChip: {
    flex: 1,
    minWidth: 0,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: "#0c6740",
  },
  filterChipText: {
    color: "#0c6740",
    fontSize: 12,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#ffffff",
  },
});
