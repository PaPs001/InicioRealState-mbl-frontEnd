import type {
  AmenitiesEstructure,
  selectedPropertyBackendData,
} from "@/lib/types";

type PropertyFeature = {
  principal: string;
  extra: string | null;
  extraName: string | null;
};

export interface PropertyDetail {
  title: string;
  zone: string;
  description: string;
  bedrooms: PropertyFeature;
  bathrooms: string | null;
  parking: string | null;
  view: string | null;
  operationLabel: string;
  propertyAmenities: string | null;
  amenities: AmenitiesEstructure[];
  status: string | null;
  price: string | null;
  otherAmenities: AmenitiesEstructure[];
}

function parsePropertyFeature(text?: string | null) {
  const match = text
    ?.trim()
    .match(/^(\d+)(?:\s+REC)?\s*\+\s*(?:(\d+)\s+)?(.+)$/i);
  console.log("parsePropertyFeature", {
    recibido: JSON.stringify(text),
    grupos: match?.slice(1) ?? null,
  });

  const extraName = match?.[3]?.trim() || null;

  return {
    principal: match?.[1] ?? text?.trim() ?? "",
    extra: extraName ? (match?.[2] ?? "1") : null,
    extraName: match?.[3]?.trim() ?? null,
  };
}

export function mapApiPropertyToDetail(
  data: selectedPropertyBackendData,
): PropertyDetail {
  const otherAmenities: AmenitiesEstructure[] = [];
  if (data.pool === true) {
    otherAmenities.push({
      name: "Alberca",
      color: "",
    });
  }

  const solarPanel = data.solarPanel
    ?.trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (solarPanel === "si") {
    otherAmenities.push({
      name: "Paneles solares",
      color: "",
    });
  }
  return {
    title: data.titleApp?.trim() || data.name?.trim(),
    zone: data.zonaText?.trim() || data.address?.trim(),
    description:
      data.description?.trim() || "No hay una descripcion para esta propiedad",
    bedrooms: parsePropertyFeature(data.bed),
    bathrooms: data.wc?.trim() || null,
    parking: data.parking?.trim() || null,
    view: data.propertyView?.trim() || null,
    operationLabel: data.list?.trim(),
    propertyAmenities: data.propertyAmenities?.trim() || null,
    amenities: (data.amenities ?? [])
      .map((amenity) => ({
        name: amenity.name.trim(),
        color: amenity.color.trim(),
      }))
      .filter((amenity) => amenity.name.length > 0),
    otherAmenities,
    status: data.status?.trim() || null,
    price: data.priceData?.trim() || null,
  };
}
