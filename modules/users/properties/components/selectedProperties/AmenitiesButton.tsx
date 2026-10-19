import { Text, View } from "react-native";
import {styles} from './styles/AmenitiesButton.style'
import { capitalizeFirstLetter } from "@/modules/users/main/utils/dashboard-formatters";
import { amenitiesConfigSelectedProperty } from "../../constants/propertyConstants";
import { AmenitiesEstructure } from "@/lib/types";
type AmenitiesButtonProps = {
  amenitiesData?: AmenitiesEstructure[],
  //icon: SvgProps,
}
export const Amenities = ({
 amenitiesData 
}: AmenitiesButtonProps) => {
  return(
    <View style={styles.amenitiesContainer}>
      {amenitiesData?.map((amenity, index) => {
        const key = amenity.name.toLocaleLowerCase();
        const amenityConfig = amenitiesConfigSelectedProperty[key]
        const AmenityIcon = amenityConfig?.icon

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

