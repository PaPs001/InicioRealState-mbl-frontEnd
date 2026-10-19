import { useRef, useState, type ReactNode, type ComponentRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  type ViewToken,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BlurView } from "expo-blur";

import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { icons, logos } from "@/assets";
import { Amenities } from "../components/selectedProperties/AmenitiesButton";
import { GalleryImages } from "../components/selectedProperties/GalleryImages";
import { ImagesRoulette } from "../components/selectedProperties/ImagesRoulette";
import { PropertyImage } from "../components/selectedProperties/PropertyImage";
import { RoomsRow } from "../components/selectedProperties/RoomsRow";
import { PriceCard } from "../components/PriceCard";
import { styles } from "./styles/selectedProperty.styles";
import { useSelectedProperty } from "../hooks/useSelectedProperty";
import { generalColors } from "@/theme";

const PROPERTY_SECTIONS = [
  "overview",
  "amenities",
  "rooms",
  "location",
] as const;

export const PropertiesList = () => {
  const params = useLocalSearchParams<{
    propertyId?: string | string[];
  }>();

  const normalizeName = (value?: string | null) => {
    return value?.replace(/wc|rec/gi, "").trim() ?? "";
  };
  const propertyId = Array.isArray(params.propertyId)
    ? params.propertyId[0]
    : params.propertyId;

  const { property, isLoading, error, errorCode, isRefreshing, refresh } =
    useSelectedProperty(propertyId);
  const markerRef = useRef<ComponentRef<typeof Marker>>(null);

  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(),
  );
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 1 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      setVisibleSections(
        new Set(viewableItems.map((item) => item.item as string)),
      );
    },
  ).current;
  const [seeGalleryImage, setSeeGalleryImages] = useState(false);
  const operationLabel =
    property?.operationLabel.toLowerCase() === "sale"
      ? "Venta por INICIO Real Estate"
      : "Renta por INICIO Real Estate";

  const OperationLogo =
    property?.operationLabel.toLowerCase() === "sale"
      ? logos.logoMiniSale
      : logos.logoMiniRent;
  const markerBackgroundColor =
    property?.operationLabel.trim().toLowerCase() === "sale"
      ? generalColors.saleColor
      : generalColors.rentColor;

  if (isLoading || !property) {
    return (
      <View style={styles.propertyStateContainer}>
        <Pressable
          style={styles.propertyStateBackButton}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text style={styles.propertyStateBackText}>Volver</Text>
        </Pressable>
        {isLoading ? (
          <View style={styles.propertyStateContent}>
            <ActivityIndicator size="large" color={generalColors.greenTitle} />
            <Text style={styles.propertyStateMessage}>Cargando propiedad…</Text>
          </View>
        ) : (
          <View style={styles.propertyStateContent} accessibilityRole="alert">
            <Text style={styles.propertyStateTitle}>
              No se ha logrado cargar la propiedad
            </Text>
            <Text style={styles.propertyStateMessage}>
              Envíe un mensaje a los desarrolladores encargados.
            </Text>
            <Text selectable style={styles.propertyStateCode}>
              Código de error: {errorCode ?? "PROPERTY_LOAD_FAILED"}
            </Text>
            <Text adjustsFontSizeToFit numberOfLines={2} style={styles.propertyStateMessage}>
              {error || "No se recibieron los datos de la propiedad."}
            </Text>
          </View>
        )}
      </View>
    );
  }

  const sections = PROPERTY_SECTIONS.filter((section) => {
    if (section === "rooms") return property.rooms.length > 0;
    if (section === "amenities")
      return property.amenities.length + property.otherAmenities.length > 0;
    return true;
  });

  if (seeGalleryImage && property.images.length > 1) {
    return (
      <View style={styles.safeArea}>
        <GalleryImages
          images={property.images}
          onClose={() => setSeeGalleryImages(false)}
          onFavorite={() => console.log("favorito")}
          onShare={() => console.log("Compartir")}
        />
      </View>
    );
  }


  const latitude = property.geoData.locations.latitude;
  const longitude = property.geoData.locations.longitude;

  return (
    <View style={styles.safeArea}>
      <FlatList
        data={sections}
        extraData={visibleSections}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        refreshing={isRefreshing}
        onRefresh={refresh}
        keyExtractor={(section) => section}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.propertyListContent}
        ListHeaderComponent={
          <ImagesRoulette
            onBack={() => router.back()}
            onFavorite={() => console.log("favorito")}
            onShare={() => console.log("Compartir")}
            onOpenGallery={() => {
              if (property.images.length > 1) setSeeGalleryImages(true);
            }}
            images={property.previewImages}
            status={property?.status}
          />
        }
        renderItem={({ item: section }) => {
          if (section === "overview") {
            return (
              <View style={styles.container}>
                <View style={styles.operationContainer}>
                  <View style={styles.operationIcon}>
                    <OperationLogo width={45} height={45} />
                  </View>
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={styles.operationText}
                  >
                    {operationLabel}
                  </Text>
                  <icons.SealChek height={25} width={25} />
                </View>

                <View style={styles.propertyInformation}>
                  <Text style={styles.propertyTitle}>{property?.title}</Text>
                  <View style={styles.propertyAddressView}>
                    <View style={styles.propertyAddress}>
                      <icons.Place height={20} width={20} />
                      <Text style={styles.addressText} numberOfLines={2}>
                        {property?.zone}
                      </Text>
                    </View>
                    {property.view ? (
                      <View style={styles.propertyView}>
                        <icons.Place width={15} height={15} />
                        <Text
                          style={styles.viewText}
                          adjustsFontSizeToFit
                          numberOfLines={1}
                        >
                          {property?.view}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                <View style={styles.propertyFeaturesContainer}>
                  {property?.bedrooms.principal ? (
                    <PropertyMetric
                      icon={<icons.Bed width={25} height={25} />}
                      value={normalizeName(property?.bedrooms.principal)}
                      label="Recámaras"
                    />
                  ) : null}
                  {property?.bathrooms ? (
                    <PropertyMetric
                      icon={<icons.Bathroom width={25} height={25} />}
                      value={normalizeName(property?.bathrooms)}
                      label="Baños"
                    />
                  ) : null}
                  {property?.parking ? (
                    <PropertyMetric
                      icon={<icons.Car width={25} height={25} />}
                      value={property?.parking}
                      label="Parkings"
                    />
                  ) : null}
                  {property.propertyAmenities ? (
                    <View style={styles.moreFeaturesContainer}>
                      <icons.Blend />
                      <Text numberOfLines={2} style={styles.moreFeaturesText}>
                        {property?.propertyAmenities}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {property?.bedrooms.extraName ? (
                  <View
                    style={[
                      styles.propertyFeaturesContainer,
                      {
                        flexDirection: "column",
                      },
                    ]}
                  >
                    <View style={styles.extrasTtitleContainer}>
                      <Text style={styles.extrasTitle}>Extras </Text>
                    </View>
                    <View>
                      <PropertyMetric
                        icon={<icons.Bed width={25} height={25} />}
                        value={normalizeName(property?.bedrooms.extra)}
                        label={normalizeName(property.bedrooms.extraName)}
                      />
                    </View>
                  </View>
                ) : null}

                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsTitle}>
                    Detalles de la propiedad
                  </Text>
                  <Text style={styles.detailsInformation}>
                    {property?.description ??
                      "No hay una descripcion para esta propiedad"}
                  </Text>
                </View>
              </View>
            );
          }

          if (section === "amenities") {
            return (
              <PropertySection title="Amenidades">
                <Amenities
                  amenitiesData={[
                    ...(property?.amenities ?? []),
                    ...(property?.otherAmenities ?? []),
                  ]}
                />
              </PropertySection>
            );
          }
          if (section === "rooms") {
            return (
              <PropertySection title="Donde vas a vivir">
                <RoomsRow
                  roomsData={property.rooms}
                  enabled={visibleSections.has("rooms")}
                />
              </PropertySection>
            );
          }
          if (section === "location") {
            return (
              <PropertySection title="Dónde vas a estar">
                <View style={styles.mapPrincipalContainer}>
                  <View style={styles.mapShadowContainer}>
                    <View style={styles.mapContainer}>
                      <MapView
                        zoomEnabled={false}
                        scrollEnabled={false}
                        rotateEnabled={false}
                        style={styles.map}
                        initialRegion={{
                          latitude: latitude,
                          longitude: longitude,
                          latitudeDelta: 0.007,
                          longitudeDelta: 0.007,
                        }}
                        mapType="standard"
                      >
                        <Marker
                          ref={markerRef}
                          coordinate={{
                            latitude: latitude,
                            longitude: longitude,
                          }}
                          anchor={{ x: 0.5, y: 1 }}
                        >
                          <View style={styles.markerContainer}>
                            <View
                              style={[
                                styles.circle,
                                { backgroundColor: markerBackgroundColor },
                              ]}
                            >
                              <logos.irsBlanco width={43} height={43}/>
                            </View>
                            <View style={styles.triangle} />
                          </View>
                        </Marker>
                      </MapView>
                    </View>
                  </View>
                  <View style={styles.mapTextAdviseContainer}>
                    <icons.Lock />
                    <Text
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      style={styles.mapText}
                    >
                      La ubicación exacta se comparte al confirmar la visita
                    </Text>
                  </View>
                </View>
              </PropertySection>
            );
          }
          return null;
        }}
      />
      <BlurView
        intensity={12}
        tint="light"
        blurMethod="dimezisBlurView"
        style={styles.priceSection}
      >
        <PriceCard
          onDate={() => console.log("se presionó el botón de cita")}
          price={property?.price}
          operation={property?.operationLabel}
        />
      </BlurView>
    </View>
  );
};

function PropertySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={[styles.sectionContainer, styles.listSection]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function PropertyMetric({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string | number | undefined | null;
  label: string;
}) {
  return (
    <View style={styles.propertyMetricContainer}>
      <View style={styles.propertyMetricHead}>
        {icon}
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={styles.metricNumber}
        >
          {value}
        </Text>
      </View>
      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.metricText}>
        {label}
      </Text>
    </View>
  );
}
