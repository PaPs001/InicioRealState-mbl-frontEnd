import { textSize, platformLineHeight } from "@/theme/typography";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { usePropertiesScreen } from "../../hooks/usePropertiesScreen";

type PropertiesController = ReturnType<typeof usePropertiesScreen>;

export const ExportPdfPanel = ({
  controller,
}: {
  controller: PropertiesController;
}) => {
  const {
    shouldSkipPdfAgentList,
    handleGenerateSelectedPdf,
    openPdfOptions,
    isGeneratingPdf,
    handleToggleSelectionMode,
    isSelectingProperties,
    selectedPropertyIds,
  } = controller;
  const shouldShowSinglePropertyButton = selectedPropertyIds.length === 1;
  const shouldShowNormalExportButtons = !shouldShowSinglePropertyButton;

  return (
    <View
      style={{
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 8,
        flex: 1,
      }}
    >
      <View style={styles.exportPanel}>
        <View
          style={{
            gap: 6,
          }}
        >
          {shouldShowNormalExportButtons ? (
            <Pressable
              style={styles.exportButtonSecondary}
              onPress={
                shouldSkipPdfAgentList
                  ? handleGenerateSelectedPdf
                  : openPdfOptions
              }
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
                {"\n"} imagen
              </Text>
            </Pressable>
          )}
          <Pressable
            style={[
              styles.exportButtonPrimary,
              shouldShowSinglePropertyButton
                ? styles.exportButtonPrimaryWithSingleAction
                : null,
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  exportPanel: {
    flex: 1,
    borderRadius: 13,
    backgroundColor: "rgba(254,254,254,0.86)",
    borderWidth: 0.5,
    borderColor: "#969696",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  exportButtonSecondary: {
    width: "100%",
    borderRadius: 9.5,
    backgroundColor: "rgba(254,254,254,0.76)",
    borderWidth: 0.5,
    borderColor: "#969696",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },
  exportButtonSecondaryText: {
    color: "#0c6740",
    fontSize: textSize.bodySmall,
    lineHeight: platformLineHeight(15),
    textAlign: "center",
    fontWeight: "500",
  },
  exportButtonPrimary: {
    width: "100%",
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
    paddingVertical: 5,
  },
  exportButtonPrimaryWithSingleAction: {},
  exportButtonPrimaryText: {
    color: "#ffffff",
    fontSize: textSize.bodySmall,
    lineHeight: platformLineHeight(15),
    textAlign: "center",
    fontWeight: "500",
  },
  exportHint: {
    color: "#929594",
    fontSize: textSize.tiny,
    lineHeight: platformLineHeight(10),
    textAlign: "center",
  },
});
