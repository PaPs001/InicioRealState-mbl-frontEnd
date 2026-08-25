import { textColor } from '@/theme'
import {StyleSheet} from 'react-native'

export const styles = StyleSheet.create({
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    amenitieCard:{
        flexShrink: 0,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#0000005e',
        paddingVertical: 5,
        paddingHorizontal: 7,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 5,

    },
    amenitieText:{
        fontSize: 10,
        color: textColor.softText,
    }
})
