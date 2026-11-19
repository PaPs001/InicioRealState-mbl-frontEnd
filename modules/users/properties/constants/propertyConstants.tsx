import { icons } from "@/assets";
import { ComponentType } from "react";
import { SvgProps } from "react-native-svg";
import { propertieStatusColors } from "@/theme";

type AmenityConfig = {
    icon: ComponentType<SvgProps>,
}

export const amenitiesConfigProperty: Record<string, AmenityConfig> = {
    "a/c": {
        icon: icons.AirConditioner,
    },
    "alberca": {
        icon: icons.PoolAmenitie,
    },
}

export const roullete = [
    "recamara principal",
    "recamara 2",
    "flex",
    "baño recamara",
    "sala",
    "comedor",
    "cocina",
    "baño",
    "fachada",
    "balcon",
    "area de lavado",
    "patio",
    "area comun",
    "estacionamiento",
    "terraza"
]

export const propertyStatusConfig = {
  apartada: {
    label: "Apartada",
    color: propertieStatusColors.reserved,
  },
  disponible: {
    label: "Disponible",
    color: propertieStatusColors.available
  }
} as const

export type PropertyCatalogStatus = keyof typeof propertieStatusColors
