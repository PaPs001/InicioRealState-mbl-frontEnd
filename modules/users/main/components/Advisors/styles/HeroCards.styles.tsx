import { fontScale as appFontScale, textSize, platformLineHeight } from '@/theme/typography'
import { StyleSheet } from "react-native";
import { generalColors } from "@/theme";
export const styles = StyleSheet.create({
  availableCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
  },
  spacedLabel: {
    color: "#ffffff",
    fontSize: textSize.label,
    fontWeight: "700",
    letterSpacing: 5,
    textAlign: "center",    
  },
  availableCount: {
    color: "#d4b66f",
    fontFamily: "cormorant",
    fontSize: appFontScale[45],
    lineHeight: platformLineHeight(60),
  },
  textContainer: {
    alignItems: "center",
    gap: 3,
    paddingVertical: 15,
  },
});
