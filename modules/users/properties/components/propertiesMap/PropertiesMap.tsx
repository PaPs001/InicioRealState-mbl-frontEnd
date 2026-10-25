import MapView, { Marker, type Region } from "react-native-maps";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LocatedPropertyMarker } from "@/lib/types";
import type { usePropertiesScreen } from "../../hooks/usePropertiesScreen";
import { styles } from "./PropertiesMap.styles";
import { logos } from "@/assets";
import { generalColors, userColors } from "@/theme";
import { PropertyCard } from "../propertiesList/PropertyListCard";
import { useMapProperties } from "../../hooks/useMapProperties";
import { MapLoadingIndicator } from "./MapLoadingIndicator";

type PropertiesMapProps = {
  controller: Pick<
    ReturnType<typeof usePropertiesScreen>,
    "findCatalogProperty" | "togglePropertySelection" | "handlePropertyPress"
  >;
  initialRegion: Region;
  onRegionChange: (region: Region) => void;
};

export function PropertiesMap({
  controller,
  initialRegion,
  onRegionChange,
}: PropertiesMapProps) {
  const { properties, error, isLoading, loadProperties, cancelPendingLoad } = useMapProperties();
  const [selectedLocationKey, setSelectedLocationKey] = useState<string | null>(
    null,
  );
  const locationGroups = useMemo(() => {
    const groups = new Map<string, LocatedPropertyMarker[]>();
    for (const property of properties) {
      const key = property.geoData.locations.coordinates.join(",");
      const group = groups.get(key) ?? [];
      group.push(property);
      groups.set(key, group);
    }
    return [...groups].map(([key, items]) => ({ key, properties: items }));
  }, [properties]);
  const selectedGroup = locationGroups.find(
    (group) => group.key === selectedLocationKey,
  );

  useEffect(() => {
    if (selectedLocationKey && !selectedGroup) setSelectedLocationKey(null);
  }, [selectedLocationKey, selectedGroup]);
  const [isMapReady, setIsMapReady] = useState(false);
  const initialRegionRef = useRef(initialRegion);
  const regionRef = useRef(initialRegion);

  useEffect(() => {
    if (isMapReady) void loadProperties(regionRef.current);
  }, [isMapReady, loadProperties]);

  return (
    <View style={styles.root}>
      {error && <Text accessibilityRole="alert">{error}</Text>}
      <View style={styles.container}>
        <MapView
          onRegionChange={cancelPendingLoad}
          onPress={() => setSelectedLocationKey(null)}
          initialRegion={initialRegionRef.current}
          onMapReady={() => setIsMapReady(true)}
          onRegionChangeComplete={(region) => {
            regionRef.current = region;
            onRegionChange(region);
            if (isMapReady) void loadProperties(region);
          }}
          rotateEnabled={false}
          mapType="standard"
          style={styles.mapView}
        >
          {locationGroups.map((group) => {
            const property = group.properties[0];
            const isGroup = group.properties.length > 1;
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
            const markerBackgroundColor = isGroup
              ? userColors.adviser.primary
              : isSale
                ? generalColors.saleColor
                : isRent
                  ? generalColors.rentColor
                  : userColors.adviser.primary;
            return (
              <Marker
                onPress={(event) => {
                  event?.stopPropagation();
                  setSelectedLocationKey(group.key);
                }}
                key={group.key}
                accessibilityLabel={
                  isGroup
                    ? `${group.properties.length} propiedades en esta ubicación`
                    : catalogProperty?.title || "Propiedad en esta ubicación"
                }
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
                    {isGroup ? (
                      <Text style={styles.clusterCount}>
                        {group.properties.length}
                      </Text>
                    ) : (
                      <logos.irsBlanco width={43} height={43} />
                    )}
                  </View>
                  <View style={styles.triangle} />
                </View>
              </Marker>
            );
          })}
        </MapView>
        {(!isMapReady || isLoading) && <MapLoadingIndicator />}
        {selectedGroup && (
          <View
            style={[
              styles.selectedPropertyCard,
              selectedGroup.properties.length > 1 && styles.groupPanel,
            ]}
          >
            {selectedGroup.properties.length > 1 && (
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>
                  {`${selectedGroup.properties.length} propiedades en esta ubicación`}
                </Text>
                {/*<Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar propiedades"
                  style={styles.closeCardButton}
                  onPress={() => setSelectedLocationKey(null)}
                >
                  <Text>Cerrar</Text>
                </Pressable>*/}
              </View>
            )}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={selectedGroup.properties.length > 1 ? styles.propertyList : undefined}
            >
              {selectedGroup.properties.map((marker) => {
                const property = controller.findCatalogProperty(
                  marker.id,
                  marker._id,
                );
                return property ? (
                  <PropertyCard
                    key={marker._id || marker.id}
                    property={property}
                    isSelected={false}
                    isSelecting={false}
                    onToggleSelection={controller.togglePropertySelection}
                    onPress={() => controller.handlePropertyPress(property.id)}
                  />
                ) : (
                  <View
                    key={marker._id || marker.id}
                    style={styles.unavailableProperty}
                  >
                    <Text style={styles.panelTitle}>
                      {`Propiedad ${marker.id || marker._id}`}
                    </Text>
                    <Text>
                      Esta propiedad no está disponible en el catálogo cargado.
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}
