import { View, Text, Pressable, Image } from "react-native";
import { icons } from "@/assets";
import { styles } from "./styles/PropertyLsitCard.styles";
import { memo } from "react";
import type { ReactNode } from "react";
import { Home } from "lucide-react-native";
import type { PropertyCard2 } from "../../types/Property/property.model";
import {
  fontScale as appFontScale,
  textSize,
  platformLineHeight,
} from "@/theme/typography";
import { formatText } from "@/lib/utils/property-catalog";

export const PropertyCard = memo(function PropertyCard({
  property,
  isSelected,
  isSelecting,
  onToggleSelection,
  onPress,
}: {
  property: PropertyCard2;
  isSelected: boolean;
  isSelecting: boolean;
  onToggleSelection: (propertyId: string) => void;
  onPress?: (propertyId: string) => void;
}) {
  const shouldShowPropertyDetails = !property.isAland;
  const amenities = property.amenities?.slice(0, 3);
  const hasOne = property.amenities?.length === 1;
  return (
    <Pressable
      style={[styles.propertyCard, isSelected && styles.propertyCardSelected]}
      onPress={() =>
        isSelecting ? onToggleSelection(property.id) : onPress?.(property.id)
      }
    >
      <View style={styles.imageWrap}>
        {property.propertyImage ? (
          <Image
            source={{ uri: property.propertyImage }}
            style={styles.propertyImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Home size={50} color="#d2bd7f" />
          </View>
        )}
        <View
          style={{
            position: "absolute",
            top: 7,
            left: 5,
            gap: 3,
          }}
        >
          {property.zone ? (
            <View style={styles.locationPill}>
              <icons.Place />
              <Text style={styles.locationPillText} numberOfLines={1}>
                {property.zone}
              </Text>
            </View>
          ) : null}
          {property.hasSolarPanel ? (
            <View style={styles.SolarPanelPill}>
              <Text style={styles.locationPillText}>Paneles Solares</Text>
            </View>
          ) : null}
          {property.hasMantenance ? (
            <View style={[styles.mantenancePill]}>
              <Text style={styles.mantenancePillText}>Mantenimiento</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.availablePill}>
          <Text style={styles.availablePillText}>
            {property.statusProperty}
          </Text>
        </View>
        {isSelecting ? (
          <View
            style={[
              styles.selectionPill,
              isSelected && styles.selectionPillActive,
            ]}
          >
            <Text
              style={[
                styles.selectionPillText,
                isSelected && styles.selectionPillTextActive,
              ]}
            >
              {isSelected ? "Seleccionada" : "Seleccionar"}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle} numberOfLines={1}>
          {property.title}
        </Text>
        {property.address ? (
          <Text style={styles.propertyCode} numberOfLines={1}>
            {property.address}
          </Text>
        ) : null}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{property.price || property.price} </Text>
        </View>
        {shouldShowPropertyDetails ? (
          <>
            <View style={styles.featuresRow}>
              {property.bedrooms ? (
                <>
                  <Feature
                    icon={<icons.Bed />}
                    value={property.bedrooms}
                    label="Recamaras"
                  />
                </>
              ) : null}
              {property.bathrooms ? (
                <>
                  <View style={styles.featureDivider} />
                  <Feature
                    icon={<icons.Bathroom />}
                    value={property.bathrooms}
                    label="Baños"
                  />
                </>
              ) : null}
              {property.parkings ? (
                <>
                  <View style={styles.featureDivider} />
                  <Feature
                    icon={<icons.Car />}
                    value={property.parkings}
                    label="Estac."
                  />
                </>
              ) : null}
            </View>
          </>
        ) : null}
        {amenities?.length ? (
          <View
            style={[{
              height: 40,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottomWidth: 0.5,
              borderBottomColor: "#d8d0c5",
              gap: 3,
              paddingHorizontal: 3,
            }, hasOne && {
              justifyContent: 'center'
            }]}
          >
            {amenities?.map((amenitie) => (
              <View
                style={[hasOne && {
                  width: "100%",
                  flex: 1,
                },{
                  width: "30%",
                  minWidth: 0,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }]}
              >
                <icons.ActionIcon />
                <Text
                  style={{
                    color: "#929594",
                    fontSize: appFontScale[6],
                    lineHeight: platformLineHeight(8),
                    textAlign: 'center',
                  }}
                  key={amenitie.name}
                  adjustsFontSizeToFit
                  numberOfLines={2}
                >
                  {formatText(amenitie.name)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        <View
          style={[
            styles.amenitiesSpace,
            property.isAland && styles.landPropertyCar,
          ]}
        >
          {property.propertyView ? (
            <>
              <View style={styles.viewBlock}>
                <icons.Fluid />
                <Text
                  adjustsFontSizeToFit={Boolean(!property.statusAmenitie)}
                  numberOfLines={1}
                  style={styles.viewText}
                >
                  {property.propertyView}
                </Text>
              </View>
            </>
          ) : null}
          {property.statusAmenitie && shouldShowPropertyDetails ? (
            <View style={styles.furnishedBlock}>
              <icons.FullyFurnished />
              {property.statusAmenitie ? (
                <Text
                  adjustsFontSizeToFit={Boolean(!property.propertyView)}
                  style={styles.viewText}
                  numberOfLines={1}
                >
                  {property.statusAmenitie}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.detailLink}>Ver detalles </Text>
        </View>
      </View>
    </Pressable>
  );
});

function Feature({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: number | undefined;
  label: string;
}) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureValueRow}>
        {icon}
        <Text
          style={styles.featureValue}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
        >
          {value}
        </Text>
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}
