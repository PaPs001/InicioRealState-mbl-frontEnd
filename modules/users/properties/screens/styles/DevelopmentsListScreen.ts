import { StyleSheet } from "react-native";
import { generalColors, textColor } from "@/theme";
export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: generalColors.background,
  },
  container: {
    flex: 1,
  },
  floatingHeader: {
    position: "absolute",
    top: 5,
    left: 17,
    right: 17,
    zIndex: 10,
    gap: 10,
    backgroundColor: "#fdfbf93d",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 15,
  },
  backButton: {},
  filterContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    paddingRight: 25,
  },
  searchInput: {
    flex: 1,
    minHeight: 42,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: generalColors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  searchTextInput: {
    flex: 1,
    fontSize: 10,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 95,
    paddingBottom: 24,
  },

  developmentsContainer: {
    flex: 1,
    gap: 10,
    paddingBottom: 60
  },
  developmentsTitle: {
    fontSize: 24,
    color: generalColors.development,
  },
  headerList: {
    marginBottom: 15,
  },
});
