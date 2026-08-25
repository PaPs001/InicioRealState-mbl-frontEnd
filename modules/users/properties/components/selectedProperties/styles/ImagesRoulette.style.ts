import { generalColors, userColors } from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container:{

    },
    principalImage:{
        width: '100%',
        height: 270,
    },
    scrollImagesContainer:{
        width: '100%',
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
        flexDirection: 'row',
        overflow: 'hidden',

    },
    principalImageContainer: {
        position: 'relative',
        width: '100%',
    },
    imagesInScroll:{
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    imagesContainer:{
        position: 'relative',
        width: 100,
        height: 90,
    },
    imagesCountOverlay:{
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        borderRadius: 12,
    },
    imagesCountText:{
        color: generalColors.white,
        fontSize: 13,
        fontWeight: '700',
    },
    buttonsContainer:{
        position: 'absolute',
        top: 35,
        left: 20,
        flexDirection: 'row',
    },
    buttonOverImage:{
        borderRadius: 999,
        backgroundColor: generalColors.white,
        height: 45,
        width: 45,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    leftButtonsContainer:{
        position: 'absolute',
        top: 35,
        right: 25,
        flexDirection: 'row',
        gap: 9,
    },
    backButton:{
        position: 'absolute',
        top: 35,
        left: 25,
    },
    statusContainer:{
        position: 'absolute',
        bottom: 12,
        left: 25,
        backgroundColor: userColors.adviser.primary,
        borderRadius: 17,
        paddingHorizontal: 12,
        paddingVertical: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusText:{
        fontSize: 10,
        color: generalColors.white,
    }
})
