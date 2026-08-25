import {
    View,
    Text,
    Image,

} from 'react-native'
import { styles } from './styles/RoomsRow.style'


type Room = {
    name: string,
    features: string[],
    image: string
}

type RoomsRowProps = {
    roomsData: Room[]
}
export const RoomsRow = ({
    roomsData
}: RoomsRowProps) => {
    return(
        <View style={styles.roomsContainer}>
            {roomsData.map((rooms) => {
                return(
                    <View style={styles.roomCard}>
                        <Image
                            source={{ uri: rooms.image}}
                            style={styles.roomImage}
                        />
                        <View style={styles.roomTextContainer}>
                            <Text
                                style={styles.roomTitle}
                            >
                                {rooms.name}
                            </Text>
                            <Text 
                                style={styles.roomSubtitle}
                            >
                                {rooms.features}
                            </Text>
                        </View>
                        
                    </View>
                )
            })}
        </View>
    )
}
