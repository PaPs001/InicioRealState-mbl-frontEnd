import { Animated, Text, TouchableOpacity, View } from 'react-native'
import { Check, ChevronRight, Home, Key, Search } from 'lucide-react-native'
import type { BuyerFormData } from './types'

interface BuyerSearchPreferencesStepProps {
  animatedStyle: object
  styles: any
  theme: any
  formData: BuyerFormData
  isCurrentStepValid: boolean
  onSelectSearchType: (value: 'buy' | 'rent') => void
  onContinue: () => void
  onSkip: () => void
}

export function BuyerSearchPreferencesStep({
  animatedStyle,
  styles,
  theme,
  formData,
  isCurrentStepValid,
  onSelectSearchType,
  onContinue,
  onSkip,
}: BuyerSearchPreferencesStepProps) {
  return (
    <Animated.View style={[styles.stepContainer, animatedStyle]}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>¿Qué estás buscando?</Text>
        <Text style={styles.stepSubtitle}>Cuéntanos para mostrarte las mejores opciones</Text>
      </View>

      <View style={styles.searchTypeContainer}>
        <TouchableOpacity
          style={[
            styles.searchTypeOption,
            formData.searchType === 'buy' && styles.searchTypeOptionSelected,
          ]}
          onPress={() => onSelectSearchType('buy')}
        >
          <View
            style={[
              styles.searchTypeIcon,
              formData.searchType === 'buy' && styles.searchTypeIconSelected,
            ]}
          >
            <Key size={28} color={formData.searchType === 'buy' ? theme.surface : theme.primary} />
          </View>
          <Text
            style={[
              styles.searchTypeTitle,
              formData.searchType === 'buy' && styles.searchTypeTitleSelected,
            ]}
          >
            Comprar
          </Text>
          <Text style={styles.searchTypeDesc}>Encuentra tu proximo hogar</Text>
          {formData.searchType === 'buy' ? (
            <View style={styles.checkBadge}>
              <Check size={14} color={theme.surface} />
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.searchTypeOption,
            formData.searchType === 'rent' && styles.searchTypeOptionSelected,
          ]}
          onPress={() => onSelectSearchType('rent')}
        >
          <View
            style={[
              styles.searchTypeIcon,
              formData.searchType === 'rent' && styles.searchTypeIconSelected,
            ]}
          >
            <Home size={28} color={formData.searchType === 'rent' ? theme.surface : theme.primary} />
          </View>
          <Text
            style={[
              styles.searchTypeTitle,
              formData.searchType === 'rent' && styles.searchTypeTitleSelected,
            ]}
          >
            Rentar
          </Text>
          <Text style={styles.searchTypeDesc}>Opciones flexibles para ti</Text>
          {formData.searchType === 'rent' ? (
            <View style={styles.checkBadge}>
              <Check size={14} color={theme.surface} />
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <View style={styles.preferencesButtons}>
        <TouchableOpacity
          style={[styles.continueButton, !isCurrentStepValid && styles.continueButtonDisabled]}
          onPress={onContinue}
          disabled={!isCurrentStepValid}
        >
          <Search size={20} color={theme.textLight} />
          <Text style={styles.continueButtonText}>Buscar propiedades</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipButtonText}>Prefiero explorar todo</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}
