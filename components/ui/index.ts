/**
 * Componentes UI Base Reutilizables
 * 
 * Estos componentes siguen el sistema de diseno definido en lib/theme.ts
 * y soportan temas personalizados a traves de la prop `theme`.
 * 
 * @example
 * ```tsx
 * import { Button, Input, Card, Modal, Loading, Badge } from '@/components/ui'
 * 
 * // Uso basico
 * <Button onPress={handleSubmit}>Enviar</Button>
 * 
 * // Con tema personalizado
 * <Button theme={clientThemes.investor} variant="primary">
 *   Invertir
 * </Button>
 * ```
 */

export { Button } from './Button'
export type { ButtonProps } from './Button'

export { Input } from './Input'
export type { InputProps } from './Input'
export { PasswordTextInput } from './PasswordTextInput'

export { Card, CardHeader, CardContent, CardFooter } from './Card'
export type { CardProps } from './Card'

export { Modal } from './Modal'
export type { ModalProps } from './Modal'

export { Loading } from './Loading'
export type { LoadingProps } from './Loading'

export { Badge } from './Badge'
export type { BadgeProps } from './Badge'

export { AppScreen } from './AppScreen'
export { AppHeader } from './AppHeader'
export { SectionCard } from './SectionCard'
export { InfoRow } from './InfoRow'
export { FormField } from './FormField'
export { StatusBadge } from './StatusBadge'
export { PrimaryButton } from './PrimaryButton'
export { SecondaryButton } from './SecondaryButton'
