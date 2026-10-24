import MapView, {
  Marker,
  type Region,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { ScrollView, Text, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import type { PropertyMarker } from "@/lib/types";
import { PropertyListHeader } from "../components/propertiesList/PropertyListHeader";
import { usePropertiesScreen } from "../hooks/usePropertiesScreen";
import { styles } from "./styles/MapsProperties.styles";
import { MapsButton } from "./PropertiesListScreen";
import { icons, logos } from "@/assets";
import { generalColors, userColors } from "@/theme";
import { PropertyCard } from "../components/propertiesList/PropertyListCard";
import { useMapProperties } from "../hooks/useMapProperties";
import { MapLoadingIndicator } from "../components/propertiesMap/MapLoadingIndicator";

const INITIAL_REGION: Region = {
  latitude: 20.6937383,
  longitude: -105.24419770000002,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export const MapsPropertiesScreen = () => {
  const controller = usePropertiesScreen();
  const { properties, error, isLoading, loadProperties, cancelPendingLoad } =
    useMapProperties();
  const [selectedMarker, setSelectedMarker] = useState<PropertyMarker | null>(
    null,
  );
  const selectedProperty = selectedMarker
    ? controller.findCatalogProperty(selectedMarker.id, selectedMarker._id)
    : null;
  const [isMapReady, setIsMapReady] = useState(false);
  const regionRef = useRef(INITIAL_REGION);

  useEffect(() => {
    if (isMapReady) void loadProperties(regionRef.current);
  }, [isMapReady, loadProperties]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/*<PropertyListHeader canUsePdfExporter={false} controller={controller} />*/}
      {error && <Text accessibilityRole="alert">{error}</Text>}
      <View style={styles.container}>
        <MapView
          provider={PROVIDER_GOOGLE}
          onRegionChange={cancelPendingLoad}
          onPress={() => setSelectedMarker(null)}
          initialRegion={INITIAL_REGION}
          onMapReady={() => setIsMapReady(true)}
          onRegionChangeComplete={(region) => {
            regionRef.current = region;
            if (isMapReady) void loadProperties(region);
          }}
          rotateEnabled={false}
          mapType="standard"
          style={styles.mapView}
        >
          {properties.map((property) => {
            const catalogProperty = controller.findCatalogProperty(
              property.id,
              property._id,
            );
            const isSale =
              catalogProperty?.status === "for_sale" ||
              catalogProperty?.status === "pending_sale";
            const isRent =
              catalogProperty?.status === "for_rent" ||
              catalogProperty?.status === "pending_rent";
            const markerBackgroundColor = isSale
              ? generalColors.saleColor
              : isRent
                ? generalColors.rentColor
                : userColors.adviser.primary;
            return (
              <Marker
                onPress={(event) => {
                  event?.stopPropagation();
                  setSelectedMarker(property);
                }}
                key={property.id || property._id}
                coordinate={{
                  longitude: property.geoData.locations.coordinates[0],
                  latitude: property.geoData.locations.coordinates[1],
                }}
              >
                <View style={styles.markerContainer}>
                  <View
                    style={[
                      styles.circle,
                      { backgroundColor: markerBackgroundColor },
                    ]}
                  >
                    <logos.irsBlanco width={43} height={43} />
                  </View>
                  <View style={styles.triangle} />
                </View>
              </Marker>
            );
          })}
        </MapView>
        {(!isMapReady || isLoading) && <MapLoadingIndicator />}
        {selectedMarker && (
          <View style={styles.selectedPropertyCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedProperty ? (
                <PropertyCard
                  property={selectedProperty}
                  isSelected={false}
                  isSelecting={false}
                  onToggleSelection={controller.togglePropertySelection}
                  onPress={() =>
                    controller.handlePropertyPress(selectedProperty.id)
                  }
                />
              ) : (
                <Text>
                  Esta propiedad no esta disponible en el catologo cargado.
                </Text>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      <MapsButton
        route={"/(users)/userAdviser/properties-list"}
        icon={
          <icons.ActionIcon
            width={13}
            height={13}
            color="#D7B766"
            style={{ transform: [{ scale: 1.5 }] }}
          />
        }
        label="Listado"
      />
    </SafeAreaView>
  );
};
