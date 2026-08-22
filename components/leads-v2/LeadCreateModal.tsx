import { useState } from 'react'
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { CalendarDays, ChevronRight, Clock3, Search } from 'lucide-react-native'

import { styles } from '@/app/(users)/userCoordinator/leads-v2/index.styles'
import { isLeadV2CreateFormValid, type LeadPropertyOption, type LeadV2CreateForm } from './types'
import { formatPropertyPrice } from './lead-v2-utils'

const leadOriginOptions = ['ManyChat', 'Meta', 'Google Ads', 'Referido', 'Monday', 'Página Web'] as const
const leadOperationOptions = [
  { label: 'Renta', value: 'renta' },
  { label: 'Venta', value: 'venta' },
] as const

type LeadCreateModalProps = {
  createError: string | null
  filteredPropertyOptions: LeadPropertyOption[]
  form: LeadV2CreateForm
  isCreating: boolean
  isLoadingProperties: boolean
  isSelectingProperty: boolean
  onBackFromPropertyPicker: () => void
  onClose: () => void
  onOpenPropertyPicker: () => void
  onPropertySearchChange: (value: string) => void
  onSelectProperty: (property: LeadPropertyOption) => void
  onSubmit: () => void
  onUpdateField: (field: keyof LeadV2CreateForm, value: string) => void
  propertySearchQuery: string
  selectedProperty: LeadPropertyOption | null
  visible: boolean
}

export function LeadCreateModal({
  createError,
  filteredPropertyOptions,
  form,
  isCreating,
  isLoadingProperties,
  isSelectingProperty,
  onBackFromPropertyPicker,
  onClose,
  onOpenPropertyPicker,
  onPropertySearchChange,
  onSelectProperty,
  onSubmit,
  onUpdateField,
  propertySearchQuery,
  selectedProperty,
  visible,
}: LeadCreateModalProps) {
  const isFormValid = isLeadV2CreateFormValid(form)

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalKeyboardAvoidingView}
        >
        <Pressable style={styles.createLeadModal} onPress={(event) => event.stopPropagation()}>
          {isSelectingProperty ? (
            <PropertyPickerView
              isLoading={isLoadingProperties}
              onBack={onBackFromPropertyPicker}
              onSearchChange={onPropertySearchChange}
              onSelectProperty={onSelectProperty}
              properties={filteredPropertyOptions}
              searchQuery={propertySearchQuery}
              selectedPropertyId={form.propertyOfInterestId}
            />
          ) : (
            <>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Agregar lead</Text>
                  <Text style={styles.modalSubtitle}>Nombre y telefono son los datos principales</Text>
                </View>
                <TouchableOpacity style={styles.modalCloseButton} activeOpacity={0.85} onPress={onClose}>
                  <Text style={styles.modalCloseText}>Cerrar</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <LeadFormField
                  label="Nombre completo"
                  placeholder="Nombre del lead"
                  value={form.fullName}
                  onChangeText={(value) => onUpdateField('fullName', value)}
                />
                <LeadFormField
                  label="Telefono"
                  placeholder="Numero de telefono"
                  value={form.phone}
                  onChangeText={(value) => onUpdateField('phone', value)}
                  keyboardType="phone-pad"
                />
                <LeadFormField
                  label="Correo"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChangeText={(value) => onUpdateField('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <LeadFormField
                  label="Presupuesto Estimado"
                  placeholder="Ej. 250000"
                  value={form.estimatedBudget}
                  onChangeText={(value) => onUpdateField('estimatedBudget', value.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                />
                <PropertySelectField
                  property={selectedProperty}
                  propertyId={form.propertyOfInterestId}
                  onPress={onOpenPropertyPicker}
                />
                <LeadLastContactDateField
                  value={form.lastContactDate}
                  onChange={(value) => onUpdateField('lastContactDate', value)}
                />
                <LeadOptionField
                  label="Origen"
                  options={leadOriginOptions.map((option) => ({ label: option, value: option }))}
                  selectedValue={form.origin}
                  onSelect={(value) => onUpdateField('origin', value)}
                />
                <LeadOptionField
                  label="Operacion"
                  options={leadOperationOptions}
                  selectedValue={form.operation}
                  onSelect={(value) => onUpdateField('operation', value)}
                />

                {createError ? (
                  <Text style={styles.modalErrorText}>{createError}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.createLeadButton, (!isFormValid || isCreating) && styles.createLeadButtonDisabled]}
                  activeOpacity={0.85}
                  disabled={isCreating || !isFormValid}
                  onPress={onSubmit}
                >
                  <Text style={styles.createLeadButtonText}>
                    {isCreating ? 'Guardando...' : 'Guardar lead'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </>
          )}
        </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  )
}

function LeadLastContactDateField({
  onChange,
  value,
}: {
  onChange: (value: string) => void
  value: string
}) {
  const [isPickerVisible, setIsPickerVisible] = useState(false)
  const pickerDate = value ? new Date(value) : new Date()

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setIsPickerVisible(false)
      return
    }

    if (selectedDate) {
      onChange(selectedDate.toISOString())
    }

    if (Platform.OS !== 'ios') setIsPickerVisible(false)
  }

  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>Fecha Ultimo Contacto</Text>
      <TouchableOpacity
        style={styles.dateSelectButton}
        activeOpacity={0.85}
        onPress={() => setIsPickerVisible(true)}
      >
        <CalendarDays size={17} color="#0f362b" />
        <Text style={[styles.dateSelectText, !value && styles.dateSelectPlaceholder]} numberOfLines={1}>
          {value ? formatLeadDate(value) : 'Seleccionar fecha'}
        </Text>
      </TouchableOpacity>
      {isPickerVisible ? (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={handleChange}
        />
      ) : null}
    </View>
  )
}

function formatLeadDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function LeadOptionField({
  label,
  onSelect,
  options,
  selectedValue,
}: {
  label: string
  onSelect: (value: string) => void
  options: readonly { label: string; value: string }[]
  selectedValue: string
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.formOptionGrid}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value

          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.formOptionButton, isSelected && styles.formOptionButtonActive]}
              activeOpacity={0.85}
              onPress={() => onSelect(option.value)}
            >
              <Text
                style={[styles.formOptionText, isSelected && styles.formOptionTextActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

function PropertySelectField({
  onPress,
  property,
  propertyId,
}: {
  onPress: () => void
  property: LeadPropertyOption | null
  propertyId: string
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>Propiedad/interes</Text>
      <TouchableOpacity style={styles.propertySelectButton} activeOpacity={0.85} onPress={onPress}>
        <View style={styles.propertySelectCopy}>
          <Text style={styles.propertySelectTitle} numberOfLines={1}>
            {property?.title || 'Seleccionar propiedad'}
          </Text>
          <Text style={styles.propertySelectMeta} numberOfLines={1}>
            {property ? [property.address, property.city].filter(Boolean).join(' - ') || 'Propiedad seleccionada' : propertyId ? 'Propiedad seleccionada' : 'Toca para escoger del listado'}
          </Text>
        </View>
        <ChevronRight size={17} color="#0f362b" />
      </TouchableOpacity>
    </View>
  )
}

function PropertyPickerView({
  isLoading,
  onBack,
  onSearchChange,
  onSelectProperty,
  properties,
  searchQuery,
  selectedPropertyId,
}: {
  isLoading: boolean
  onBack: () => void
  onSearchChange: (value: string) => void
  onSelectProperty: (property: LeadPropertyOption) => void
  properties: LeadPropertyOption[]
  searchQuery: string
  selectedPropertyId: string
}) {
  return (
    <>
      <View style={styles.modalHeader}>
        <View>
          <Text style={styles.modalTitle}>Escoger propiedad</Text>
          <Text style={styles.modalSubtitle}>Selecciona una propiedad del listado</Text>
        </View>
        <TouchableOpacity style={styles.modalCloseButton} activeOpacity={0.85} onPress={onBack}>
          <Text style={styles.modalCloseText}>Volver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.propertySearchRow}>
        <Search size={16} color="#837f7c" />
        <TextInput
          style={styles.propertySearchInput}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Buscar por nombre o zona"
          placeholderTextColor="#9a9188"
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {isLoading ? (
          <View style={styles.emptyState}>
            <Clock3 size={24} color="#c8c1b8" />
            <Text style={styles.emptyStateText}>Cargando propiedades...</Text>
          </View>
        ) : properties.length > 0 ? (
          <View style={styles.propertyPickerList}>
            {properties.map((property) => (
              <PropertyPickerCard
                isSelected={property.id === selectedPropertyId}
                key={property.id}
                property={property}
                onPress={() => onSelectProperty(property)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Search size={24} color="#c8c1b8" />
            <Text style={styles.emptyStateText}>Sin propiedades para este filtro</Text>
          </View>
        )}
      </ScrollView>
    </>
  )
}

function PropertyPickerCard({
  isSelected,
  onPress,
  property,
}: {
  isSelected: boolean
  onPress: () => void
  property: LeadPropertyOption
}) {
  return (
    <TouchableOpacity
      style={[styles.propertyPickerCard, isSelected && styles.propertyPickerCardSelected]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {property.image ? (
        <Image source={{ uri: property.image }} style={styles.propertyPickerImage} resizeMode="cover" />
      ) : (
        <View style={styles.propertyPickerImagePlaceholder}>
          <Text style={styles.propertyPickerImageText}>{property.title.slice(0, 1).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.propertyPickerBody}>
        <Text style={styles.propertyPickerTitle} numberOfLines={1}>{property.title}</Text>
        <Text style={styles.propertyPickerAddress} numberOfLines={1}>{property.address || property.city || 'Sin ubicacion registrada'}</Text>
        <View style={styles.propertyPickerMetaRow}>
          <Text style={styles.propertyPickerPrice} numberOfLines={1}>{formatPropertyPrice(property)}</Text>
        </View>
      </View>
      <View style={[styles.propertyPickerPill, isSelected && styles.propertyPickerPillSelected]}>
        <Text style={[styles.propertyPickerPillText, isSelected && styles.propertyPickerPillTextSelected]}>
          {isSelected ? 'Lista' : 'Elegir'}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

function LeadFormField({
  autoCapitalize,
  keyboardType,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'
  label: string
  onChangeText: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        style={styles.formInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9a9188"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  )
}
