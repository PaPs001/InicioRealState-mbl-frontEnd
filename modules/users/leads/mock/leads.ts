import { icons } from "@/assets";
import type { FC } from "react";
import type { SvgProps } from "react-native-svg";

export type ClasificationLeads = {
  name: string;
  icon: FC<SvgProps>;
  extra?: string;
};

export const clasificationLeads = [
  { name: "alta prioridad", icon: icons.ActionIcon, extra: "48h" },
  { name: "Bandeja de entrada", icon: icons.CalendarAction },
  { name: "Seguimiento secundario", icon: icons.Clock },
  { name: "Historico y cerrados", icon: icons.BriefcaseBussines },
] as const satisfies readonly ClasificationLeads[];

export type LeadsTypes = {
  title: string;
  subtitle: string;
  numberLeads: number;
  color: string;
  countColor: string;
  icon: FC<SvgProps>;
  type: (typeof clasificationLeads)[number]["name"];
};

export const mockLeads: LeadsTypes[] = [
  {
    title: "EN PERFILAMIENTO",
    subtitle: "Leads en análisis y validación",
    numberLeads: 5,
    color: "#DCEFFD",
    countColor: "#A7D4F7",
    icon: icons.ActionIcon,
    type: "alta prioridad",
  },
  {
    title: "APARTADO",
    subtitle: "Leads con apartado en proceso",
    numberLeads: 3,
    color: "#DCEFFD",
    countColor: "#A7D4F7",
    icon: icons.ActionIcon,
    type: "alta prioridad",
  },
  {
    title: "VENTA",
    subtitle: "Leads en cierre de venta",
    numberLeads: 1,
    color: "#FBDDE0",
    countColor: "#F8B7BE",
    icon: icons.ActionIcon,
    type: "alta prioridad",
  },
  {
    title: "EN SEGUIMIENTO",
    subtitle: "Leads en seguimiento activo",
    numberLeads: 14,
    color: "#FFF3DA",
    countColor: "#FBDDA3",
    icon: icons.ActionIcon,
    type: "alta prioridad",
  },
  {
    title: "LEAD NUEVO",
    subtitle: "Nuevos prospectos por contactar",
    numberLeads: 12,
    color: "#FFF2CF",
    countColor: "#FBDFA2",
    icon: icons.ActionIcon,
    type: "Bandeja de entrada",
  },
  {
    title: "CONTACTADO",
    subtitle: "Leads ya contactados",
    numberLeads: 7,
    color: "#EBD9FC",
    countColor: "#D5B2EF",
    icon: icons.Phone,
    type: "Bandeja de entrada",
  },
  {
    title: "SIN RESPUESTA",
    subtitle: "Leads pendientes de respuesta",
    numberLeads: 4,
    color: "#EDEAE5",
    countColor: "#D6D4D0",
    icon: icons.Clock,
    type: "Seguimiento secundario",
  },
  {
    title: "NO PUEDE COMPRAR",
    subtitle: "Leads que no califican actualmente",
    numberLeads: 6,
    color: "#E5F3E8",
    countColor: "#C6E1CE",
    icon: icons.Lock,
    type: "Historico y cerrados",
  },
  {
    title: "COMPRÓ OTRO PROYECTO",
    subtitle: "Leads que compraron en otro desarrollo",
    numberLeads: 3,
    color: "#DCEFFD",
    countColor: "#A7D4F7",
    icon: icons.House,
    type: "Historico y cerrados",
  },
  {
    title: "CANCELÓ",
    subtitle: "Leads que cancelaron el proceso",
    numberLeads: 5,
    color: "#FBDDE0",
    countColor: "#F8B7BE",
    icon: icons.ActionIcon,
    type: "Historico y cerrados",
  },
  {
    title: "SPAM",
    subtitle: "Leads no válidos o de baja calidad",
    numberLeads: 8,
    color: "#E8EAED",
    countColor: "#D5D9DE",
    icon: icons.Lock,
    type: "Historico y cerrados",
  },
  {
    title: "RENTA",
    subtitle: "Leads interesados solo en renta",
    numberLeads: 4,
    color: "#DDF0E2",
    countColor: "#BEDFC7",
    icon: icons.BuildingApartment,
    type: "Historico y cerrados",
  },
];
