import type { Property, PropertyCatalogItemResponse, PropertyMarker } from "@/lib/types/property";
import { extractNumber, normalizeValueToText } from "./index";

export function formatPriceData(item: string): number | undefined {
  if (!item) return undefined;

  const normalized = item.replace(/[^\d,.-]/g, "");

  const amount = Number(normalized.replace(/,/g, ""));

  return Number.isFinite(amount) ? amount : undefined;
}

export function extractBoolean(value: string | undefined): boolean | undefined {
  if(!value) return undefined;

  const normalizeText = value.toLowerCase();

  return normalizeText === "si" ? true : false
}

export function formatText(value?: string | null): string {
  if (!value) return "";

  const clean = value
    .replace(/[\p{Extended_Pictographic}\u200D\uFE0F]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function extractBefore(item: string, keyword: RegExp): number | undefined {
  const match = item.match(new RegExp(`(\\d+)\\s*${keyword.source}`, "i"));
  return match ? Number(match[1]) : undefined;
}

export function parseCount(item: string | null): number | undefined {
  if (!item) return undefined;

  const match = item.match(/\d+/);
  return match ? Number(match[0]) : undefined;
}

export type FormattedBed = {
  bedrooms?: number;
  flex?: number;
  balcony?: number;
};

export function formattedBed(value: string | null): FormattedBed {
  if (!value) return {};

  return {
    bedrooms: extractBefore(value, /REC/),
    flex: extractBefore(value, /FLEX/),
    balcony: extractBefore(value, /BALCON(?:ES)?/),
  };
}


function normalizeOptionalText(value: unknown): string | undefined {
  const normalizedValue = normalizeValueToText(value)?.trim();
  if (!normalizedValue) return undefined;
  if (/^(sin dato|sin datos|n\/a|na|null|undefined)$/i.test(normalizedValue))
    return undefined;
  return normalizedValue;
}

function isStringValue(value: string | undefined): value is string {
  return Boolean(value);
}

export function normalizeListingType(
  list: PropertyCatalogItemResponse["list"],
): Property["listingType"] {
  if (list === "rent") return "rent";
  if (list === "sale") return "sale";
  return undefined;
}

function normalizeStatus(text: string | null) {
  if (text) {
    const cleaned = text
      .replace(/\p{Extended_Pictographic}/gu, "")
      .replace(/\uFE0F|\u200D/gu, "")
      .trim()
      .toLowerCase();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return null;
}

export function normalizeBooleanFlag(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  const normalizedValue = normalizeOptionalText(value)?.toLowerCase();
  return (
    normalizedValue === "true" ||
    normalizedValue === "1" ||
    normalizedValue === "si" ||
    normalizedValue === "sí" ||
    normalizedValue === "yes"
  );
}

function getPropertyTypeText(item: PropertyCatalogItemResponse): string {
  return [
    normalizeOptionalText(item.propertyType),
    normalizeOptionalText(item.propertyInformation),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isLandProperty(item: PropertyCatalogItemResponse): boolean {
  if (normalizeBooleanFlag(item.isALand) || normalizeBooleanFlag(item.isLand))
    return true;

  const normalizedType = getPropertyTypeText(item);

  return normalizedType.includes("terreno") || normalizedType.includes("land");
}

function getPropertyType(item: PropertyCatalogItemResponse): Property["type"] {
  const normalizedType = getPropertyTypeText(item);

  if (isLandProperty(item)) {
    return "land";
  }

  if (normalizedType.includes("casa") || normalizedType.includes("house")) {
    return "house";
  }

  return "apartment";
}

function isFurnishedProperty(item: PropertyCatalogItemResponse): boolean {
  const searchableText = [
    item.propertyAmenities,
    item.propertyInformation,
    item.propertyDescription,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/sin muebles|no amuebl/i.test(searchableText)) {
    return false;
  }

  return /amuebl|mueble|equipad/i.test(searchableText);
}

function getFurnishedLabel(
  item: PropertyCatalogItemResponse,
): string | undefined {
  const values = [
    item.propertyAmenities,
    item.propertyInformation,
    item.propertyDescription,
  ]
    .map(normalizeOptionalText)
    .filter(isStringValue);

  return values.find((value) => /amuebl|mueble|equipad/i.test(value));
}

function buildAmenities(item: PropertyCatalogItemResponse): string[] {
  const amenities = (normalizeOptionalText(item.propertyAmenities) || "")
    .split(/,|\n/)
    .map(normalizeOptionalText)
    .filter(isStringValue);

  if (item.pool) {
    amenities.push("Alberca");
  }

  if (item.security24_7) {
    amenities.push("Seguridad 24/7");
  }

  const solarPanel = normalizeOptionalText(item.solarPanel);
  if (solarPanel && solarPanel.toLowerCase() !== "no") {
    amenities.push("Panel solar");
  }

  const residentialDevelopment = normalizeOptionalText(
    item.residentialDevelopment,
  );
  if (residentialDevelopment) {
    amenities.push(residentialDevelopment);
  }

  return Array.from(new Set(amenities));
}

export function mapApiPropertyToProperty(
  item: PropertyCatalogItemResponse,
): Property {
  const parsedPrice = item.minPrice ?? item.maxPrice ?? item.priceSpecial ?? 0;
  const area =
    extractNumber(item.propertyArea) || extractNumber(item.propertyDimensions);
  const bedrooms = extractNumber(item.bed);
  const bathrooms = extractNumber(item.wc);
  const parking = extractNumber(item.parking);
  const amenities = buildAmenities(item);
  const listingType = normalizeListingType(item.list);
  const isLand = isLandProperty(item);
  const status = normalizeStatus(item.status);
  return {
    _id: item._id,
    id: item.id,
    title: item.name || "Propiedad sin titulo",
    address: item.address || "Sin direccion",
    city: item.zonaText || "Sin ubicacion",
    price: parsedPrice,
    priceLabel: normalizeOptionalText(item.priceData),
    monthlyRent: item.list === "rent" ? parsedPrice : undefined,
    type: getPropertyType(item),
    listingType,
    bedrooms: isLand ? 0 : bedrooms,
    bathrooms: isLand ? 0 : bathrooms,
    parking: isLand ? 0 : parking,
    view: normalizeOptionalText(item.propertyView),
    isFurnished: isFurnishedProperty(item),
    furnishedLabel: getFurnishedLabel(item),
    solarPanelLabel:
      normalizeOptionalText(item.solarPanel)?.toLowerCase() === "no"
        ? undefined
        : normalizeOptionalText(item.solarPanel),
    sqMeters: area,
    size: area,
    images: item.urlImage ? [item.urlImage] : [],
    googleDriveImages: normalizeOptionalText(item.googleDriveImages),
    locationUrl: normalizeOptionalText(item.locationUrl),
    geoData: item.geoData,
    status,
    description:
      normalizeOptionalText(item.propertyDescription) ||
      normalizeOptionalText(item.name),
    amenities,
    features: amenities,
    createdAt: new Date().toISOString(),
  };
}
