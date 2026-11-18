import { Text, View, Pressable } from "react-native";
import { styles } from "./styles/AmenitiesButton.style";
import { capitalizeFirstLetter } from "@/modules/users/main/utils/dashboard-formatters";
import type { AmenitiesMapped } from "../../types/Property/property.model";
type AmenitiesButtonProps = {
  amenitiesData?: AmenitiesMapped[];
};
export const Amenities = ({ amenitiesData }: AmenitiesButtonProps) => {
  return (
    <View style={styles.amenitiesContainer}>
      {amenitiesData?.map((amenity, index) => {
        const key = amenity.name.toLocaleLowerCase();
        const AmenityIcon = amenity.icons;

        const content = (
          <>
            {AmenityIcon && <AmenityIcon width={15} height={15} />}
            <Text style={[styles.amenitieText, amenity.last && {
              color: "#323232"
            }]} adjustsFontSizeToFit>
              {capitalizeFirstLetter(amenity.name)}
            </Text>
          </>
        );

        return amenity.last ? (
          <Pressable
            key={`${key}-${index}`}
            accessibilityRole="button"
            onPress={amenity.onPress}
            style={[styles.amenitieCard, { backgroundColor: amenity.color }]}
          >
            {content}
          </Pressable>
        ) : (
          <View key={`${key}-${index}`} style={styles.amenitieCard}>
            {content}
          </View>
        );
      })}
    </View>
  );
};
