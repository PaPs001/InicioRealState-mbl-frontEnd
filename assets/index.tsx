
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
import LogoIRSBlanco from './logoIRSBlanco.svg'

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



/// leads SVG
import ActionIcon from './leads/detailsLead/action_icon.svg'
import CalendarAction from './leads/detailsLead/calendar_icon.svg'
import Phone from './leads/detailsLead/phone_icon.svg'
import WhatsAppIcon from './leads/detailsLead/WhatsApp_icon.svg'


/// selected properties

import ArrowRight from './selectedProperties/arrowRight.svg'
import SealCheck from './selectedProperties/SealCheck.svg'
import Send from './selectedProperties/send.svg'
import Beach from './selectedProperties/beach.svg'
import Restaurants from './selectedProperties/restaurants.svg'
import SuperMarket from './selectedProperties/superMarket.svg'
import Lock from './properties/lock.svg'


/// Amenities Icons

import Shield from './amenitiesIcons/chield.svg'
import Oven from './amenitiesIcons/Oven.svg'
import PawPrint from './amenitiesIcons/PawPrint.svg'
import Snowflake from './amenitiesIcons/Snowflake.svg'
import TreeGreen from './amenitiesIcons/Tree.svg'
import Waves from './amenitiesIcons/Waves.svg'
import Wifi from './amenitiesIcons/wifi.svg'
import Barbell from './amenitiesIcons/barbell.svg'

import Cutlery from './amenitiesIcons/bigIcons/cutlery.svg'
import Fridge from './amenitiesIcons/bigIcons/fridge.svg'
import OvenBigger from './amenitiesIcons/bigIcons/oven.svg'
import Parking from './amenitiesIcons/bigIcons/parking.svg'
import PoolBigger from './amenitiesIcons/bigIcons/poolBigger.svg'
import SnowflakeBigger from './amenitiesIcons/bigIcons/Snowflake.svg'
import Tv from './amenitiesIcons/bigIcons/tv.svg'

export const logos = {
  inicioGris: LogoInicioSVGris,
  inicioNegro: LogoInicioSVGNegro,
  irsPrincipal: LogoIRSPrincipal,
  navBarPrincipal: LogoNavBarPrincipal,
  textoInicio: TextoLogoInicio,
  irsBlanco: LogoIRSBlanco
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
  WhiteCalendar: WhiteCalendar,
  WhatsAppIcon: WhatsAppIcon,
  CalendarAction: CalendarAction,
  ActionIcon: ActionIcon,
  Phone: Phone,
  ArrowRight: ArrowRight,
  SealChek: SealCheck,
  Send: Send,
  Beach: Beach,
  SuperMarket: SuperMarket,
  Restaurants: Restaurants,
  Shield: Shield,
  Oven: Oven,
  PawPrint: PawPrint,
  Snowflake: Snowflake,
  TreeGreen: TreeGreen,
  Waves: Waves,
  Wifi: Wifi,
  Barbell: Barbell,
  Cutlery: Cutlery,
  Fridge: Fridge,
  OvenBigger: OvenBigger,
  Parking: Parking,
  PoolBigger: PoolBigger,
  SnowflakeBigger: SnowflakeBigger,
  Tv: Tv,
  Lock: Lock
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
  WhiteCalendar,
  WhatsAppIcon,
  CalendarAction,
  ActionIcon,
  Phone,
  Send,
  SealCheck,
  ArrowRight,
  Beach,
  SuperMarket,
  Restaurants,
  Shield,
  Oven,
  PawPrint,
  Snowflake,
  TreeGreen,
  Waves,
  Wifi,
  Barbell,
  Cutlery,
  Fridge,
  OvenBigger,
  Parking,
  PoolBigger,
  SnowflakeBigger,
  Lock
}
