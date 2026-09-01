import {usePathname} from 'expo-router'

import type {Property, PropertyLead} from '@/lib/types'
import {useOperationMode} from '@/modules/settings'
import {AppointmentCreateModal} from './AppointmentCreateModal'
import {useAppointmentCreateFlow} from '../hooks/useAppointmentCreateFlow'

type Props = {
  initialLead?: PropertyLead
  initialProperty?: Property
  onClose: () => void
  onCreated?: () => void
  visible: boolean
}

export function AppointmentCreateFlow(props: Props) {
  const pathname = usePathname()
  const {capabilities} = useOperationMode()
  const {modalProps} = useAppointmentCreateFlow({...props, capabilities, returnPath: pathname})
  return <AppointmentCreateModal {...modalProps} />
}
