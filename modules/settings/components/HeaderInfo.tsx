import type { ComponentType } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import type { SvgProps } from 'react-native-svg'

import { icons } from '@/assets'
import type { OperationMode } from '../types'
import type { AgentLeadNotion } from '@/lib/types'
import { SettingsOption } from './SettingsOption'
import { styles } from './styles/HeaderInfo.style'

type HeaderInfoOption = {
  value: OperationMode
  label: string
  description: string
  icon: ComponentType<SvgProps>
  height: number
  width: number
}

type HeaderInfoProps = {
  profileAvatarUri: string | null
  advisorInitials: string
  advisorName: string
  operationOptions: HeaderInfoOption[]
  operationMode: OperationMode
  onSelectOperationMode: (mode: OperationMode) => void
  onAddAgentPresentation: () => void
  hasAgentPresentation: boolean
  onChangeProfilePhoto: () => void
  isAgent: boolean
  agentLeadNotion?: AgentLeadNotion
  onActivateNotion: () => void
}

export function HeaderInfo({
  profileAvatarUri,
  advisorInitials,
  advisorName,
  operationOptions,
  operationMode,
  onSelectOperationMode,
  onAddAgentPresentation,
  hasAgentPresentation,
  onChangeProfilePhoto,
  isAgent,
  agentLeadNotion,
  onActivateNotion,
}: HeaderInfoProps) {
  const hasExistingNotion = agentLeadNotion?.status === true || (agentLeadNotion?.name && agentLeadNotion.name.length > 0)
  const notionButtonText = hasExistingNotion ? 'Cambiar nombre en Notion' : 'Activar Notion'

  return (
    <>
      <View style={styles.profileInformationContainer}>
        <View style={styles.userInfoRow}>
          <View style={styles.profileAvatarContainer}>
            {profileAvatarUri ? (
              <Image source={{ uri: profileAvatarUri }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <Text style={styles.avatarText}>{advisorInitials}</Text>
            )}
          </View>

          <View style={styles.userinformationContainer}>
            <View style={styles.userTextContainer}>
              <Text style={styles.userName}>{advisorName}</Text>
              <Text style={styles.adviserText}>Asesor de INICIO Real Estate</Text>
            </View>
            <View style={styles.activeStatusContainer}>
              <View style={styles.activeStatus}>
                <View style={styles.point} />
                <Text style={styles.statusText}>Activo</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.editProfileRow}>
          <Pressable
            disabled={hasAgentPresentation}
            onPress={onAddAgentPresentation}
            style={[styles.editButton, hasAgentPresentation && styles.editButtonDisabled]}
          >
            <icons.Pencil />
            <Text style={[styles.editText, hasAgentPresentation && styles.editTextDisabled]}>
              Agregar foto PDF
            </Text>
          </Pressable>
          <Pressable onPress={onChangeProfilePhoto} style={styles.editButton}>
            <icons.Camera />
            <Text style={styles.editText}>Cambiar Foto </Text>
          </Pressable>
        </View>
        {isAgent ? (
          <Pressable onPress={onActivateNotion} style={styles.notionButton}>
            <Text style={styles.notionButtonText}>{notionButtonText}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.optionsSection}>
        <View style={styles.optionsHeader}>
          <icons.BriefcaseBussines />
          <Text style={styles.sectionTitle}>Perfil Comercial</Text>
        </View>
        <View style={styles.options}>
          {operationOptions.map((option, index) => {
            const position = index === 0
              ? 'left'
              : index === operationOptions.length - 1
                ? 'right'
                : 'center'

            return (
              <SettingsOption
                key={option.value}
                {...option}
                selectedValue={operationMode}
                onSelect={onSelectOperationMode}
                position={position}
              />
            )
          })}
        </View>
      </View>
    </>
  )
}
