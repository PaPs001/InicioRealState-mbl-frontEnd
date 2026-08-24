import { textColor } from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    roomsContainer:{
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        rowGap: 7,
    },
    roomCard:{
        width: '49.5%',
        borderRadius: 19,
        borderWidth: 1,
        borderColor: '#CBB375',
        overflow: 'hidden',
        backgroundColor: '#f3eeee',
    },
    roomTextContainer:{
        minHeight: 32,
        paddingVertical: 8,
        paddingHorizontal: 7,
        alignItems: 'center',
        justifyContent: 'center'
    },
    roomTitle:{
        width: '100%',
        fontSize: 14,
        lineHeight: 18,
        textAlign: 'center',
        flexShrink: 1,
    },
    roomSubtitle:{
        marginTop: 3,
        fontSize: 12,
        color: textColor.softText,
        textAlign: 'center'
    },
    roomImage:{
        width: '100%',
        aspectRatio: 4 / 3,
    },
})
