import { BackButton } from "@/assets";
import { StyleSheet } from "react-native";
import { generalColors } from "@/theme";
export const styles = StyleSheet.create({
    container:{
        flex: 1,
        position: 'relative',
        
    },
    mainImage:{
        width: '100%',
        height: 270,
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
    /// patrones de imagenes 


    threeColumns: {
        flexDirection: 'row',
        gap: 4,
        height: 180,
        paddingBottom: 5
    },
    threeColumnImage: {
        flex: 1,
        height: '100%',
    },
    twoColumns: {
        flexDirection: 'row',
        gap: 4,
        height: 220,
        paddingBottom: 5
    },
    twoColumnImage: {
        flex: 1,
        height: '100%',
    },
    singleImageBlock: {
        height: 240,
    },
    singleImage: {
        width: '100%',
        height: '100%',
    },



    fourColumn:{
        height: 300,
        flexDirection: 'row',
        overflow: 'hidden',
        gap: 5,
        paddingBottom: 5
    },
    leftColumn:{
        flex: 2,
        gap: 5,
        overflow: 'hidden'
    },
    rightColumn:{
        flex: 1,
        overflow: 'hidden', 
        gap: 5
    },
    topLeftImage:{
        flex: 2,
        height: '100%'
    },
    bottomLeftImage:{
        flex: 3,
        width: '100%'
    },
    topRightImage:{
        flex: 1,
        width: '100%'
    },
    bottomRightImage:{
        flex: 1,
        width: '100%'
    },
})
