import { fontSize, textSize } from "@/theme/typography";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { PropertyCard } from "../components/propertiesList/PropertyListCard";
import { PropertyListHeader } from "../components/propertiesList/PropertyListHeader";
import {
  PropertyFiltersModal,
  PropertySortModal,
} from "../components/propertiesList/PropertySortModal";
import { usePropertiesScreen } from "../hooks/usePropertiesScreen";
import { generalColors } from "@/theme";
import { PropertyPdfLoadingScreen } from "../components/propertiesList/PropertyPdfLoadingScreen";
import { PropertyPdfOptionsModal } from "../components/propertiesList/PropertyPdfOptionsModal";
import { icons } from "@/assets";
import { type Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState, type ReactNode } from "react";
import type { Region } from "react-native-maps";
import { useSessionDomain } from "@/contexts/auth/use-session-domain";
import { usePropertyDomain } from "@/contexts/auth/use-property-domain";
import { PropertiesMap } from "../components/propertiesMap/PropertiesMap";

const INITIAL_MAP_REGION: Region = {
  latitude: 20.6937383,
  longitude: -105.24419770000002,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export const PropertiesListScreen = () => {
  const controller = usePropertiesScreen();
  const { authToken, isLoading: isAuthLoading } = useSessionDomain();
  const { hasLoadedCatalog, loadCatalogProperties } = usePropertyDomain();

  useFocusEffect(
    useCallback(() => {
      if (!isAuthLoading && authToken && !hasLoadedCatalog) {
        void loadCatalogProperties();
      }
      // Loading/error changes do not retrigger this effect. A failed request
      // can be attempted again on the next visit, without a retry loop.
    }, [authToken, isAuthLoading, hasLoadedCatalog, loadCatalogProperties]),
  );
  const [mapRegion, setMapRegion] = useState(INITIAL_MAP_REGION);
  const {
    filteredListings,
    isMapMode,
    isPdfCleanupMode,
    isSelectingProperties,
    keyExtractor,
    selectedPropertyIds,
    togglePropertySelection,
  } = controller;

  const renderProperty = ({
    item,
  }: {
    item: (typeof filteredListings)[number];
  }) => (
    <PropertyCard
      property={item}
      isSelected={selectedPropertyIds.includes(item.id)}
      isSelecting={isSelectingProperties}
      onToggleSelection={togglePropertySelection}
      onPress={() => controller.handlePropertyPress(item.id)}
    />
  );

  if (isPdfCleanupMode) {
    return <PropertyPdfLoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {isMapMode ? (
        <>
          <PropertyListHeader controller={controller} />
          <PropertiesMap
            controller={controller}
            initialRegion={mapRegion}
            onRegionChange={setMapRegion}
          />
        </>
      ) : (
        <FlashList
          data={filteredListings}
          keyExtractor={keyExtractor}
          renderItem={renderProperty}
          ListHeaderComponent={<PropertyListHeader controller={controller} />}
          ItemSeparatorComponent={ListSeparator}
          ListEmptyComponent={ListEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          drawDistance={500}
        />
      )}

      <PropertyFiltersModal controller={controller} />
      <PropertySortModal controller={controller} />
      <PropertyPdfOptionsModal controller={controller} />

      <MapsButton
        onPress={() => controller.setIsMapMode(!isMapMode)}
        icon={
          <icons.ActionIcon
            width={13}
            height={13}
            color="#D7B766"
            style={{ transform: [{ scale: 1.5 }] }}
          />
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
} & (
  | { route: Href; onPress?: never }
  | { route?: never; onPress: () => void }
);
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
