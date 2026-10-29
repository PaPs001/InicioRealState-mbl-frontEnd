import { textSize } from '@/theme/typography'
import { StyleSheet, View, Text, Pressable } from "react-native";
import { icons } from "@/assets";
import { generalColors, textColor, userColors } from "@/theme";
import { deleteMXNWord } from "@/modules/users/main/utils/dashboard-formatters";

type PriceCardProps = {
  onDate: () => void;
  price: string | null | undefined;
  operation?: string;
  hasMantain?: boolean;
};
export const PriceCard = ({
  onDate,
  price,
  operation,
  hasMantain,
}: PriceCardProps) => {
  const isRent = operation?.trim().toLowerCase() === "rent";

  return (
    <View style={styles.priceCardContainer}>
      <View>
        {isRent ? (
          <View style={styles.textContainer}>
            <Text style={styles.priceCardText}>{deleteMXNWord(price)}</Text>
            <Text
              style={styles.textCard}
              //adjustsFontSizeToFit
              numberOfLines={1}
            >
              MXN / mes
            </Text>
          </View>
        ) : (
          <View style={styles.textContainer}>
            <Text style={styles.priceCardText}>{deleteMXNWord(price)}</Text>
            <Text
              style={styles.textCard}
              //adjustsFontSizeToFit
              numberOfLines={1}
            >
              MXN
            </Text>
          </View>
        )}
        {hasMantain ? (
          <Text
            style={styles.maintainText}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            Mantenimiento incluido
          </Text>
        ) : null}
      </View>
      <Pressable onPress={onDate} style={styles.dateButton}>
        <icons.WhiteCalendar />
        <Text
          style={styles.textDateButton}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          Agendar Cita
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  priceCardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
  },
  priceCardText: {
    fontSize: textSize.subtitleLarge,
    color: userColors.adviser.primary,
  },
  textCard: {
    fontSize: textSize.body,
    color: textColor.accentGolden,
  },
  maintainText: {
    fontSize: textSize.bodySmall,
    color: textColor.accentGolden,
  },
  dateButton: {
    borderRadius: 12,
    borderWidth: 0.7,
    borderColor: "#00000058",
    flexDirection: "row",
    backgroundColor: "#d5a656",
    paddingVertical: 5,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    gap: 5,
  },
  textDateButton: {
    fontSize: textSize.body,
    color: generalColors.white,
  },
});
