import { textColor } from "@/theme";
import { StyleSheet, View, Text,  } from "react-native";

type place ={
    name: string,
    distance: string
}

type NearPlacesProp = {
    nearPlacesData: place[]
}

export const NearPlaces = ({
    nearPlacesData
}: NearPlacesProp) => {
    return(
        <View style={styles.placesContainer}>
            {nearPlacesData.map((places, index) => {
                return(
                    <View style={styles.placesCard}>
                        <Text style={styles.placesDistanceText}>
                            {places.distance}
                        </Text>
                        <Text style={styles.placesNameText}
                            numberOfLines={1}
                        >
                            {places.name}
                        </Text>
                    </View>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    placesContainer:{
        flexDirection: 'row',
        flexWrap:'wrap',
        gap: 6,
        paddingRight: 30
    },
    placesCard:{
        width: '30%',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#CBB375',
        paddingVertical: 10,
        paddingHorizontal:12,
    },
    placesDistanceText:{
        fontSize: 16,
    },
    placesNameText:{
        fontSize: 10,
        color: textColor.softText
    }
})

