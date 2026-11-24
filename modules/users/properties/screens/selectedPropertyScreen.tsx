import type { DatePropertyCard } from "@/lib/types";
import { useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Pressable,
  Text,
  View,
  Image,
  Linking,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BlurView } from "expo-blur";
import { AppointmentCreateFlow } from "../../main/components/AppointmentCreateFlow";
import { PropertyLocationMap } from "../components/selectedProperties/PropertyLocationMap";
import { Google_Maps, icons, logos, Place } from "@/assets";
import { Amenities } from "../components/selectedProperties/AmenitiesButton";
import { GalleryImages } from "../components/selectedProperties/GalleryImages";
import { ImagesRoulette } from "../components/selectedProperties/ImagesRoulette";
import { PropertyCarousel } from "../components/selectedProperties/PropertyCarousel";
import { PriceCard } from "../components/PriceCard";
import { styles } from "./styles/selectedProperty.styles";
import { useSelectedProperty } from "../hooks/useSelectedProperty";
import { generalColors, textColor } from "@/theme";
import { AppModal } from "@/components/AppModal";
import { usePropertyCatalogImage } from "../hooks/useFileProperties";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Ruler, Scaling } from "lucide-react-native";

export const PropertiesList = () => {
  const params = useLocalSearchParams<{
    propertyId?: string | string[];
  }>();

  const [isAppointmentVisible, setIsAppointmentVisible] = useState(false);

  const propertyId = Array.isArray(params.propertyId)
    ? params.propertyId[0]
    : params.propertyId;

  const { generateAndOpenImage, isGeneratingImage } =
    usePropertyCatalogImage(propertyId);

  const { property, isLoading, error, errorCode, isRefreshing, refresh } =
    useSelectedProperty(propertyId);

  const previewImage = property?.propertyImage;

  const appointmentProperty = useMemo<DatePropertyCard | undefined>(() => {
    if (!property || !propertyId) return undefined;
    return {
      id: propertyId,
      title: property.titleApp || property.title || "",
      address:
        property.geoData?.formatAddress ||
        property.zone ||
        property.address ||
        "",
      listingType: property.typeListProperty,
    };
  }, [property, propertyId]);

  const [seeGalleryImage, setSeeGalleryImages] = useState(false);
  const [descriptionPropertyId, setDescriptionPropertyId] = useState<
    string | null
  >(null);
  const operationLabel =
    property?.typeListProperty === "sale"
      ? "Venta por INICIO Real Estate"
      : "Renta por INICIO Real Estate";

  const OperationLogo =
    property?.typeListProperty === "sale"
      ? logos.logoMiniSale
      : logos.logoMiniRent;
  const markerBackgroundColor =
    property?.typeListProperty === "sale"
      ? generalColors.saleColor
      : generalColors.rentColor;

  const equipmentTitle = property?.isAland ? "Caracteristicas" : "Equipamiento";
  const typeText = property?.isAland ? "Colonia" : "Desarrollo inmobiliario";

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
            <Text
              adjustsFontSizeToFit
              numberOfLines={2}
              style={styles.propertyStateMessage}
            >
              {error || "No se recibieron los datos de la propiedad."}
            </Text>
          </View>
        )}
      </View>
    );
  }

  if (seeGalleryImage && property.images.length > 1) {
    return (
      <View style={styles.safeArea}>
        <GalleryImages
          images={property.images}
          onClose={() => setSeeGalleryImages(false)}
          onFavorite={() => {}}
          onShare={() => generateAndOpenImage()}
        />
      </View>
    );
  }

  const description =
    property.descriptionProperty?.trim() ||
    "No hay una descripcion para esta propiedad";

  const amenities = property.developmentAmenities;
  //const descriptionPreview = firstPeriod === -1 ? description : description.slice(0, firstPeriod + 1);

  const descriptionPreview = description.slice(0, 400);

  const hasMoreDescription =
    description.slice(descriptionPreview.length).trim().length > 0;

  const numberToCutAmenities = 13;
  const amenitiesPreview = amenities.slice(0, numberToCutAmenities);
  const hasMoreAmenities =
    amenities.length > numberToCutAmenities ? true : false;

  const numberLastest = amenities.length - numberToCutAmenities;

  const textNumberAmenities = numberLastest > 1 ? "amenidades" : "amenidad";

  const amenitiesToShow = [
    ...amenitiesPreview,
    ...(hasMoreAmenities
      ? [
          {
            name: `+ ${numberLastest} ${textNumberAmenities}`,
            color: "",
            last: true,
          },
        ]
      : []),
  ];

  const [longitude, latitude] = property.geoData?.locations?.coordinates ?? [];

  const hasValidCoordinates =
    property.geoData?.locations?.type === "Point" &&
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  const measurements = (property.propertyDimension ?? "")
    .split(/\s*[x×]\s*/i)
    .map((measurement) => measurement.trim().replace(/\s*m\s*$/i, ""))
    .filter(Boolean)
    .slice(0, 4);
  const dimensionRows = [
    measurements.slice(0, 2).join(" / "),
    measurements.slice(2, 4).join(" / "),
  ].filter(Boolean);

  return (
    <View style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.propertyListContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }
      >
        <ImagesRoulette
          onBack={() => router.back()}
          onFavorite={() => {}}
          onShare={() => generateAndOpenImage()}
          onOpenGallery={() => {
            if (property.images.length > 1) setSeeGalleryImages(true);
          }}
          images={property.previewImages}
          status={property.statusProperty}
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
            <icons.SealChek
              style={{
                marginLeft: -2,
              }}
              height={25}
              width={25}
            />
          </View>

          <View style={styles.propertyInformation}>
            <Text style={styles.propertyTitle}>
              {property.titleApp || property.title}
            </Text>
            {property.zone ? (
              <View style={styles.propertyAddress}>
                <Text style={styles.addressText} numberOfLines={2}>
                  {property?.titleCode}
                </Text>
              </View>
            ) : null}
          </View>

          {/** Aqui comienza el espacio de los objetos de la propiedad */}
          <View style={styles.shadowsContainer}>
            <View
              style={[
                styles.propertyFeaturesContainer,
                !property.isAland && (property.flex || property.balcony)
                  ? {
                      flexWrap: "wrap",
                    }
                  : null,
                property.isAland && styles.landFeaturesContainer,
              ]}
            >
              {property.isAland ? (
                <>
                  {property.propertyArea ? (
                    <View style={styles.landMetricContainer}>
                      <View style={styles.landMetricHead}>
                        <Scaling size={28} color={textColor.accentGolden} />
                        <Text
                          adjustsFontSizeToFit
                          numberOfLines={1}
                          style={styles.landAreaValue}
                        >
                          {property.propertyArea}
                        </Text>
                      </View>
                      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.landMetricLabel}>
                        Superficie del terreno
                      </Text>
                    </View>
                  ) : null}
                  {property.propertyArea && dimensionRows.length > 0 ? (
                    <View style={styles.landMetricDivider} />
                  ) : null}
                  {dimensionRows.length > 0 ? (
                    <View style={styles.landMetricContainer}>
                      <View style={styles.landMetricHead}>
                        <Ruler size={28} color={textColor.accentGolden} />
                        <View style={styles.metricDimensions}>
                          {dimensionRows.map((row, index) => (
                            <Text
                              key={index}
                              adjustsFontSizeToFit
                              numberOfLines={1}
                              style={styles.landDimensionValue}
                            >
                              {row} m
                            </Text>
                          ))}
                        </View>
                      </View>
                      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.landMetricLabel}>
                        Medidas de los {measurements.length} lados
                      </Text>
                    </View>
                  ) : null}
                </>
              ) : (
                <>
                  {property.bedrooms ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        flexShrink: 0,
                      }}
                    >
                      <PropertyMetric
                        icon={<icons.Bed width={25} height={25} />}
                        value={property.bedrooms}
                        label="Recámaras"
                      />

                      {property.flex ? (
                        <PropertyMetric
                          icon={<icons.Bed width={25} height={25} />}
                          value={property.flex}
                          label="Flex"
                        />
                      ) : null}
                      {property.balcony ? (
                        <PropertyMetric
                          icon={
                            <icons.Balcony
                              width={25}
                              height={25}
                              strokeWidth={2}
                            />
                          }
                          value={property.balcony}
                          label="Balcón"
                        />
                      ) : null}
                    </View>
                  ) : null}
                  {property?.bathrooms ? (
                    <PropertyMetric
                      icon={<icons.Bathroom width={25} height={25} />}
                      value={property.bathrooms}
                      label="Baños"
                    />
                  ) : null}
                  {property.parkings ? (
                    <>
                      <PropertyMetric
                        icon={<icons.Car width={25} height={25} />}
                        value={property.parkings}
                        label="Parkings"
                      />
                    </>
                  ) : null}
                  {/*{property.statusAmenitie ? (
                  <View style={styles.moreFeaturesContainer}>
                    <icons.ArmChairSe />
                    <Text
                      adjustsFontSizeToFit
                      numberOfLines={2}
                      style={styles.moreFeaturesText}
                    >
                      {property.statusAmenitie}
                    </Text>
                  </View>
                ) : null}*/}
                </>
              )}
            </View>
          </View>

          <View style={styles.developmentSummaryContainer}>
            <View style={[styles.developmentCardShadow]}>
              <View style={styles.developmentCard}>
                {property.propertyImage ? (
                  <View style={styles.developmentImageContainer}>
                    <Image
                      style={styles.developmentImage}
                      source={{ uri: property.propertyImage }}
                      resizeMode="cover"
                    />
                  </View>
                ) : null}
                <View style={styles.developmentTextContainer}>
                  <Text style={styles.developmentName} numberOfLines={2}>
                    {property.development}
                  </Text>
                  <Text
                    style={styles.developmentLabel}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {typeText}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.developmentBadgesContainer}>
              <View style={styles.developmentBadge}>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={styles.badgeText}
                >
                  {property.statusAmenitie}
                </Text>
              </View>
              <View style={styles.developmentBadge}>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={styles.badgeText}
                >
                  {property.propertyView}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Detalles de la propiedad</Text>
            <Text style={styles.detailsInformation}>{descriptionPreview}</Text>
            {hasMoreDescription && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mostrar toda la descripción de la propiedad"
                onPress={() => setDescriptionPropertyId(propertyId ?? null)}
                style={styles.descriptionAction}
              >
                <Text style={styles.descriptionActionText}>...Leer Más</Text>
              </Pressable>
            )}
          </View>
        </View>
        {property.detailedEquipment.length > 0 && (
          <>
            <PropertySection title={equipmentTitle}>
              <Amenities amenitiesData={property.detailedEquipment} />
            </PropertySection>
            <Line />
          </>
        )}
        {property.equipmentServices?.length ? (
          <>
            <PropertySection title="Servicios Incluidos">
              <Amenities amenitiesData={property.equipmentServices} />
            </PropertySection>
            <Line />
          </>
        ) : null}
        {property.developmentAmenities.length > 0 && (
          <>
            <PropertySection title="Amenidades Del Desarrollo">
              <Amenities amenitiesData={amenitiesToShow} />
            </PropertySection>
            <Line />
          </>
        )}
        {property.rooms.length > 0 && (
          <PropertySection title="Donde vas a vivir">
            <PropertyCarousel
              key={`rooms-${propertyId}`}
              items={property.rooms}
            />
          </PropertySection>
        )}
        {property.amenitiesImages.length > 0 && (
          <PropertySection title="Amenidades">
            <PropertyCarousel
              key={`amenities-${propertyId}`}
              items={property.amenitiesImages}
            />
          </PropertySection>
        )}
        <PropertySection title="Dónde vas a estar">
          <View style={styles.mapPrincipalContainer}>
            <View style={styles.mapShadowContainer}>
              {hasValidCoordinates ? (
                <PropertyLocationMap
                  key={propertyId}
                  latitude={latitude}
                  longitude={longitude}
                  markerColor={markerBackgroundColor}
                />
              ) : (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                  }}
                >
                  <Text numberOfLines={2} adjustsFontSizeToFit>
                    No hemos logrado ubicar esta propiedad
                  </Text>
                </View>
              )}
            </View>
            <Pressable
              style={{
                borderRadius: 19,
                borderWidth: 0.6,
                borderColor: "#46893c",
                paddingVertical: 8,
                paddingHorizontal: 6,
                flexDirection: "row",
                gap: 16,
                alignItems: "center",
                width: "100%",
                justifyContent: "center",
                backgroundColor: "#356b2d",
              }}
              disabled={!property.locationURL}
              onPress={async () => {
                try {
                  await Linking.openURL(property.locationURL);
                } catch {
                  Alert.alert("No se pudo abrir el enlace");
                }
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 99,
                  paddingHorizontal: 3,
                  paddingVertical: 3,
                }}
              >
                <Google_Maps width={25} height={25} style={{}} />
              </View>
              <Text
                style={{
                  color: "#f1f1f1",
                }}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                Abrir en Google Maps
              </Text>
            </Pressable>
            {/*<View style={styles.mapTextAdviseContainer}>
              <icons.Lock />
              <Text
                numberOfLines={2}
                adjustsFontSizeToFit
                style={styles.mapText}
              >
                La ubicación exacta se comparte al confirmar la visita
              </Text>
            </View>*/}
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
          onDate={() => {
            setIsAppointmentVisible(true);
          }}
          price={property?.price}
          operation={property.typeListProperty}
          hasMantain={property.hasMantenance}
        />
      </BlurView>
      <AppModal
        visible={Boolean(propertyId && descriptionPropertyId === propertyId)}
        onClose={() => setDescriptionPropertyId(null)}
        title="Detalles de la propiedad"
        showCloseButton
        scrollable
        size="large"
      >
        <Text
          selectable
          style={[styles.detailsInformation, styles.descriptionModalText]}
        >
          {description}
        </Text>
      </AppModal>
      {isAppointmentVisible && (
        <AppointmentCreateFlow
          visible
          onClose={() => {
            setIsAppointmentVisible(false);
          }}
          initialProperty={appointmentProperty}
          lockAppointmentType
        />
      )}
      <LoadingOverlay visible={isGeneratingImage} />
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

function Line() {
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: 12,
      }}
    >
      <View
        style={{
          borderBottomWidth: 0.7,
          width: "100%",
          borderColor: "#0505051f",
        }}
      ></View>
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
