import { generalColors, userColors } from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: generalColors.background,
  },
  container: {
    flex: 1,
    paddingBottom: 66,
  },
  selectedPropertyCard: {
    position: "absolute",
    bottom: 140,
    left: 12,
    right: 12,
    maxHeight: "70%",
    borderRadius: 16,
    padding: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  closeCardButton: {
    alignSelf: "flex-end",
    padding: 8,
  },
  mapView: {
    flex: 1,
  },
  markerContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    paddingBottom: 10,
  },
  circle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    overflow: "hidden",
    zIndex: 2,
    elevation: 2,
    backgroundColor: userColors.adviser.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 52,
    height: 52,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderTopWidth: 16,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#fdfdfd",
    marginTop: -3,
  },
});
