import type { ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  PDF_AGENTS,
  PDF_AGENT_LABELS,
  usePropertiesScreen,
} from "../../hooks/usePropertiesScreen";

type PropertiesController = ReturnType<typeof usePropertiesScreen>;

export function PropertyPdfOptionsModal({
  controller,
}: {
  controller: PropertiesController;
}) {
  const {
    handleGeneratePdf,
    isGeneratingPdf,
    isPdfOptionsVisible,
    pdfAgentName,
    selectedPropertyIds,
    setIsPdfOptionsVisible,
    setPdfAgentName,
    shouldSkipPdfAgentList,
  } = controller;

  return (
    <Modal
      visible={isPdfOptionsVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setIsPdfOptionsVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.pdfOptionsPanel}>
          <Text style={styles.pdfOptionsTitle}>Opciones del PDF</Text>
          <Text style={styles.pdfOptionsMeta}>
            {selectedPropertyIds.length
              ? `${selectedPropertyIds.length} propiedades seleccionadas`
              : "Sin selección: se enviarán todas"}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.pdfOptionsScroll}
          >
            {!shouldSkipPdfAgentList ? (
              <PdfOptionGroup title="Asesor">
                {PDF_AGENTS.map((agent) => (
                  <PdfChip
                    key={agent}
                    label={PDF_AGENT_LABELS[agent]}
                    active={pdfAgentName === agent}
                    onPress={() => setPdfAgentName(agent)}
                  />
                ))}
              </PdfOptionGroup>
            ) : null}

            <View style={styles.pdfActionsRow}>
              <Pressable
                style={styles.pdfCancelButton}
                onPress={() => setIsPdfOptionsVisible(false)}
              >
                <Text style={styles.pdfCancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.pdfGenerateButton}
                onPress={handleGeneratePdf}
                disabled={isGeneratingPdf}
              >
                <Text style={styles.pdfGenerateButtonText}>
                  {isGeneratingPdf ? "Generando..." : "Generar PDF"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function PdfOptionGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.pdfOptionGroup}>
      <Text style={styles.pdfFieldLabel}>{title}</Text>
      <View style={styles.pdfChipWrap}>{children}</View>
    </View>
  );
}

function PdfChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.pdfChip, active && styles.pdfChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.pdfChipText, active && styles.pdfChipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  pdfOptionsPanel: {
    width: "100%",
    maxWidth: 410,
    maxHeight: "88%",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 0.5,
    borderColor: "#d8d0c5",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  pdfOptionsTitle: {
    color: "#0c6740",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
  },
  pdfOptionsMeta: {
    marginTop: 2,
    color: "#717171",
    fontSize: 11,
    lineHeight: 15,
  },
  pdfOptionsScroll: { 
    paddingBottom: 2 
  },
  pdfOptionGroup: { 
    marginTop: 13 
  },
  pdfFieldLabel: {
    color: "#3D5A40",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },
  pdfChipWrap: { 
    marginTop: 7, 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 7 
  },
  pdfChip: {
    minHeight: 29,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#969696",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9,
  },
  pdfChipActive: { 
    borderColor: "#0c6740", 
    backgroundColor: "#0c6740" 
  },
  pdfChipText: {
    color: "#505050",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "500",
  },
  pdfChipTextActive: { 
    color: "#ffffff" 
  },
  pdfActionsRow: { 
    marginTop: 15, 
    flexDirection: "row", 
    gap: 10
  },
  pdfCancelButton: {
    flex: 1,
    height: 39,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#969696",
    alignItems: "center",
    justifyContent: "center",
  },
  pdfCancelButtonText: { 
    color: "#505050", 
    fontSize: 12, 
    fontWeight: "600" 
  },
  pdfGenerateButton: {
    flex: 1,
    height: 39,
    borderRadius: 8,
    backgroundColor: "#0c6740",
    alignItems: "center",
    justifyContent: "center",
  },
  pdfGenerateButtonText: { 
    color: "#ffffff", 
    fontSize: 12, 
    fontWeight: "600"
  },
});
