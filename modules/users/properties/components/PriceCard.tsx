import {
    StyleSheet,
    View,
    Text,
    Pressable
} from 'react-native'
import { icons } from '@/assets'
import { generalColors, textColor, userColors } from '@/theme'
import { deleteMXNWord } from '@/components/userDashboard/dashboard-formatters'

type PriceCardProps ={
    onDate: () => void,
    price: string,
    operation: string,
    hasMantain: boolean
}
export const PriceCard = ({
    onDate,
    price,
    operation,
    hasMantain
}: PriceCardProps) => {
    const isRent = operation.trim().toLowerCase() === 'renta'

    return(
        <View 
            style={styles.priceCardContainer}>
            <View>

            {isRent ? (
                <View style={styles.textContainer}>
                    <Text style={styles.priceCardText}>
                        {deleteMXNWord(price)}
                    </Text>
                    <Text 
                        style={styles.textCard}
                        adjustsFontSizeToFit
                        numberOfLines={1}    
                    >
                       MXN / mes
                    </Text>
                    
                </View>
            ): (
                <Text style={styles.priceCardText}>
                    {deleteMXNWord(price)}
                </Text>
            )}
            {hasMantain ? (
                <Text 
                    style={styles.maintainText}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    Mantenimiento incluido
                </Text>
            ): null}
            </View>
            <Pressable 
                onPress={onDate}
                style={styles.dateButton}
            >
                <icons.WhiteCalendar/>
                <Text
                    style={styles.textDateButton}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    Agendar Cita
                </Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    priceCardContainer:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center',
        alignItems: 'center',
    },
    textContainer:{
        flexDirection: 'row',
        gap: 2,
        alignItems: 'center',
    },
    priceCardText:{
        color: userColors.adviser.primary,

    },
    textCard:{
        color: textColor.accentGolden
    },
    maintainText:{
        fontSize: 13,
        color: textColor.accentGolden
    },
    dateButton:{
        borderRadius: 12,
        borderWidth: .7,
        borderColor: '#00000058',
        flexDirection: 'row',
        backgroundColor: '#d5a656',
        paddingVertical: 5,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        gap: 5,

    },
    textDateButton:{
        fontSize: 14,
        color: generalColors.white
    },
})
