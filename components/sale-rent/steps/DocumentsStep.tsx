import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Check, ChevronRight, FileText, Upload, X } from 'lucide-react-native'

import { DOCUMENTS_LIST } from '../constants'
import { advisorTheme } from '../theme'
import type { DocumentFiles } from '../types'
import { styles } from './shared'

type DocumentsStepProps = {
  additionalFiles: { name: string; uri: string }[]
  documentFiles: DocumentFiles
  expandedDocument: string | null
  handleRemoveAdditionalFile: (index: number) => void
  handleRemoveDocument: (docId: string) => void
  handleUploadAdditionalFiles: () => void
  handleUploadDocument: (docId: string) => void
  referralCode: string
  selectedDocuments: string[]
  setReferralCode: (value: string) => void
  toggleDocumentExpanded: (docId: string) => void
}

export function DocumentsStep(props: DocumentsStepProps) {
  const {
    additionalFiles,
    documentFiles,
    expandedDocument,
    handleRemoveAdditionalFile,
    handleRemoveDocument,
    handleUploadAdditionalFiles,
    handleUploadDocument,
    referralCode,
    selectedDocuments,
    setReferralCode,
    toggleDocumentExpanded,
  } = props

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepQuestion}>Documentos requeridos</Text>
      <Text style={styles.stepHint}>Expande cada documento para subir el archivo correspondiente</Text>

      <View style={styles.documentsAccordion}>
        {DOCUMENTS_LIST.map((doc) => {
          const isExpanded = expandedDocument === doc.id
          const hasFile = documentFiles[doc.id]
          const isSelected = selectedDocuments.includes(doc.id)

          return (
            <View key={doc.id} style={styles.documentAccordionItem}>
              <TouchableOpacity
                style={[
                  styles.documentAccordionHeader,
                  isExpanded && styles.documentAccordionHeaderExpanded,
                  hasFile && styles.documentAccordionHeaderWithFile,
                ]}
                onPress={() => toggleDocumentExpanded(doc.id)}
              >
                <View style={styles.documentAccordionLeft}>
                  <View style={[styles.documentCheckbox, isSelected && styles.documentCheckboxActive]}>
                    {isSelected && <Check size={12} color={advisorTheme.background} />}
                  </View>
                  <View style={styles.documentAccordionInfo}>
                    <Text style={styles.documentAccordionLabel}>{doc.label}</Text>
                    {doc.required && <Text style={styles.documentRequiredTag}>Requerido</Text>}
                    {hasFile && <Text style={styles.documentFileName}>{documentFiles[doc.id]?.name}</Text>}
                  </View>
                </View>
                <ChevronRight size={20} color={advisorTheme.textMuted} style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }} />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.documentAccordionContent}>
                  {hasFile ? (
                    <View style={styles.documentFilePreview}>
                      <View style={styles.documentFileInfo}>
                        <FileText size={24} color={advisorTheme.accent} />
                        <View style={styles.documentFileDetails}>
                          <Text style={styles.documentFileNameLarge}>{documentFiles[doc.id]?.name}</Text>
                          <Text style={styles.documentFileStatus}>Archivo cargado</Text>
                        </View>
                      </View>
                      <View style={styles.documentFileActions}>
                        <TouchableOpacity style={styles.documentChangeBtn} onPress={() => handleUploadDocument(doc.id)}>
                          <Text style={styles.documentChangeBtnText}>Cambiar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.documentRemoveBtn} onPress={() => handleRemoveDocument(doc.id)}>
                          <X size={16} color={advisorTheme.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.documentUploadArea} onPress={() => handleUploadDocument(doc.id)}>
                      <Upload size={24} color={advisorTheme.accent} />
                      <Text style={styles.documentUploadText}>Subir {doc.label}</Text>
                      <Text style={styles.documentUploadHint}>Toca para seleccionar archivo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )
        })}
      </View>

      <View style={styles.additionalFilesSection}>
        <Text style={styles.additionalFilesTitle}>Archivos adicionales (opcional)</Text>
        <Text style={styles.additionalFilesHint}>Sube cualquier otro documento relevante</Text>

        {additionalFiles.length > 0 && (
          <View style={styles.additionalFilesList}>
            {additionalFiles.map((file, index) => (
              <View key={`${file.name}-${index}`} style={styles.additionalFileItem}>
                <View style={styles.additionalFileInfo}>
                  <FileText size={18} color={advisorTheme.accent} />
                  <Text style={styles.additionalFileItemName}>{file.name}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveAdditionalFile(index)}>
                  <X size={18} color={advisorTheme.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.uploadAdditionalBtn} onPress={handleUploadAdditionalFiles}>
          <Upload size={20} color={advisorTheme.accent} />
          <Text style={styles.uploadAdditionalBtnText}>Agregar mas archivos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Código de referido (opcional)</Text>
        <View style={styles.inputBox}>
          <FileText size={20} color={advisorTheme.textMuted} />
          <TextInput style={styles.inputField} placeholder="Código de referido" placeholderTextColor={advisorTheme.textMuted} value={referralCode} onChangeText={setReferralCode} />
        </View>
      </View>
    </View>
  )
}
