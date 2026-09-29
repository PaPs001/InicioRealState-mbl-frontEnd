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
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 5,
    textAlign: "center",    
  },
  availableCount: {
    color: "#d4b66f",
    fontFamily: "cormorant",
    fontSize: 45,
    lineHeight: 60,
  },
  textContainer: {
    alignItems: "center",
    gap: 3,
    paddingVertical: 15,
  },
});
