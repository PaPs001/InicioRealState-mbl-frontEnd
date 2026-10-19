import {
    View,
    Text,


} from 'react-native'
import { PropertyImage } from './PropertyImage'
import { styles } from './styles/RoomsRow.style'
import type { PropertyDetailRoom } from '../../mappers/detail.mappers'


type RoomsRowProps = {
    roomsData: PropertyDetailRoom[]
    enabled?: boolean
}
export const RoomsRow = ({
    roomsData,
    enabled = true
}: RoomsRowProps) => {
    return(
        <View style={styles.roomsContainer}>
            {roomsData.map((rooms) => {
                return(
                    <View key={rooms.id} style={styles.roomCard}>
                        <PropertyImage
                            uri={rooms.image} enabled={enabled}
                            style={styles.roomImage}
                        />
                        <View style={styles.roomTextContainer}>
                            <Text
                                style={styles.roomTitle}
                            >
                                {rooms.name}
                            </Text>
                        </View>
                        
                    </View>
                )
            })}
        </View>
    )
}
