import { capitalizeFirstLetter } from "@/components/userDashboard/dashboard-formatters";
import { icons } from "@/assets";
import { ComponentType } from "react";
import { SvgProps } from "react-native-svg";

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
