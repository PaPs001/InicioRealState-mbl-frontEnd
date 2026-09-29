import { useState, type ReactNode } from "react";
import { FlatList, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BlurView } from "expo-blur";

import { icons, logos } from "@/assets";
import { capitalizeFirstLetter } from "@/modules/users/main/utils/dashboard-formatters";
import { Amenities } from "../components/selectedProperties/AmenitiesButton";
import { GalleryImages } from "../components/selectedProperties/GalleryImages";
import { ImagesRoulette } from "../components/selectedProperties/ImagesRoulette";
import { NearPlaces } from "../components/selectedProperties/NearPlaces";
import { RoomsRow } from "../components/selectedProperties/RoomsRow";
import { PriceCard } from "../components/PriceCard";
import { mockProperty } from "../temporalMock";
import { styles } from "./styles/selectedProperty.styles";
import { useSelectedProperty } from "../hooks/useSelectedProperty";

const PROPERTY_SECTIONS = [
  "overview",
  "amenities",
  "rooms",
  "location",
  "nearby",
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

  const { property, isLoading, error } = useSelectedProperty(propertyId);
  const [seeGalleryImage, setSeeGalleryImages] = useState(false);
  const operationLabel =
    property?.operationLabel.toLowerCase() === "sale"
      ? "Venta por INICIO Real Estate"
      : "Renta por INICIO Real Estate";

  const OperationLogo =
    property?.operationLabel.toLowerCase() === "sale"
      ? logos.logoMiniSale
      : logos.logoMiniRent;

  if (seeGalleryImage) {
    return (
      <View style={styles.safeArea}>
        <GalleryImages
          images={mockProperty.images}
          onClose={() => setSeeGalleryImages(false)}
          onFavorite={() => console.log("favorito")}
          onShare={() => console.log("Compartir")}
        />
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <FlatList
        data={PROPERTY_SECTIONS}
        keyExtractor={(section) => section}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.propertyListContent}
        ListHeaderComponent={
          <ImagesRoulette
            onBack={() => router.back()}
            onFavorite={() => console.log("favorito")}
            onShare={() => console.log("Compartir")}
            onOpenGallery={() => setSeeGalleryImages(true)}
            images={mockProperty.images}
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
                    <View style={styles.propertyView}>
                      <mockProperty.view.icon />
                      <Text
                        style={styles.viewText}
                        adjustsFontSizeToFit
                        numberOfLines={1}
                      >
                        {property?.view}
                      </Text>
                    </View>
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
                  <View style={styles.moreFeaturesContainer}>
                    <mockProperty.moreInformation.icon />
                    <Text style={styles.moreFeaturesText}>
                      {property?.propertyAmenities}
                    </Text>
                  </View>
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
                      <Text>Extras </Text>
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
                <RoomsRow roomsData={mockProperty.rooms} />
              </PropertySection>
            );
          }
          if (section === "location") {
            return (
              <PropertySection title="Dónde vas a estar">
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
              </PropertySection>
            );
          }
          return (
            <PropertySection title="Cerca de aquí">
              <NearPlaces nearPlacesData={mockProperty.nearbyPlaces} />
            </PropertySection>
          );
        }}
      />

      <BlurView
        intensity={15}
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
