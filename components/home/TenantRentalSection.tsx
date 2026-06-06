import { Text, TouchableOpacity, View } from 'react-native'
import {
  AlertCircle,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Droplets,
  FileText,
  Flame,
  Home,
  MapPin,
  Phone,
  Shield,
  User,
  UsersRound,
  Wifi,
  Zap,
} from 'lucide-react-native'

interface TenantRentalSectionProps {
  styles: any
  dynamicStyles: any
  theme: any
  tenantActiveTab: 'general' | 'services'
  setTenantActiveTab: (tab: 'general' | 'services') => void
  tenantRental: any
  tenantProperty: any
  tenantLandlord: any
  tenantAgent: any
  daysUntilPayment: number
  formatCurrency: (value: number) => string
  formatDate: (value: string) => string
  onCall: (phone: string) => void
  onOpenDocuments: () => void
}

export function TenantRentalSection({
  styles,
  dynamicStyles,
  theme,
  tenantActiveTab,
  setTenantActiveTab,
  tenantRental,
  tenantProperty,
  tenantLandlord,
  tenantAgent,
  daysUntilPayment,
  formatCurrency,
  formatDate,
  onCall,
  onOpenDocuments,
}: TenantRentalSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={dynamicStyles.sectionTitle}>Mi Renta</Text>

      <View style={[styles.tenantTabsContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.tenantTabButton, tenantActiveTab === 'general' && { backgroundColor: theme.accent }]}
          onPress={() => setTenantActiveTab('general')}
        >
          <Home size={18} color={tenantActiveTab === 'general' ? theme.background : theme.textMuted} />
          <Text
            style={[
              styles.tenantTabText,
              { color: tenantActiveTab === 'general' ? theme.background : theme.textMuted },
            ]}
          >
            General
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tenantTabButton, tenantActiveTab === 'services' && { backgroundColor: theme.accent }]}
          onPress={() => setTenantActiveTab('services')}
        >
          <Zap size={18} color={tenantActiveTab === 'services' ? theme.background : theme.textMuted} />
          <Text
            style={[
              styles.tenantTabText,
              { color: tenantActiveTab === 'services' ? theme.background : theme.textMuted },
            ]}
          >
            Servicios
          </Text>
        </TouchableOpacity>
      </View>

      {tenantActiveTab === 'general' ? (
        <>
          <View style={[styles.tenantPropertyCard, { backgroundColor: theme.green }]}>
            <View style={[styles.tenantPropertyIcon, { backgroundColor: theme.green + '80' }]}>
              <Home size={32} color={theme.accent} />
            </View>
            <Text style={[styles.tenantPropertyTitle, { color: theme.textLight }]}>{tenantProperty.title}</Text>
            <View style={styles.tenantLocationRow}>
              <MapPin size={16} color={theme.textLight + '80'} />
              <Text style={[styles.tenantLocationText, { color: theme.textLight + '80' }]}>
                {tenantProperty.address}, {tenantProperty.city}
              </Text>
            </View>

            <View style={[styles.tenantRentInfo, { backgroundColor: theme.green + '60' }]}>
              <View style={styles.tenantRentItem}>
                <Text style={[styles.tenantRentLabel, { color: theme.textLight + '80' }]}>Renta mensual</Text>
                <Text style={[styles.tenantRentAmount, { color: theme.accent }]}>
                  {formatCurrency(tenantRental.monthlyRent)}
                </Text>
              </View>
              <View style={[styles.tenantRentDivider, { backgroundColor: theme.textLight + '30' }]} />
              <View style={styles.tenantRentItem}>
                <Text style={[styles.tenantRentLabel, { color: theme.textLight + '80' }]}>Proximo pago</Text>
                <Text style={styles.tenantRentDays}>{daysUntilPayment} dias</Text>
              </View>
            </View>
          </View>

          {tenantLandlord ? (
            <View style={styles.tenantSection}>
              <Text style={[styles.tenantSectionTitle, { color: theme.text }]}>Propietario</Text>
              <View style={[styles.tenantContactCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.tenantContactHeader}>
                  <View style={[styles.tenantContactAvatar, { backgroundColor: theme.green + '20' }]}>
                    <User size={20} color={theme.green} />
                  </View>
                  <View style={styles.tenantContactInfo}>
                    <Text style={[styles.tenantContactName, { color: theme.text }]}>{tenantLandlord.name}</Text>
                    <Text style={[styles.tenantContactRole, { color: theme.textMuted }]}>Dueno de la propiedad</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.tenantCallButton, { backgroundColor: theme.green + '15' }]}
                    onPress={() => onCall(tenantLandlord.phone)}
                  >
                    <Phone size={18} color={theme.green} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null}

          {tenantAgent ? (
            <View style={styles.tenantSection}>
              <Text style={[styles.tenantSectionTitle, { color: theme.text }]}>Asesor Encargado</Text>
              <View style={[styles.tenantContactCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.tenantContactHeader}>
                  <View style={[styles.tenantContactAvatar, { backgroundColor: theme.accent + '20' }]}>
                    <User size={20} color={theme.accent} />
                  </View>
                  <View style={styles.tenantContactInfo}>
                    <Text style={[styles.tenantContactName, { color: theme.text }]}>{tenantAgent.name}</Text>
                    <Text style={[styles.tenantContactRole, { color: theme.textMuted }]}>Asesor Inicio</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.tenantCallButton, { backgroundColor: theme.accent + '15' }]}
                    onPress={() => onCall(tenantAgent.phone)}
                  >
                    <Phone size={18} color={theme.accent} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null}

          <View style={styles.tenantSection}>
            <Text style={[styles.tenantSectionTitle, { color: theme.text }]}>Informacion del Contrato</Text>
            <View style={[styles.tenantInfoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.tenantInfoRow}>
                <Calendar size={18} color={theme.green} />
                <Text style={[styles.tenantInfoLabel, { color: theme.textMuted }]}>Inicio del contrato:</Text>
                <Text style={[styles.tenantInfoValue, { color: theme.text }]}>{formatDate(tenantRental.startDate)}</Text>
              </View>
              <View style={styles.tenantInfoRow}>
                <Clock size={18} color={theme.warm} />
                <Text style={[styles.tenantInfoLabel, { color: theme.textMuted }]}>Fin del contrato:</Text>
                <Text style={[styles.tenantInfoValue, { color: theme.text }]}>{formatDate(tenantRental.endDate)}</Text>
              </View>
              <View style={styles.tenantInfoRow}>
                <DollarSign size={18} color={theme.accent} />
                <Text style={[styles.tenantInfoLabel, { color: theme.textMuted }]}>Dia de pago:</Text>
                <Text style={[styles.tenantInfoValue, { color: theme.text }]}>Dia {tenantRental.paymentDay} de cada mes</Text>
              </View>
              <View style={styles.tenantInfoRow}>
                <Shield size={18} color={theme.accent} />
                <Text style={[styles.tenantInfoLabel, { color: theme.textMuted }]}>Deposito:</Text>
                <Text style={[styles.tenantInfoValue, { color: theme.text }]}>{formatCurrency(tenantRental.depositAmount)}</Text>
              </View>
            </View>
          </View>

          {tenantRental.rules && tenantRental.rules.length > 0 ? (
            <View style={styles.tenantSection}>
              <Text style={[styles.tenantSectionTitle, { color: theme.text }]}>Reglas del Inmueble</Text>
              <View style={[styles.tenantRulesCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {tenantRental.rules.map((rule: string, index: number) => (
                  <View key={index} style={styles.tenantRuleItem}>
                    <AlertCircle size={14} color={theme.warm} />
                    <Text style={[styles.tenantRuleText, { color: theme.text }]}>{rule}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </>
      ) : (
        <>
          <View style={styles.tenantSection}>
            <Text style={[styles.tenantSectionTitle, { color: theme.text }]}>Servicios</Text>
            <View style={styles.tenantServicesGrid}>
              <TouchableOpacity
                style={[styles.tenantServiceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => onCall(tenantRental.utilities.electricity.phone)}
              >
                <View style={[styles.tenantServiceIcon, { backgroundColor: '#fbbf24' + '20' }]}>
                  <Zap size={20} color="#fbbf24" />
                </View>
                <Text style={[styles.tenantServiceName, { color: theme.text }]}>Luz</Text>
                <Text style={[styles.tenantServiceProvider, { color: theme.textMuted }]}>
                  {tenantRental.utilities.electricity.provider}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tenantServiceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => onCall(tenantRental.utilities.water.phone)}
              >
                <View style={[styles.tenantServiceIcon, { backgroundColor: '#3b82f6' + '20' }]}>
                  <Droplets size={20} color="#3b82f6" />
                </View>
                <Text style={[styles.tenantServiceName, { color: theme.text }]}>Agua</Text>
                <Text style={[styles.tenantServiceProvider, { color: theme.textMuted }]}>
                  {tenantRental.utilities.water.provider}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tenantServiceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => onCall(tenantRental.utilities.gas.phone)}
              >
                <View style={[styles.tenantServiceIcon, { backgroundColor: '#ef4444' + '20' }]}>
                  <Flame size={20} color="#ef4444" />
                </View>
                <Text style={[styles.tenantServiceName, { color: theme.text }]}>Gas</Text>
                <Text style={[styles.tenantServiceProvider, { color: theme.textMuted }]}>
                  {tenantRental.utilities.gas.provider}
                </Text>
              </TouchableOpacity>

              {tenantRental.utilities.internet ? (
                <TouchableOpacity
                  style={[styles.tenantServiceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => onCall(tenantRental.utilities.internet.phone)}
                >
                  <View style={[styles.tenantServiceIcon, { backgroundColor: '#22c55e' + '20' }]}>
                    <Wifi size={20} color="#22c55e" />
                  </View>
                  <Text style={[styles.tenantServiceName, { color: theme.text }]}>Internet</Text>
                  <Text style={[styles.tenantServiceProvider, { color: theme.textMuted }]}>
                    {tenantRental.utilities.internet.provider}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.tenantSection}>
            <Text style={[styles.tenantSectionTitle, { color: theme.text }]}>Comunidad</Text>
            <View style={[styles.tenantCommunityCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.tenantCommunityIcon, { backgroundColor: theme.green + '20' }]}>
                <UsersRound size={24} color={theme.green} />
              </View>
              <View style={styles.tenantCommunityInfo}>
                <Text style={[styles.tenantCommunityTitle, { color: theme.text }]}>Grupo de Residentes</Text>
                <Text style={[styles.tenantCommunityDesc, { color: theme.textMuted }]}>
                  Unete al grupo de WhatsApp de la comunidad
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.tenantCommunityCard,
                { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 12 },
              ]}
            >
              <View style={[styles.tenantCommunityIcon, { backgroundColor: theme.accent + '20' }]}>
                <Shield size={24} color={theme.accent} />
              </View>
              <View style={styles.tenantCommunityInfo}>
                <Text style={[styles.tenantCommunityTitle, { color: theme.text }]}>Administracion del Coto</Text>
                <Text style={[styles.tenantCommunityDesc, { color: theme.textMuted }]}>
                  Contacto y reglas de la comunidad
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.tenantSection}>
            <Text style={[styles.tenantSectionTitle, { color: theme.text }]}>Documentos</Text>
            <TouchableOpacity
              style={[styles.tenantDocumentsCard, { backgroundColor: theme.green, borderColor: theme.green }]}
              onPress={onOpenDocuments}
            >
              <View style={styles.tenantDocumentsContent}>
                <View style={[styles.tenantDocumentsIcon, { backgroundColor: theme.textLight + '20' }]}>
                  <FileText size={28} color={theme.textLight} />
                </View>
                <View style={styles.tenantDocumentsInfo}>
                  <Text style={[styles.tenantDocumentsTitle, { color: theme.textLight }]}>Ver Documentos</Text>
                  <Text style={[styles.tenantDocumentsDesc, { color: theme.textLight + '80' }]}>
                    Contrato, comprobantes y mas
                  </Text>
                </View>
              </View>
              <View style={[styles.tenantDocumentsButton, { backgroundColor: theme.accent }]}>
                <Download size={20} color={theme.background} />
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  )
}
