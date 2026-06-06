import { Alert } from 'react-native'
import { useEffect, useMemo, useState } from 'react'

import type { PropertyCatalogItemResponse } from '@/lib/api/endpoints/catalog'
import { mockSaleRentRegistrations } from '@/lib/mock-data'
import type { SaleRentRegistration } from '@/lib/types'

import {
  DOCUMENTS_LIST,
  EXTERNAL_STEPS,
  INTERNAL_STEPS,
} from '../constants'
import { appendRegistration, buildSaleRentRegistration, getStepTitle } from '../helpers'
import type { DocumentFiles, ExistingClient, ScreenMode, StepType } from '../types'

type UseSaleRentRegistrationFlowParams = {
  agentCatalogRawData: PropertyCatalogItemResponse[]
  currentUserId?: string
  hasLoadedAgentCatalog: boolean
  isAdmin: boolean
  isAgentCatalogLoading: boolean
  loadAgentCatalogProperties: () => void
}

export function useSaleRentRegistrationFlow({
  agentCatalogRawData,
  currentUserId,
  hasLoadedAgentCatalog,
  isAdmin,
  isAgentCatalogLoading,
  loadAgentCatalogProperties,
}: UseSaleRentRegistrationFlowParams) {
  const [screenMode, setScreenMode] = useState<ScreenMode>('records')
  const [localRegistrations, setLocalRegistrations] = useState<SaleRentRegistration[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [transactionType, setTransactionType] = useState<'sale' | 'rent' | null>(null)
  const [listingSource, setListingSource] = useState<'internal' | 'external' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [priceOption, setPriceOption] = useState<'original' | 'min' | 'custom'>('original')
  const [customAmount, setCustomAmount] = useState('')
  const [propertyType, setPropertyType] = useState<string | null>(null)
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [halfBaths, setHalfBaths] = useState('')
  const [parking, setParking] = useState('')
  const [isFullyEquipped, setIsFullyEquipped] = useState(false)
  const [isFurnished, setIsFurnished] = useState(false)
  const [propertyAddress, setPropertyAddress] = useState('')
  const [propertyCity, setPropertyCity] = useState('')
  const [propertyMapsUrl, setPropertyMapsUrl] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [customAmenities, setCustomAmenities] = useState('')
  const [propertyLength, setPropertyLength] = useState('')
  const [propertyWidth, setPropertyWidth] = useState('')
  const [propertyArea, setPropertyArea] = useState('')
  const [constructionArea, setConstructionArea] = useState('')
  const [propertyPhotos, setPropertyPhotos] = useState<string[]>([])
  const [propertyPrice, setPropertyPrice] = useState('')
  const [maintenanceCost, setMaintenanceCost] = useState('')
  const [currency, setCurrency] = useState<'MXN' | 'USD'>('MXN')
  const [isNegotiable, setIsNegotiable] = useState(false)
  const [propertyName, setPropertyName] = useState('')
  const [propertyDescription, setPropertyDescription] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerAddress, setOwnerAddress] = useState('')
  const [externalAgentName, setExternalAgentName] = useState('')
  const [externalCompany, setExternalCompany] = useState('')
  const [externalPhone, setExternalPhone] = useState('')
  const [externalEmail, setExternalEmail] = useState('')
  const [totalCommission, setTotalCommission] = useState('')
  const [externalCommission, setExternalCommission] = useState('')
  const [myCommission, setMyCommission] = useState('')
  const [clientSearchQuery, setClientSearchQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientContactMethod, setClientContactMethod] = useState<'phone' | 'email' | 'whatsapp'>('whatsapp')
  const [clientComments, setClientComments] = useState('')
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null)
  const [documentFiles, setDocumentFiles] = useState<DocumentFiles>({})
  const [additionalFiles, setAdditionalFiles] = useState<{ name: string; uri: string }[]>([])
  const [referralCode, setReferralCode] = useState('')

  const existingClients: ExistingClient[] = []

  useEffect(() => {
    if (!hasLoadedAgentCatalog && !isAgentCatalogLoading) {
      loadAgentCatalogProperties()
    }
  }, [hasLoadedAgentCatalog, isAgentCatalogLoading, loadAgentCatalogProperties])

  const steps = useMemo(() => {
    if (!listingSource) return ['transaction-type', 'listing-source'] as StepType[]
    return listingSource === 'internal' ? INTERNAL_STEPS : EXTERNAL_STEPS
  }, [listingSource])

  const currentStep = steps[currentStepIndex]
  const totalSteps = steps.length
  const progress = ((currentStepIndex + 1) / totalSteps) * 100

  const filteredProperties = useMemo(() => {
    const filtered = agentCatalogRawData.filter((p) => {
      const isSaleType = p.list === 'sale'
      const isRentType = p.list === 'rent'
      const isAvailable = (p.status || '').toLowerCase().includes('disponible')

      if (transactionType === 'sale') return isSaleType && isAvailable
      if (transactionType === 'rent') return isRentType && isAvailable
      return false
    })

    if (!searchQuery.trim()) return filtered
    const query = searchQuery.toLowerCase()
    return filtered.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      (p.address || '').toLowerCase().includes(query) ||
      (p.zonaText || '').toLowerCase().includes(query),
    )
  }, [agentCatalogRawData, searchQuery, transactionType])

  const selectedPropertyRaw = useMemo(() => {
    if (!selectedProperty) return null
    return agentCatalogRawData.find((p) => p.id === selectedProperty) || null
  }, [selectedProperty, agentCatalogRawData])

  const isCurrentStepValid = useMemo(() => {
    switch (currentStep) {
      case 'transaction-type':
        return transactionType !== null
      case 'listing-source':
        return listingSource !== null
      case 'select-property':
        return selectedProperty !== null
      case 'internal-price':
        return priceOption === 'custom' ? customAmount.length > 0 : true
      case 'property-type':
        return propertyType !== null
      case 'property-details':
        return bedrooms.length > 0 && bathrooms.length > 0
      case 'property-location':
        return propertyAddress.length > 0 && propertyCity.length > 0
      case 'property-pricing':
        return propertyPrice.length > 0
      case 'property-name':
        return propertyName.length > 0
      case 'owner-info':
        return ownerName.length > 0 && ownerPhone.length > 0
      case 'external-agent-info':
        return externalAgentName.length > 0
      case 'client-info':
        return clientName.length > 0 && clientPhone.length > 0
      case 'property-amenities':
      case 'property-measurements':
      case 'property-photos':
      case 'documents':
      case 'summary':
        return true
      default:
        return false
    }
  }, [
    bathrooms,
    bedrooms,
    clientName,
    clientPhone,
    customAmount,
    currentStep,
    externalAgentName,
    listingSource,
    ownerName,
    ownerPhone,
    priceOption,
    propertyAddress,
    propertyCity,
    propertyName,
    propertyPrice,
    propertyType,
    selectedProperty,
    transactionType,
  ])

  const visibleRegistrations = useMemo(() => {
    const source = [...localRegistrations, ...mockSaleRentRegistrations]
    if (isAdmin) return source
    return source.filter((record) => record.agentId === currentUserId)
  }, [currentUserId, isAdmin, localRegistrations])

  const currentStepTitle = useMemo(() => getStepTitle(currentStep), [currentStep])

  const goNext = () => {
    if (currentStepIndex < steps.length - 1 && isCurrentStepValid) {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const goBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  const handleSelectProperty = (id: string) => {
    setSelectedProperty(id)
    setPriceOption('original')
    setCustomAmount('')
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((item) => item !== amenity) : [...prev, amenity],
    )
  }

  const toggleDocument = (docId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(docId) ? prev.filter((item) => item !== docId) : [...prev, docId],
    )
  }

  const toggleDocumentExpanded = (docId: string) => {
    setExpandedDocument((prev) => (prev === docId ? null : docId))
  }

  const handleUploadDocument = (docId: string) => {
    Alert.alert('Subir documento', 'Selecciona el origen del archivo', [
      {
        text: 'Camara',
        onPress: () => {
          setDocumentFiles((prev) => ({
            ...prev,
            [docId]: { name: `${docId}_foto.jpg`, uri: 'file://mock' },
          }))
          if (!selectedDocuments.includes(docId)) {
            setSelectedDocuments((prev) => [...prev, docId])
          }
        },
      },
      {
        text: 'Galeria',
        onPress: () => {
          setDocumentFiles((prev) => ({
            ...prev,
            [docId]: { name: `${docId}_imagen.jpg`, uri: 'file://mock' },
          }))
          if (!selectedDocuments.includes(docId)) {
            setSelectedDocuments((prev) => [...prev, docId])
          }
        },
      },
      {
        text: 'Archivo',
        onPress: () => {
          setDocumentFiles((prev) => ({
            ...prev,
            [docId]: { name: `${docId}_documento.pdf`, uri: 'file://mock' },
          }))
          if (!selectedDocuments.includes(docId)) {
            setSelectedDocuments((prev) => [...prev, docId])
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  const handleRemoveDocument = (docId: string) => {
    setDocumentFiles((prev) => {
      const next = { ...prev }
      delete next[docId]
      return next
    })
  }

  const handleUploadAdditionalFiles = () => {
    Alert.alert('Subir archivos adicionales', 'Se agregara un archivo de ejemplo', [
      {
        text: 'Agregar',
        onPress: () => {
          const newFile = {
            name: `archivo_adicional_${additionalFiles.length + 1}.pdf`,
            uri: 'file://mock',
          }
          setAdditionalFiles((prev) => [...prev, newFile])
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  const handleRemoveAdditionalFile = (index: number) => {
    setAdditionalFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleSubmit = () => {
    if (!transactionType) return

    const registration = buildSaleRentRegistration({
      clientComments,
      clientEmail,
      clientName,
      clientPhone,
      customAmount,
      currentUserId,
      externalAgentName,
      externalCommission,
      listingSource,
      myCommission,
      propertyDescription,
      propertyPrice,
      referralCode,
      selectedDocuments,
      selectedProperty,
      selectedPropertyRaw,
      totalCommission,
      transactionType,
    })

    setLocalRegistrations((prev) => appendRegistration(prev, registration))
    setScreenMode('records')
    Alert.alert('Registro enviado', `Se agregó el registro de ${transactionType === 'sale' ? 'venta' : 'renta'} al listado.`)
  }

  return {
    viewState: {
      currentStepTitle,
      isAdmin,
      screenMode,
      setScreenMode,
      visibleRegistrations,
    },
    stepState: {
      currentStep,
      currentStepIndex,
      progress,
      steps,
      totalSteps,
    },
    formState: {
      additionalFiles,
      bathrooms,
      bedrooms,
      clientComments,
      clientContactMethod,
      clientEmail,
      clientName,
      clientPhone,
      clientSearchQuery,
      constructionArea,
      currency,
      customAmenities,
      customAmount,
      documentFiles,
      expandedDocument,
      existingClients,
      externalAgentName,
      externalCommission,
      externalCompany,
      externalEmail,
      externalPhone,
      halfBaths,
      isFullyEquipped,
      isFurnished,
      isNegotiable,
      listingSource,
      maintenanceCost,
      myCommission,
      ownerAddress,
      ownerEmail,
      ownerName,
      ownerPhone,
      parking,
      priceOption,
      propertyAddress,
      propertyArea,
      propertyCity,
      propertyDescription,
      propertyLength,
      propertyMapsUrl,
      propertyName,
      propertyPhotos,
      propertyPrice,
      propertyType,
      propertyWidth,
      referralCode,
      searchQuery,
      selectedAmenities,
      selectedClient,
      selectedDocuments,
      selectedProperty,
      totalCommission,
      transactionType,
    },
    derived: {
      filteredProperties,
      isAgentCatalogLoading,
      isCurrentStepValid,
      selectedPropertyRaw,
    },
    actions: {
      goBack,
      goNext,
      handleRemoveAdditionalFile,
      handleRemoveDocument,
      handleSelectProperty,
      handleSubmit,
      handleUploadAdditionalFiles,
      handleUploadDocument,
      setBathrooms,
      setBedrooms,
      setClientComments,
      setClientContactMethod,
      setClientEmail,
      setClientName,
      setClientPhone,
      setClientSearchQuery,
      setConstructionArea,
      setCurrency,
      setCustomAmenities,
      setCustomAmount,
      setExternalAgentName,
      setExternalCommission,
      setExternalCompany,
      setExternalEmail,
      setExternalPhone,
      setHalfBaths,
      setIsFullyEquipped,
      setIsFurnished,
      setIsNegotiable,
      setListingSource,
      setMaintenanceCost,
      setMyCommission,
      setOwnerAddress,
      setOwnerEmail,
      setOwnerName,
      setOwnerPhone,
      setParking,
      setPriceOption,
      setPropertyAddress,
      setPropertyArea,
      setPropertyCity,
      setPropertyDescription,
      setPropertyLength,
      setPropertyMapsUrl,
      setPropertyName,
      setPropertyPrice,
      setPropertyType,
      setPropertyWidth,
      setReferralCode,
      setSearchQuery,
      setSelectedClient,
      setScreenMode,
      setTotalCommission,
      setTransactionType,
      toggleAmenity,
      toggleDocument,
      toggleDocumentExpanded,
    },
  }
}
