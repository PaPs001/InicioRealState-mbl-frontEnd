import { StyleSheet } from "react-native";
import { generalColors, textColor } from "@/theme";
export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: generalColors.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 5,
    flex: 1,
    gap: 10
  },
  backButton: {},
  filterContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    paddingRight: 25,
    backgroundColor: generalColors.backgroundSections,
  },
  searchInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: generalColors.borderSoft,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  filterButton: {
    aspectRatio: 1,
    flexShrink: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: generalColors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  developmentsContainer: {
    flex: 1,
    gap: 10,
  },
  developmentsTitle: {
    fontSize: 24,
    color: generalColors.development,

  },
});
