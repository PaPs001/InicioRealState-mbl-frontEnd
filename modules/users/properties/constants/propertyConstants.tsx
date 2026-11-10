import { capitalizeFirstLetter } from "@/modules/users/main/utils/dashboard-formatters";
import { icons } from "@/assets";
import { ComponentType } from "react";
import { SvgProps } from "react-native-svg";
import { propertieStatusColors } from "@/theme";

type AmenityConfig = {
    label: string,
    icon: ComponentType<SvgProps>,
}

export const amenitiesConfigSelectedProperty: Record<string, AmenityConfig>={
    seguridad:{
        icon: icons.Shield,
        label: "seguridad"
    },
    alberca: {
        icon: icons.Pool,
        label: "alberca"
    },
    "areas verdes": {
        icon: icons.TreeGreen,
        label: "areas verdes"
    },
    "pet Friendly": {
        icon: icons.PawPrint,
        label: "pet friendly"
    },
    "aire acondicionado":{
        icon: icons.Snowflake,
        label: "aire acondicionado"
    },
    "cocina equipada": {
        icon: icons.Oven,
        label: "cocina equipada"
    },
    wifi:{
        icon: icons.Wifi,
        label: "wifi"
    },
    gimnasio: {
        icon: icons.Barbell,
        label: "gimnasio"
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
