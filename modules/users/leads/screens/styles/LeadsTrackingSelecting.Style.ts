import { generalColors, textColor, userColors } from "@/theme";
import { Rows } from "lucide-react-native";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: generalColors.background,
    width: "100%",
    height: "100%",
  },
  container: {
    paddingHorizontal: 20,
    gap: 12,
  },
  leadsList: { flex: 1 },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D6DED5',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    color: '#233F2D',
    fontSize: 15,
  },
  paginationContainer: { gap: 12, paddingVertical: 16 },
  paginationSummary: { textAlign: 'center', color: '#767676', fontSize: 12 },
  paginationControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  pageButton: { backgroundColor: '#F4F1E7', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12 },
  pageButtonDisabled: { opacity: 0.4 },
  logoSectionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  headerButton: {
    padding: 15,
    borderRadius: 999,
    backgroundColor: "#F4F1E7",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 10,
  },
  rightLogoSectionContainer: {
    flexDirection: "row",
    gap: 7,
    position: "absolute",
    right: 10,
  },
  headerContainer: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
		marginTop: 10
  },
  headerTitlesContainer: {
    flex: 1,
  },
  iaHelperButton: {
    backgroundColor: userColors.adviser.primarySoft,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  filtersCarrouselContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F1E7",
    borderRadius: 12,
  },
  cardsContainer: {
    paddingBottom: 90,
    gap: 10,
    marginTop: 10,
  },


  ////Textos

  titleHeader: {
		fontSize: 27,
		color: '#233F2D',

	},
  subtitleHeader: {
		fontSize: 13,
		color: textColor.softText,
		fontWeight: '400'
	},
  iaHelperText: {
		color: '#fff',
		fontSize: 12,
	},
  filterText: {
		fontSize: 12,
		fontWeight: '400',

	},
});
