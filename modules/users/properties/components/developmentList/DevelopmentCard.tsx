import {
    View, 
    Text, 
    Image, 
    Pressable
} from 'react-native'
import {icons} from '@/assets'
import { DevelopmentMock } from '../../developmentMockData'
import {styles} from './styles/DevelopmentCard'
type DevelopmentCardProps = {
    onPress?: () => void,
    development: DevelopmentMock;
}

export const DevelopmentCard = ({
    onPress,
    development,
}: DevelopmentCardProps) => {
    return(
        <View style={styles.cardContainer}>
            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: development.image }}
                    style={styles.imageCard}
                    resizeMode='cover'
                />
            </View>
            <View style={styles.informationContainer}>
                <View style={styles.zoneContainer}>
                    <icons.Place/>
                    <Text style={styles.zoneText}>
                        {development.zone}
                    </Text>
                </View>
                <Text style={styles.nameText}>
                    {development.name.toUpperCase()}
                </Text>
                <Text style={styles.locationText}>
                    {development.location}
                </Text>
                <View>
                    <Text style={styles.fromText}>Desde</Text>  
                    <Text style={styles.priceFrom}>
                         {development.name}
                    </Text>
                </View>
                <Text style={styles.toText}>Hasta {development.name}</Text>
                <View style={styles.extraInformationContainer}>
                    <View style={styles.footerInformationContainer}>
                        <Text style={styles.extraInformationText}>
                            {development.typeView}
                        </Text>
                    </View>
                    <View style={styles.footerInformationContainer}>
                        <Text style={styles.extraInformationText}>
                            {development.nearTo}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    )
}
