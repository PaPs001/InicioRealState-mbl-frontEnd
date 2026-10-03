import { icons } from "@/assets";
import type { FC } from "react";
import type { SvgProps } from "react-native-svg";

export type ClasificationLeads = {
  name: string;
  icon: FC<SvgProps>;
  /** Color del icono; si se omite, conserva el color del SVG. */
  iconColor?: string;
  /** Relleno para Circle, Rectangle y Cant. */
  iconFill?: string;
  extra?: string;
};

export const clasificationLeads = [
  {
    name: "ALTA PRIORIDAD",
    icon: icons.Lighting,
    iconColor: "#D7B766",
    extra: "48h",
  },
  { name: "BANDEJA DE ENTRADA", icon: icons.Tray, iconColor: "#D7B766" },
  {
    name: "SEGUIMIENTO SECUNDARIO",
    icon: icons.SandClock,
    iconColor: "#D7B766",
  },
  { name: "HISTORICOS Y CERRADOS", icon: icons.Folder, iconColor: "#D7B766" },
] as const satisfies readonly ClasificationLeads[];

export type LeadsTypes = {
  title: string;
  subtitle: string;
  numberLeads: number;
  color: string;
  countColor: string;
  icon: FC<SvgProps>;
  iconColor?: string;
  /** Relleno para Circle, Rectangle y Cant. */
  iconFill?: string;
  type: (typeof clasificationLeads)[number]["name"];
};

export const leadTrackingStatusCards: LeadsTypes[] = [
  {
    title: "EN PERFILAMIENTO",
    subtitle: "Leads en análisis y validación",
    numberLeads: 0,
    color: "#DCEFFD",
    countColor: "#A7D4F7",
    icon: icons.Circle,
    iconFill: "#2C93E0",
    type: "ALTA PRIORIDAD",
  },
  {
    title: "APARTADO",
    subtitle: "Leads con apartado en proceso",
    numberLeads: 0,
    color: "#DCEFFD",
    countColor: "#A7D4F7",
    icon: icons.Rectangle,
    iconFill: "#087BD1",
    type: "ALTA PRIORIDAD",
  },
  {
    title: "VENTA",
    subtitle: "Leads en cierre de venta",
    numberLeads: 0,
    color: "#FBDDE0",
    countColor: "#F8B7BE",
    icon: icons.Circle,
    iconFill: "#E9474C",
    type: "ALTA PRIORIDAD",
  },
  {
    title: "EN SEGUIMIENTO",
    subtitle: "Leads en seguimiento activo",
    numberLeads: 0,
    color: "#FFF3DA",
    countColor: "#FBDDA3",
    icon: icons.Circle,
    iconFill: "#FEA43F",
    type: "ALTA PRIORIDAD",
  },
  {
    title: "LEAD NUEVO",
    subtitle: "Nuevos prospectos por contactar",
    numberLeads: 0,
    color: "#FFF2CF",
    countColor: "#FBDFA2",
    icon: icons.Tray,
    iconColor: "#B89A5E",
    type: "BANDEJA DE ENTRADA",
  },
  {
    title: "REASIGNADO",
    subtitle: "Leads reasignados por contactar",
    numberLeads: 0,
    color: "#FFF2CF",
    countColor: "#FBDFA2",
    icon: icons.People,
    iconColor: "#D7B766",
    type: "BANDEJA DE ENTRADA",
  },
  {
    title: "CONTACTADO",
    subtitle: "Leads ya contactados",
    numberLeads: 0,
    color: "#EBD9FC",
    countColor: "#D5B2EF",
    icon: icons.Circle,
    iconColor: "#A55DDA",
    iconFill: "#A55DDA",
    type: "BANDEJA DE ENTRADA",
  },
  {
    title: "SIN RESPUESTA",
    subtitle: "Leads pendientes de respuesta",
    numberLeads: 0,
    color: "#EDEAE5",
    countColor: "#D6D4D0",
    icon: icons.Circle,
    iconFill: "#95938B",
    iconColor: "#B89A5E",
    type: "SEGUIMIENTO SECUNDARIO",
  },
  {
    title: "NO PUEDE COMPRAR",
    subtitle: "Leads que no califican actualmente",
    numberLeads: 0,
    color: "#E5F3E8",
    countColor: "#C6E1CE",
    icon: icons.Cant,
    iconColor: "#0C6740",
    type: "HISTORICOS Y CERRADOS",
  },
  {
    title: "COMPRÓ OTRO PROYECTO",
    subtitle: "Leads que compraron en otro desarrollo",
    numberLeads: 0,
    color: "#DCEFFD",
    countColor: "#A7D4F7",
    icon: icons.BlueHouse,
    iconColor: "#487DA9",
    type: "HISTORICOS Y CERRADOS",
  },
  {
    title: "CANCELÓ",
    subtitle: "Leads que cancelaron el proceso",
    numberLeads: 0,
    color: "#FBDDE0",
    countColor: "#F8B7BE",
    icon: icons.Canceleted,
    iconColor: "#E62F2F",
    type: "HISTORICOS Y CERRADOS",
  },
  {
    title: "SPAM",
    subtitle: "Leads no válidos o de baja calidad",
    numberLeads: 0,
    color: "#E8EAED",
    countColor: "#D5D9DE",
    icon: icons.Spam,
    iconColor: "#505452",
    type: "HISTORICOS Y CERRADOS",
  },
  {
    title: "RENTA",
    subtitle: "Leads interesados solo en renta",
    numberLeads: 0,
    color: "#DDF0E2",
    countColor: "#BEDFC7",
    icon: icons.BuildingTower,
    iconColor: "#3A7749",
    type: "HISTORICOS Y CERRADOS",
  },
];
