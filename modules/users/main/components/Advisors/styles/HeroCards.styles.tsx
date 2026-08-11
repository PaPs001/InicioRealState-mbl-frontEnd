import { StyleSheet } from "react-native";
import { generalColors } from "@/theme";
export const styles = StyleSheet.create({
  availableCard:{
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    gap: 5,
  },
  spacedLabel:{
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 5,
  },
  availableCount:{
    color: '#d4b66f',
    fontFamily: "cormorant",
    fontSize: 50,
    lineHeight: 48,
  },
})
