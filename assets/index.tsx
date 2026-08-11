
import type { ImageSourcePropType } from 'react-native'

import CalendarDatesIconMobile from './calendarDatesIconMobile.svg'
import CatalogIconMobile from './catalogIconMobile.svg'
import HomeIconMobile from './homeIconMobile.svg'
import LeadsIconMobile from './leadsIconMobile.svg'
import LogoInicioSVGNegro from './LogoInicioSVGNegro.svg'
import LogoInicioSVGris from './LogoInicioSVGris.svg'
import LogoNavBarPrincipal from './LogoNavBarPrincipal.svg'
import LogoIRSPrincipal from './logoIRSprincipal.svg'
import ProfileIconMobile from './profileIconMobile.svg'
import RegistryIconMobile from './RegistryIconMobile.svg'
import TextoLogoInicio from './TextoLogoInicio.svg'
import BackButton from './properties/backButton.svg'
import ArrowDown from './properties/arrowDown.svg'
import Bathroom from './properties/bathroom.svg'
import Bed from './properties/bed.svg'
import Car from './properties/car.svg'
import Order from './properties/filter.svg'
import Filter from './properties/filter2.svg'
import Fluid from './properties/fluid.svg'
import Heart from './properties/heart.svg'
import FullyFurnished from './properties/isAmueblado.svg'
import Pet from './properties/pet.svg'
import Place from './properties/place.svg'
import Pool from './properties/pool.svg'
import Searcher from './properties/searcher.svg'
import Secure from './properties/secure.svg'
import Tree from './properties/tree.svg'
import Date from './NavBar/Date.svg'
import Home from './NavBar/Home.svg'
import Lead from './NavBar/leads.svg'
import Message from './NavBar/Message.svg'
import Propertie from './NavBar/Propertie.svg'

/// Settings SVG
import Pencil from './settings/Pencil.svg'
import Blend from './settings/blendBoth.svg'
import BriefcaseBussines from './settings/briefcase-business.svg'
import BuildingApartment from './settings/BuildingApartmentSale.svg'
import Camera from './settings/Camera.svg'
import House from './settings/HouseRent.svg'
import BigEye from './settings/Eye.svg'
import Power from './settings/power.svg'
import CalendarCog from './settings/calendar-cog.svg'
import ArrowLeft from './settings/arrowLeft.svg'
import WhiteCalendar from './settings/calendarWhite.svg'

export const logos = {
  inicioGris: LogoInicioSVGris,
  inicioNegro: LogoInicioSVGNegro,
  irsPrincipal: LogoIRSPrincipal,
  navBarPrincipal: LogoNavBarPrincipal,
  textoInicio: TextoLogoInicio,
} as const

export const icons = {
  calendarDatesMobile: CalendarDatesIconMobile,
  catalogMobile: CatalogIconMobile,
  homeMobile: HomeIconMobile,
  leadsMobile: LeadsIconMobile,
  profileMobile: ProfileIconMobile,
  registryMobile: RegistryIconMobile,
  BackButton: BackButton,
  ArrowDown: ArrowDown,
  Bathroom: Bathroom,
  Bed: Bed,
  Car: Car,
  Order: Order,
  Filter: Filter,
  Fluid: Fluid,
  Heart: Heart,
  FullyFurnished: FullyFurnished,
  Pet: Pet,
  Place: Place,
  Pool: Pool,
  Searcher: Searcher,
  Secure: Secure,
  Tree: Tree,
  Pencil: Pencil,
  Blend: Blend,
  BriefcaseBussines: BriefcaseBussines,
  BuildingApartment: BuildingApartment,
  Camera: Camera,
  House: House,
  BigEye: BigEye,
  Power: Power,
  CalendarCog: CalendarCog,
  ArrowLeft: ArrowLeft,
  WhiteCalendar: WhiteCalendar

} as const

export const images = {
  departamentosLimpio: require('./departamentos_limpio.jpg') as ImageSourcePropType,
  iconoIRSPrincipalTransparencia: require('./iconoIRSprincipaltransparencia.png') as ImageSourcePropType,
  loginNewHero: require('./login-new-hero.png') as ImageSourcePropType,
  auth: {
    botonInquilino: require('./auth/BotonInquilino.jpg') as ImageSourcePropType,
    botonPropietario: require('./auth/BotonPropietario.jpg') as ImageSourcePropType,
    botonSearcher: require('./auth/BotonSearcher.jpg') as ImageSourcePropType,
    fondo1: require('./auth/fondo1.jpg') as ImageSourcePropType,
    fondoLogoAsesores: require('./auth/fondoLogoAsesores.jpg') as ImageSourcePropType,
    heroImage: require('./auth/heroImage.jpg') as ImageSourcePropType,
  },
  registerOwner: {
    featureManagement: require('./register-owner-feature-management.png') as ImageSourcePropType,
    featureSupport: require('./register-owner-feature-support.png') as ImageSourcePropType,
    featureTrust: require('./register-owner-feature-trust.png') as ImageSourcePropType,
    featureWealth: require('./register-owner-feature-wealth.png') as ImageSourcePropType,
    interestInvestment: require('./register-owner-interest-investment.png') as ImageSourcePropType,
    interestManage: require('./register-owner-interest-manage.png') as ImageSourcePropType,
    interestRentals: require('./register-owner-interest-rentals.png') as ImageSourcePropType,
    interestWealth: require('./register-owner-interest-wealth.png') as ImageSourcePropType,
    lock: require('./register-owner-lock.png') as ImageSourcePropType,
    plant: require('./register-owner-plant.png') as ImageSourcePropType,
    priorityCashflow: require('./register-owner-priority-cashflow.png') as ImageSourcePropType,
    priorityExpansion: require('./register-owner-priority-expansion.png') as ImageSourcePropType,
    priorityGrowth: require('./register-owner-priority-growth.png') as ImageSourcePropType,
    prioritySecurity: require('./register-owner-priority-security.png') as ImageSourcePropType,
    profileCommercial: require('./register-owner-profile-commercial.png') as ImageSourcePropType,
    profileMixed: require('./register-owner-profile-mixed.png') as ImageSourcePropType,
    profileRentals: require('./register-owner-profile-rentals.png') as ImageSourcePropType,
    profileResidential: require('./register-owner-profile-residential.png') as ImageSourcePropType,
    welcomeHome: require('./register-owner-welcome-home.png') as ImageSourcePropType,
    welcomeTeam: require('./register-owner-welcome-team.png') as ImageSourcePropType,
  },
} as const

export const assets = {
  icons,
  images,
  logos,
} as const

export {
  CalendarDatesIconMobile,
  CatalogIconMobile,
  HomeIconMobile,
  LeadsIconMobile,
  LogoInicioSVGNegro,
  LogoInicioSVGris,
  LogoIRSPrincipal,
  LogoNavBarPrincipal,
  ProfileIconMobile,
  RegistryIconMobile,
  TextoLogoInicio,
  BackButton,
  ArrowDown,
  Bathroom,
  Bed,
  Car,
  Order,
  Filter,
  Fluid,
  Heart,
  FullyFurnished,
  Pet,
  Place,
  Pool,
  Searcher,
  Secure,
  Tree,
  Date,
  Home,
  Lead,
  Message,
  Propertie,
  Pencil,
  Blend,
  BriefcaseBussines,
  BuildingApartment,
  Camera,
  BigEye,
  House,
  Power,
  CalendarCog,
  ArrowLeft,
  WhiteCalendar
}
