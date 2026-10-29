import {
  useRef,
  useState,
  type ReactNode,
  type ComponentRef,
} from "react";
import { ScrollView, Text, View } from "react-native";
import { PropertyCarousel } from "@/modules/users/properties/components/selectedProperties/PropertyCarousel";
import { router } from "expo-router";
import { BlurView } from "expo-blur";

import MapView, { Marker } from "react-native-maps";
import { icons, images, logos } from "@/assets";
import { Amenities } from "@/modules/users/properties/components/selectedProperties/AmenitiesButton";
import { GalleryImages } from "@/modules/users/properties/components/selectedProperties/GalleryImages";
import { ImagesRoulette } from "@/modules/users/properties/components/selectedProperties/ImagesRoulette";
import { RoomsRow } from "@/modules/users/properties/components/selectedProperties/RoomsRow";
import { PriceCard } from "@/modules/users/properties/components/PriceCard";
import { styles } from "@/modules/testingScreens/styles/SelectedPropertyStyles";
import { mockProperty } from "@/modules/users/properties/temporalMock";
import type {
  PropertyDetail,
  PropertyDetailRoom,
} from "@/modules/users/properties/mappers/detail.mappers";

interface AmenitiesImages extends Omit<PropertyDetail, "previewImages" | "amenitiesImages"> {
  amenitiesImages: PropertyDetailRoom[] | null | undefined;
}

const property: AmenitiesImages = {
  title: mockProperty.title,
  zone: mockProperty.address,
  description: mockProperty.description,
  bedrooms: {
    principal: String(mockProperty.bedrooms),
    extra: null,
    extraName: null,
  },
  bathrooms: String(mockProperty.bathrooms),
  parking: String(mockProperty.parking),
  view: mockProperty.view.label,
  operationLabel: mockProperty.operation === "renta" ? "rent" : "sale",
  propertyAmenities: mockProperty.moreInformation.label,
  amenities: mockProperty.propertyAmenities.map((name) => ({
    name,
    color: "",
  })),
  otherAmenities: [],
  equipmentServices: [],
  hasMantenimiento: false,
  status: mockProperty.status,
  price: mockProperty.priceLabel,
  images: mockProperty.images.map((urlImage) => urlImage.url),
  rooms: mockProperty.images
    .filter((image) => image.zone)
    .map((room, index) => ({
      id: `mock-room-${index}`,
      name: room.zone,
      image: room.url,
      images: [room.url],
    })),
  amenitiesImages: mockProperty.images
    .filter((image) => image.amenitieName)
    .map((image, index) => ({
      id: `mock-room-${index}`,
      name: image.amenitieName ?? "",
      image: image.url,
      images: [image.url],
    })),
  geoData: {
    place: mockProperty.address,
    placeId: null,
    formatAddress: mockProperty.address,
    locations: {
      type: "Point",
      coordinates: [mockProperty.location.longitude, mockProperty.location.latitude],
    },
  },
};
import { generalColors } from "@/theme";

export const PropertiesList = () => {
  const normalizeName = (value?: string | null) => {
    return value?.replace(/wc|rec/gi, "").trim() ?? "";
  };
  const markerRef = useRef<ComponentRef<typeof Marker>>(null);

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

  if (seeGalleryImage && property.images.length > 1) {
    return (
      <View style={styles.safeArea}>
        <GalleryImages
          images={property.images}
          onClose={() => setSeeGalleryImages(false)}
          onFavorite={() => {}}
          onShare={() => {}}
        />
      </View>
    );
  }

  const [longitude, latitude] = property.geoData?.locations?.coordinates ?? [];
  const hasValidCoordinates =
    property.geoData?.locations?.type === "Point" &&
    typeof latitude === "number" && Number.isFinite(latitude) &&
    typeof longitude === "number" && Number.isFinite(longitude) &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180;

  return (
    <View style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.propertyListContent}
      >
        <ImagesRoulette
          onBack={() => router.back()}
          onFavorite={() => {}}
          onShare={() => {}}
          onOpenGallery={() => {
            if (property.images.length > 1) setSeeGalleryImages(true);
          }}
          images={property.images}
          status={property?.status}
        />
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
            <View style={styles.leftFeaturesContainer}>
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
            </View>
            {property.propertyAmenities ? (
              <View style={styles.rightFeaturesContainer}>
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
            <Text style={styles.detailsTitle}>Detalles de la propiedad</Text>
            <Text style={styles.detailsInformation}>
              {property?.description ??
                "No hay una descripcion para esta propiedad"}
            </Text>
          </View>
        </View>
        {property.amenities.length + property.otherAmenities.length > 0 && (
          <PropertySection title="Amenidades">
            <Amenities
              amenitiesData={[
                ...(property?.amenities ?? []),
                ...(property?.otherAmenities ?? []),
              ]}
            />
          </PropertySection>
        )}
        {property.rooms.length > 0 && (
          <PropertySection title="Donde vas a vivir">
            <PropertyCarousel items={property.rooms} />
          </PropertySection>
        )}
        {(property.amenitiesImages?.length ?? 0) > 0 && (
          <PropertySection title="Amenidades">
            <PropertyCarousel items={property.amenitiesImages ?? []} />
          </PropertySection>
        )}
        <PropertySection title="Dónde vas a estar">
          <View style={styles.mapPrincipalContainer}>
            <View style={styles.mapShadowContainer}>
              <View style={styles.mapContainer}>
                {hasValidCoordinates ? <MapView
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
                        <logos.irsBlanco width={43} height={43} />
                      </View>
                      <View style={styles.triangle} />
                    </View>
                  </Marker>
                </MapView> : <Text>Ubicaci?n no disponible</Text>}
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
      </ScrollView>
      <BlurView
        intensity={12}
        tint="light"
        blurMethod="dimezisBlurView"
        style={styles.priceSection}
      >
        <PriceCard
          onDate={() => {}}
          hasMantain={mockProperty.maintainIncluded}
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
