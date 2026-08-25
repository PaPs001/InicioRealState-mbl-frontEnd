import { Text, View } from "react-native";
import {styles} from './styles/AmenitiesButton.style'
import { capitalizeFirstLetter } from "@/components/userDashboard/dashboard-formatters";
type AmenitiesButtonProps = {
  amenitiesData: string[],
  //icon: SvgProps,
}
export const Amenities = ({
 amenitiesData 
}: AmenitiesButtonProps) => {
  return(
    <View style={styles.amenitiesContainer}>
      {amenitiesData.map((amenitie, index) => {
        return(
          <View
            key={`${amenitie}-${index}`}
            style={styles.amenitieCard}
          >
            <Text 
              style={styles.amenitieText}
              adjustsFontSizeToFit
            >
              {capitalizeFirstLetter(amenitie)}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

