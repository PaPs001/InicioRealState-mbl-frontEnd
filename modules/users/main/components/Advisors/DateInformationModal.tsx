import { AppModal } from '@/components/AppModal'

type DateInformationProps = {
  visible?: boolean
  onClose?: () => void
}

export const DateInformation = ({
  visible = false,
  onClose = () => {},
}: DateInformationProps) => {
  return(
    <AppModal
      visible={visible}
      onClose={onClose}
    >
      <></>
    </AppModal>
  )
}
