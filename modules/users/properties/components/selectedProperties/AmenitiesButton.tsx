import { Text, View } from "react-native";
import {styles} from './styles/AmenitiesButton.style'
import { capitalizeFirstLetter } from "@/modules/users/main/utils/dashboard-formatters";
import type { AmenitiesMapped } from "../../types/Property/property.model";
type AmenitiesButtonProps = {
  amenitiesData?: AmenitiesMapped[],
}
export const Amenities = ({
 amenitiesData 
}: AmenitiesButtonProps) => {
  return(
    <View style={styles.amenitiesContainer}>
      {amenitiesData?.map((amenity, index) => {
        const key = amenity.name.toLocaleLowerCase();
        const AmenityIcon = amenity.icons

        return(
          <View
            key={`${key}-${index}`}
            style={styles.amenitieCard}
          >
            {AmenityIcon && <AmenityIcon width={15} height={15} />}
            <Text 
              style={styles.amenitieText}
              adjustsFontSizeToFit
            >
              {capitalizeFirstLetter(amenity.name)}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

