import type { ButtonProps } from './Button'
import { Button } from './Button'
import { useAppTheme } from '@/lib/hooks/useAppTheme'

export function PrimaryButton(props: Omit<ButtonProps, 'theme' | 'variant'>) {
  const { theme } = useAppTheme()
  return <Button {...props} theme={theme} variant="primary" />
}

export default PrimaryButton
