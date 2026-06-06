import type { ButtonProps } from './Button'
import { Button } from './Button'
import { useAppTheme } from '@/lib/hooks/useAppTheme'

export function SecondaryButton(props: Omit<ButtonProps, 'theme' | 'variant'>) {
  const { theme } = useAppTheme()
  return <Button {...props} theme={theme} variant="secondary" />
}

export default SecondaryButton
