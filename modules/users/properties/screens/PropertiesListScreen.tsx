import { fontSize, textSize } from "@/theme/typography";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { PropertyCard } from "../components/propertiesList/PropertyListCard";
import { PropertyListHeader } from "../components/propertiesList/PropertyListHeader";
import { PropertyListScrollHeader } from "../components/propertiesList/PropertyListScrollHeader";
import {
  PropertyFiltersModal,
  PropertySortModal,
} from "../components/propertiesList/PropertySortModal";
import { usePropertiesScreen } from "../hooks/usePropertiesScreen";
import { generalColors } from "@/theme";
import { PropertyPdfLoadingScreen } from "../components/propertiesList/PropertyPdfLoadingScreen";
import { PropertyPdfOptionsModal } from "../components/propertiesList/PropertyPdfOptionsModal";
import { icons } from "@/assets";
import { type Href, router } from "expo-router";
import { useCallback, useState, type ReactNode } from "react";
import type { Region } from "react-native-maps";
import { usePropertyDomain } from "@/contexts/auth/use-property-domain";
import { PropertiesMap } from "../components/propertiesMap/PropertiesMap";

// Set to false after previewing the footer to resume normal pagination.
const PREVIEW_CATALOG_LOADING_FOOTER = __DEV__ && false;

const INITIAL_MAP_REGION: Region = {
  latitude: 20.6937383,
  longitude: -105.24419770000002,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export const PropertiesListScreen = () => {
  const controller = usePropertiesScreen();
  const { isCatalogLoading, catalogError, catalogResetVersion } =
    usePropertyDomain();
  const [mapRegion, setMapRegion] = useState(INITIAL_MAP_REGION);
  const {
    filteredListings,
    isMapMode,
    isPdfCleanupMode,
    isSelectingProperties,
    keyExtractor,
    selectedPropertyIds,
    togglePropertySelection,
    handlePropertyPress,
  } = controller;

  const renderProperty = useCallback(
    ({ item }: { item: (typeof filteredListings)[number] }) => (
      <PropertyCard
        property={item}
        isSelected={selectedPropertyIds.includes(item.id)}
        isSelecting={isSelectingProperties}
        onToggleSelection={togglePropertySelection}
        onPress={handlePropertyPress}
      />
    ),
    [
      selectedPropertyIds,
      isSelectingProperties,
      togglePropertySelection,
      handlePropertyPress,
    ],
  );

  if (isPdfCleanupMode) {
    return <PropertyPdfLoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {isMapMode ? (
        <>
          <View
            style={{
              paddingHorizontal: 12,
            }}
          >
            <PropertyListHeader
              enabledFilters={true}
              showSort={false}
              showSearch={false}
              controller={controller}
              canUsePdfExporter={false}
            />
          </View>
          <PropertiesMap
            controller={controller}
            initialRegion={mapRegion}
            onRegionChange={setMapRegion}
          />
        </>
      ) : (
        <PropertyListScrollHeader
          // A new first page resets both scroll and floating-header state; appends retain the key.
          key={catalogResetVersion}
          controller={controller}
        >
          {({ header, onScroll }) => (
            <FlashList
              data={filteredListings}
              keyExtractor={keyExtractor}
              renderItem={renderProperty}
              ListHeaderComponent={header}
              onScroll={onScroll}
              onEndReached={() => {
                if (PREVIEW_CATALOG_LOADING_FOOTER) return;
                void controller.loadMoreCatalogProperties();
              }}
              onEndReachedThreshold={0.4}
              scrollEventThrottle={16}
              ItemSeparatorComponent={ListSeparator}
              style={{
                paddingHorizontal: 12,
              }}
              ListFooterComponent={
                isCatalogLoading ||
                (PREVIEW_CATALOG_LOADING_FOOTER &&
                  filteredListings.length > 0) ? (
                  <View
                    style={styles.loadingFooter}
                    accessibilityState={{ busy: true }}
                  >
                    <ActivityIndicator
                      size="large"
                      color="#0c6740"
                      accessibilityLabel={
                        filteredListings.length
                          ? "Cargando más propiedades"
                          : "Cargando propiedades"
                      }
                    />
                    <Text style={styles.loadingFooterText}>
                      {filteredListings.length
                        ? "Cargando más propiedades..."
                        : "Cargando propiedades..."}
                    </Text>
                  </View>
                ) : catalogError ? (
                  <View>
                    <Text accessibilityRole="alert">{catalogError}</Text>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        void controller.retryCatalog();
                      }}
                    >
                      <Text>Reintentar</Text>
                    </Pressable>
                  </View>
                ) : null
              }
              ListEmptyComponent={
                isCatalogLoading || catalogError ? null : ListEmptyState
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              drawDistance={500}
            />
          )}
        </PropertyListScrollHeader>
      )}

      <PropertyFiltersModal controller={controller} />
      <PropertySortModal controller={controller} />
      <PropertyPdfOptionsModal controller={controller} />

      <MapsButton
        onPress={() => controller.setIsMapMode(!isMapMode)}
        icon={
          isMapMode ? (
            <icons.List
              width={13}
              height={13}
              color="#D7B766"
              style={{ transform: [{ scale: 1.5 }] }}
            />
          ) : (
            <icons.MapsIcon
              width={13}
              height={13}
              color="#D7B766"
              style={{ transform: [{ scale: 1.5 }] }}
            />
          )
        }
        label={isMapMode ? "Listado" : "Mapa"}
      />
    </SafeAreaView>
  );
};

function ListSeparator() {
  return <View style={styles.listSeparator} />;
}

function ListEmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No se encontraron propiedades.</Text>
    </View>
  );
}

export type MapsButtonProps = {
  label: string;
  icon: ReactNode;
} & ({ route: Href; onPress?: never } | { route?: never; onPress: () => void });
export function MapsButton({ route, onPress, label, icon }: MapsButtonProps) {
  return (
    <BlurView
      intensity={30}
      tint="light"
      blurMethod="dimezisBlurView"
      style={styles.mapsButtonContainer}
    >
      <Pressable
        style={styles.mapsButton}
        onPress={onPress ?? (() => router.push(route!))}
      >
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={styles.mapButtonText}
        >
          {label}
        </Text>
        {icon}
      </Pressable>
    </BlurView>
  );
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
  loadingFooter: {
    minHeight: 88,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingFooterText: {
    color: "#717171",
    fontSize: textSize.caption,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyText: {
    color: "#717171",
    fontSize: textSize.bodySmall,
    textAlign: "center",
  },
  mapsButtonContainer: {
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "blue",
  },
  mapButtonText: {
    fontSize: fontSize.body,
    color: generalColors.white,
  },
  mapsButton: {
    position: "absolute",
    bottom: 85,
    backgroundColor: "#0c6740eb",
    paddingHorizontal: 20,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    flexDirection: "row",
    gap: 8,
  },
});
