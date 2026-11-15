import { amenitiesConfigProperty } from "@/modules/users/properties/constants/propertyConstants";
import { AmenitiesMapped } from "@/modules/users/properties/types/Property/property.model";
import { AmenitiesResponse } from "@/modules/users/properties/types/Property/property.response";

export function formatPriceData(item: string): number | undefined {
  if (!item) return undefined;

  const normalized = item.replace(/[^\d,.-]/g, "");

  const amount = Number(normalized.replace(/,/g, ""));

  return Number.isFinite(amount) ? amount : undefined;
}

export function extractBoolean(value: string | null | undefined): boolean {
  return (
    value
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase() === "si"
  );
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

export function extractBefore(
  item: string,
  keyword: RegExp,
): number | undefined {
  const match = item.match(new RegExp(`(\\d+)\\s*${keyword.source}`, "i"));
  return match ? Number(match[1]) : undefined;
}

export function parseCount(item: string | null): number | undefined {
  if (!item) return undefined;

  const match = item.match(/\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(",", ".")) : undefined;
}

export type FormattedBed = {
  bedrooms?: number;
  flex?: number;
  balcony?: number;
};

export function formattedBed(value: string | null): FormattedBed {
  if (!value) return {};

  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return {
    bedrooms: extractBefore(normalized, /REC/) ?? parseCount(normalized),
    flex: extractBefore(normalized, /FLEX/) ?? (/(?:^|\+)\s*FLEX\b/i.test(normalized) ? 1 : undefined),
    balcony: extractBefore(normalized, /BALCON(?:ES)?/) ?? (/(?:^|\+)\s*BALCON(?:ES)?\b/i.test(normalized) ? 1 : undefined),
  };
}

export function extractMaintining(
  item: AmenitiesMapped[] | undefined,
): boolean | undefined {
  if (!item) return undefined;

  const hasMaintenance = item.some(
    (amenitie) => amenitie.name.trim().toLowerCase() === "mantenimiento",
  );

  return hasMaintenance;
}

const generalPrhases = [
  "totalmente equipada",
  "cocina integral",
  "semiequipada",
  "sin muebles",
  "cocina y closets",
  "semiamueblada",
  "sin equipar",
];

const expulsedPrhases = ["no aplica", "paneles solares"];

export function extractAmenities(item: AmenitiesResponse[]) {
  const amenities: AmenitiesMapped[] = [];
  let hasMantenance = false;
  let statusAmenities = "";

  for (const service of item) {
    if (!service.name.trim()) continue;
    if (service.name.trim().toLowerCase() === "mantenimiento") {
      hasMantenance = true;
    } else if (
      generalPrhases.some((prhase) =>
        service.name.trim().toLowerCase().includes(prhase),
      )
    ) {
      statusAmenities = service.name.trim();
    } else {
      if (
        !expulsedPrhases.some((prhase) =>
          service.name.trim().toLowerCase().includes(prhase),
        )
      ) {
        const name = service.name.trim().toLowerCase();
        const match = Object.entries(amenitiesConfigProperty).find(
          ([keyword]) => name.includes(keyword.trim().toLowerCase()),
        );

        amenities.push({
          ...service,
          icons: match?.[1].icon,
        });
      }
    }
  }

  return {
    amenities,
    hasMantenance,
    statusAmenities,
  };
}
