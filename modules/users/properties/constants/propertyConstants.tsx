import { icons } from "@/assets";
import { ComponentType } from "react";
import { SvgProps } from "react-native-svg";
import { propertieStatusColors } from "@/theme";

type AmenityConfig = {
    icon: ComponentType<SvgProps>,
}

export const amenitiesConfigProperty: Record<string, AmenityConfig> = {
    internet: {
        icon: icons.WifiAmenitie,
    },
    agua: {
        icon: icons.Droplets,
    },
    "a/c": {
        icon: icons.AirConditioner,
    },
    "agua anual": {
        icon: icons.Droplets,
    },
    closets: {
        icon: icons.Dresser,
    },
    "alberca privada": {
        icon: icons.PoolAmenitie,
    },
    cama: {
        icon: icons.BedDouble
    }
}

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
