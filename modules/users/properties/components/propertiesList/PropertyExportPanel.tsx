import { View, Text, Pressable, StyleSheet } from "react-native";
import { usePropertiesScreen } from "../../hooks/usePropertiesScreen";

type PropertiesController = ReturnType<typeof usePropertiesScreen>;


export const ExportPdfPanel = ({ controller }: { controller: PropertiesController }) => {
  const {
    shouldSkipPdfAgentList,
    handleGenerateSelectedPdf,
    openPdfOptions,
    isGeneratingPdf,
    handleToggleSelectionMode,
    isSelectingProperties,
    selectedPropertyIds
  } = controller
  const shouldShowSinglePropertyButton = selectedPropertyIds.length === 1;
  const shouldShowNormalExportButtons = !shouldShowSinglePropertyButton;

  return (
    <View style={styles.exportPanel}>
      {shouldShowNormalExportButtons ? (
        <Pressable
          style={styles.exportButtonSecondary}
          onPress={shouldSkipPdfAgentList ? handleGenerateSelectedPdf : openPdfOptions}
          disabled={isGeneratingPdf}
        >
          <Text style={styles.exportButtonSecondaryText}>
            {isGeneratingPdf ? "Generando..." : "Generar"}
            {"\n"}Pdf / Cards
          </Text>
        </Pressable>
      ) : (
        <Pressable
          style={styles.exportButtonSecondary}
          onPress={handleGenerateSelectedPdf}
          disabled={isGeneratingPdf}
        >
          <Text style={styles.exportButtonSecondaryText}>
            {isGeneratingPdf ? "Generando..." : "Generar"}
            {"\n"}PDF propiedad
          </Text>
        </Pressable>
      )}
      <Pressable
        style={[
          styles.exportButtonPrimary,
          shouldShowSinglePropertyButton ? styles.exportButtonPrimaryWithSingleAction : null,
        ]}
        onPress={handleToggleSelectionMode}
      >
        <Text style={styles.exportButtonPrimaryText}>
          {isSelectingProperties ? "Terminar" : "Seleccionar"}
          {"\n"}propiedades
        </Text>
      </Pressable>
      <Text style={styles.exportHint}>
        {selectedPropertyIds.length
          ? `${selectedPropertyIds.length} seleccionadas`
          : "Comparte tu inventario"}
        {"\n"}con un clic
      </Text>
    </View>
  );
};



const styles = StyleSheet.create({
  exportPanel: {
    position: "absolute",
    right: 14,
    bottom: 84,
    width: 120,
    height: 152,
    borderRadius: 13,
    backgroundColor: "rgba(254,254,254,0.86)",
    borderWidth: 0.5,
    borderColor: "#969696",
    alignItems: "center",
    paddingTop: 11,
    zIndex: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  exportButtonSecondary: {
    width: 102,
    height: 45,
    borderRadius: 9.5,
    backgroundColor: "rgba(254,254,254,0.76)",
    borderWidth: 0.5,
    borderColor: "#969696",
    alignItems: "center",
    justifyContent: "center",
  },
  exportButtonSecondaryText: {
    color: "#0c6740",
    fontSize: 13,
    lineHeight: 15,
    textAlign: "center",
    fontWeight: "500",
  },
  exportButtonPrimary: {
    marginTop: 6,
    width: 102,
    height: 45,
    borderRadius: 9.5,
    backgroundColor: "#0c6740",
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.22)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exportButtonPrimaryWithSingleAction: {
    marginTop: 0,
  },
  exportButtonPrimaryText: {
    color: "#ffffff",
    fontSize: 13,
    lineHeight: 15,
    textAlign: "center",
    fontWeight: "500",
  },
  exportHint: {
    marginTop: 8,
    color: "#929594",
    fontSize: 8,
    lineHeight: 10,
    textAlign: "center",
  },
  mapFloatingButton: {
    position: "absolute",
    alignSelf: "center",
    bottom: 83,
    width: 103,
    height: 45,
    borderRadius: 40,
    backgroundColor: "#0c6740e1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 23,
    paddingVertical: 10,
    zIndex: 25,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 6,
  },
  mapFloatingButtonText: {
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },
});
