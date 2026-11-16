import { useRef, useState } from 'react'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { createBackendLeadV2Record } from '@/lib/api'
import {
  emptyLeadV2CreateForm,
  isLeadV2CreateFormValid,
  type LeadV2CreateForm,
} from '../types'

type UseCreateLeadParams = {
  mode: 'coordinator' | 'advisor'
  onCreated: () => unknown | Promise<unknown>
}

export function useCreateLead({ mode, onCreated }: UseCreateLeadParams) {
  const { authToken } = useSessionDomain()
  const [isCreateLeadModalOpen, setIsCreateLeadModalOpen] = useState(false)
  const [createLeadForm, setCreateLeadForm] = useState<LeadV2CreateForm>(emptyLeadV2CreateForm)
  const [isCreatingLead, setIsCreatingLead] = useState(false)
  const [createLeadError, setCreateLeadError] = useState<string | null>(null)
  const creatingRef = useRef(false)

  const updateCreateLeadField = (field: keyof LeadV2CreateForm, value: string) => {
    setCreateLeadForm((current) => ({ ...current, [field]: value }))
    setCreateLeadError(null)
  }

  const openCreateLeadModal = () => {
    setCreateLeadError(null)
    setIsCreateLeadModalOpen(true)
  }

  const closeCreateLeadModal = () => {
    if (creatingRef.current) return
    setIsCreateLeadModalOpen(false)
    setCreateLeadForm(emptyLeadV2CreateForm)
    setCreateLeadError(null)
  }

  const submitCreateLead = async () => {
    if (creatingRef.current) return
    if (!isLeadV2CreateFormValid(createLeadForm)) {
      setCreateLeadError('Completa todos los campos obligatorios para guardar el lead.')
      return
    }
    if (!authToken) {
      setCreateLeadError('No hay sesion activa para crear el lead.')
      return
    }

    creatingRef.current = true
    setIsCreatingLead(true)
    setCreateLeadError(null)
    try {
      await createBackendLeadV2Record({
        fullName: createLeadForm.fullName,
        phone: createLeadForm.phone,
        email: createLeadForm.email,
        status: createLeadForm.status,
        lastContactDate: createLeadForm.lastContactDate || undefined,
        estimatedBudget: createLeadForm.estimatedBudget ? Number.parseInt(createLeadForm.estimatedBudget, 10) : undefined,
        origin: createLeadForm.origin,
        operation: createLeadForm.operation,
        statusSource: mode,
      }, authToken)
    } catch (error) {
      console.warn('No se pudo crear el lead v2:', error)
      setCreateLeadError('No se pudo crear el lead. Revisa la conexion e intenta de nuevo.')
      return
    } finally {
      creatingRef.current = false
      setIsCreatingLead(false)
    }

    setIsCreateLeadModalOpen(false)
    setCreateLeadForm(emptyLeadV2CreateForm)
    await onCreated()
  }

  return {
    createLeadError,
    createLeadForm,
    isCreatingLead,
    isCreateLeadModalOpen,
    openCreateLeadModal,
    closeCreateLeadModal,
    updateCreateLeadField,
    submitCreateLead,
  }
}
