import { View, Text, Image, Pressable } from "react-native";
import { icons } from "@/assets";
import { DevelopmentMock } from "../../developmentMockData";
import { styles } from "./styles/DevelopmentCard.styles";
type DevelopmentCardProps = {
  onPress?: () => void;
  development: DevelopmentMock;
};

export const DevelopmentCard = ({
  onPress,
  development,
}: DevelopmentCardProps) => {
  return (
    <Pressable 
      onPress={onPress}
      style={styles.cardContainer}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: development.image }}
          style={styles.imageCard}
          resizeMode="cover"
        />
      </View>
      <View style={styles.informationContainer}>
        <View style={styles.zoneContainer}>
          <icons.Place />
          <Text style={styles.zoneText}>{development.zone}</Text>
        </View>
        <Text style={styles.nameText}>{development.name.toUpperCase()}</Text>
        <Text style={styles.locationText}>{development.location}</Text>
        <View>
          <Text style={styles.fromText}>Desde</Text>
          <Text style={styles.priceFrom}>{development.minPrice === null ? "Sin precio disponible" : `$${development.minPrice.toLocaleString("es-MX")}`}</Text>
        </View>
        {development.maxPrice !== null && (
          <Text style={styles.toText}>Hasta ${development.maxPrice.toLocaleString("es-MX")}</Text>
        )}
        <View style={styles.extraInformationContainer}>
          <View style={styles.footerInformationContainer}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={styles.extraInformationText}
            >
              {development.typeView}
            </Text>
          </View>
          <View style={styles.footerInformationContainer}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={styles.extraInformationText}
            >
              {development.nearTo}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};
