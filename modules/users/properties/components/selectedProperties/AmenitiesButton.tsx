import { Text, View } from "react-native";
import {styles} from './styles/AmenitiesButton.style'
import { capitalizeFirstLetter } from "@/modules/users/main/utils/dashboard-formatters";
import { amenitiesConfigSelectedProperty } from "../../constants/propertyConstants";
type AmenitiesButtonProps = {
  amenitiesData: string[],
  //icon: SvgProps,
}
export const Amenities = ({
 amenitiesData 
}: AmenitiesButtonProps) => {
  return(
    <View style={styles.amenitiesContainer}>
      {amenitiesData.map((amenity, index) => {
        const amenityConfig = amenitiesConfigSelectedProperty[amenity]
        const AmenityIcon = amenityConfig?.icon

        return(
          <View
            key={`${amenity}-${index}`}
            style={styles.amenitieCard}
          >
            {AmenityIcon && <AmenityIcon width={15} height={15} />}
            <Text 
              style={styles.amenitieText}
              adjustsFontSizeToFit
            >
              {capitalizeFirstLetter(amenity)}
            </Text>
          </View>

        )
      })}
    </View>
  )
}

