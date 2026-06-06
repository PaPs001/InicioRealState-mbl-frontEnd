import type { ReactNode } from 'react'

import { ClientInfoStep } from './steps/ClientInfoStep'
import { DocumentsStep } from './steps/DocumentsStep'
import { ExternalAgentInfoStep } from './steps/ExternalAgentInfoStep'
import { InternalPriceStep } from './steps/InternalPriceStep'
import { ListingSourceStep } from './steps/ListingSourceStep'
import { OwnerInfoStep } from './steps/OwnerInfoStep'
import { PropertyAmenitiesStep } from './steps/PropertyAmenitiesStep'
import { PropertyDetailsStep } from './steps/PropertyDetailsStep'
import { PropertyLocationStep } from './steps/PropertyLocationStep'
import { PropertyMeasurementsStep } from './steps/PropertyMeasurementsStep'
import { PropertyNameStep } from './steps/PropertyNameStep'
import { PropertyPhotosStep } from './steps/PropertyPhotosStep'
import { PropertyPricingStep } from './steps/PropertyPricingStep'
import { PropertyTypeStep } from './steps/PropertyTypeStep'
import { SelectPropertyStep } from './steps/SelectPropertyStep'
import { SummaryStep } from './steps/SummaryStep'
import { TransactionTypeStep } from './steps/TransactionTypeStep'
import type { StepType } from './types'

type SaleRentStepRegistryParams = {
  currentStep: StepType
  formState: any
  derived: any
  actions: any
}

export function renderSaleRentStepContent({
  actions,
  currentStep,
  derived,
  formState,
}: SaleRentStepRegistryParams): ReactNode {
  const stepRegistry: Record<StepType, ReactNode> = {
    'transaction-type': (
      <TransactionTypeStep
        transactionType={formState.transactionType}
        onChange={actions.setTransactionType}
      />
    ),
    'listing-source': (
      <ListingSourceStep
        listingSource={formState.listingSource}
        onChange={actions.setListingSource}
      />
    ),
    'select-property': (
      <SelectPropertyStep
        filteredProperties={derived.filteredProperties}
        isAgentCatalogLoading={derived.isAgentCatalogLoading}
        searchQuery={formState.searchQuery}
        selectedProperty={formState.selectedProperty}
        transactionType={formState.transactionType}
        onChangeSearchQuery={actions.setSearchQuery}
        onClearSearchQuery={() => actions.setSearchQuery('')}
        onSelectProperty={actions.handleSelectProperty}
      />
    ),
    'internal-price': (
      <InternalPriceStep
        customAmount={formState.customAmount}
        priceOption={formState.priceOption}
        selectedPropertyRaw={derived.selectedPropertyRaw}
        transactionType={formState.transactionType}
        onChangeCustomAmount={actions.setCustomAmount}
        onChangePriceOption={actions.setPriceOption}
      />
    ),
    'property-type': (
      <PropertyTypeStep
        propertyType={formState.propertyType}
        onChange={actions.setPropertyType}
      />
    ),
    'property-details': (
      <PropertyDetailsStep
        bathrooms={formState.bathrooms}
        bedrooms={formState.bedrooms}
        halfBaths={formState.halfBaths}
        isFullyEquipped={formState.isFullyEquipped}
        isFurnished={formState.isFurnished}
        parking={formState.parking}
        setBathrooms={actions.setBathrooms}
        setBedrooms={actions.setBedrooms}
        setHalfBaths={actions.setHalfBaths}
        setIsFullyEquipped={actions.setIsFullyEquipped}
        setIsFurnished={actions.setIsFurnished}
        setParking={actions.setParking}
      />
    ),
    'property-location': (
      <PropertyLocationStep
        propertyAddress={formState.propertyAddress}
        propertyCity={formState.propertyCity}
        propertyMapsUrl={formState.propertyMapsUrl}
        setPropertyAddress={actions.setPropertyAddress}
        setPropertyCity={actions.setPropertyCity}
        setPropertyMapsUrl={actions.setPropertyMapsUrl}
      />
    ),
    'property-amenities': (
      <PropertyAmenitiesStep
        customAmenities={formState.customAmenities}
        selectedAmenities={formState.selectedAmenities}
        setCustomAmenities={actions.setCustomAmenities}
        toggleAmenity={actions.toggleAmenity}
      />
    ),
    'property-measurements': (
      <PropertyMeasurementsStep
        constructionArea={formState.constructionArea}
        propertyArea={formState.propertyArea}
        propertyLength={formState.propertyLength}
        propertyWidth={formState.propertyWidth}
        setConstructionArea={actions.setConstructionArea}
        setPropertyArea={actions.setPropertyArea}
        setPropertyLength={actions.setPropertyLength}
        setPropertyWidth={actions.setPropertyWidth}
      />
    ),
    'property-photos': (
      <PropertyPhotosStep propertyPhotos={formState.propertyPhotos} />
    ),
    'property-pricing': (
      <PropertyPricingStep
        currency={formState.currency}
        isNegotiable={formState.isNegotiable}
        maintenanceCost={formState.maintenanceCost}
        propertyPrice={formState.propertyPrice}
        setCurrency={actions.setCurrency}
        setIsNegotiable={actions.setIsNegotiable}
        setMaintenanceCost={actions.setMaintenanceCost}
        setPropertyPrice={actions.setPropertyPrice}
        transactionType={formState.transactionType}
      />
    ),
    'property-name': (
      <PropertyNameStep
        propertyDescription={formState.propertyDescription}
        propertyName={formState.propertyName}
        setPropertyDescription={actions.setPropertyDescription}
        setPropertyName={actions.setPropertyName}
      />
    ),
    'owner-info': (
      <OwnerInfoStep
        ownerAddress={formState.ownerAddress}
        ownerEmail={formState.ownerEmail}
        ownerName={formState.ownerName}
        ownerPhone={formState.ownerPhone}
        setOwnerAddress={actions.setOwnerAddress}
        setOwnerEmail={actions.setOwnerEmail}
        setOwnerName={actions.setOwnerName}
        setOwnerPhone={actions.setOwnerPhone}
      />
    ),
    'external-agent-info': (
      <ExternalAgentInfoStep
        externalAgentName={formState.externalAgentName}
        externalCommission={formState.externalCommission}
        externalCompany={formState.externalCompany}
        externalEmail={formState.externalEmail}
        externalPhone={formState.externalPhone}
        myCommission={formState.myCommission}
        setExternalAgentName={actions.setExternalAgentName}
        setExternalCommission={actions.setExternalCommission}
        setExternalCompany={actions.setExternalCompany}
        setExternalEmail={actions.setExternalEmail}
        setExternalPhone={actions.setExternalPhone}
        setMyCommission={actions.setMyCommission}
        setTotalCommission={actions.setTotalCommission}
        totalCommission={formState.totalCommission}
      />
    ),
    'client-info': (
      <ClientInfoStep
        clientComments={formState.clientComments}
        clientContactMethod={formState.clientContactMethod}
        clientEmail={formState.clientEmail}
        clientName={formState.clientName}
        clientPhone={formState.clientPhone}
        clientSearchQuery={formState.clientSearchQuery}
        selectedClient={formState.selectedClient}
        setClientComments={actions.setClientComments}
        setClientContactMethod={actions.setClientContactMethod}
        setClientEmail={actions.setClientEmail}
        setClientName={actions.setClientName}
        setClientPhone={actions.setClientPhone}
        setClientSearchQuery={actions.setClientSearchQuery}
        setSelectedClient={actions.setSelectedClient}
      />
    ),
    documents: (
      <DocumentsStep
        additionalFiles={formState.additionalFiles}
        documentFiles={formState.documentFiles}
        expandedDocument={formState.expandedDocument}
        handleRemoveAdditionalFile={actions.handleRemoveAdditionalFile}
        handleRemoveDocument={actions.handleRemoveDocument}
        handleUploadAdditionalFiles={actions.handleUploadAdditionalFiles}
        handleUploadDocument={actions.handleUploadDocument}
        referralCode={formState.referralCode}
        selectedDocuments={formState.selectedDocuments}
        setReferralCode={actions.setReferralCode}
        toggleDocumentExpanded={actions.toggleDocumentExpanded}
      />
    ),
    summary: (
      <SummaryStep
        clientName={formState.clientName}
        clientPhone={formState.clientPhone}
        currency={formState.currency}
        customAmount={formState.customAmount}
        listingSource={formState.listingSource}
        ownerName={formState.ownerName}
        priceOption={formState.priceOption}
        propertyAddress={formState.propertyAddress}
        propertyCity={formState.propertyCity}
        propertyName={formState.propertyName}
        propertyPrice={formState.propertyPrice}
        selectedDocuments={formState.selectedDocuments}
        selectedPropertyRaw={derived.selectedPropertyRaw}
        transactionType={formState.transactionType}
      />
    ),
  }

  return stepRegistry[currentStep] || null
}
