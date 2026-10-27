import type {
  AmenitiesEstructure,
  GeoData,
  PropertyEquipmentServiceResponse,
  selectedPropertyBackendData,
} from "@/lib/types";

export type PropertyDetailRoom = {
  id: string;
  name: string;
  image: string;
  images: string[];
};

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
  equipmentServices: PropertyEquipmentServiceResponse[];
  hasMantenimiento: boolean;
  status: string | null;
  price: string | null;
  otherAmenities: AmenitiesEstructure[];
  images: string[];
  previewImages: string[];
  rooms: PropertyDetailRoom[];
  amenitiesImages: PropertyDetailRoom[];
  geoData: GeoData;
}

function parsePropertyFeature(text?: string | null) {
  const match = text
    ?.trim()
    .match(/^(\d+)(?:\s+REC)?\s*\+\s*(?:(\d+)\s+)?(.+)$/i);

  const extraName = match?.[3]?.trim() || null;

  return {
    principal: match?.[1] ?? text?.trim() ?? "",
    extra: extraName ? (match?.[2] ?? "1") : null,
    extraName: match?.[3]?.trim() ?? null,
  };
}

export function mapApiPropertyToDetail(
  data: selectedPropertyBackendData,
  resolvedImages: ReadonlyMap<string, string> = new Map(),
): PropertyDetail {
  const galleryImages = new Set<string>();
  const roomGroups = new Map<string, PropertyDetailRoom>();
  const amenityGroups = new Map<string, PropertyDetailRoom>();
  const cover = data.urlImage?.trim();

  for (const image of data.images ?? []) {
    const url = resolvedImages.get(image.key) || (!image.encrypted ? image.url?.trim() : undefined);
    if (!url) continue;
    galleryImages.add(url);

    const amenitieName = image.amenitieName?.trim();
    const zone = image.zone?.trim();
    const name = amenitieName || zone;
    if (!name) continue;
    const groups = amenitieName ? amenityGroups : roomGroups;
    const existingRoom = groups.get(name);
    if (existingRoom) {
      if (!existingRoom.images.includes(url)) existingRoom.images.push(url);
    } else {
      groups.set(name, {
        id: name,
        name,
        image: url,
        images: [url],
      });
    }
  }
  const images = [...new Set([...(cover ? [cover] : []), ...galleryImages])];
  const otherAmenities: AmenitiesEstructure[] = [];
  const equipmentServices = (data.equipmentServices ?? [])
    .map((service) => ({
      ...service,
      name: service.name.trim(),
      color: service.color.trim(),
    }))
    .filter((service) => service.name.length > 0);
  const hasMantenimiento = equipmentServices.some(
    (service) => service.name.toLowerCase() === "mantenimiento",
  );
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
  if (data.security24_7 === true) {
    otherAmenities.push({ name: "Seguridad 24/7", color: "" });
  }
  return {
    images,
    previewImages: images,
    rooms: [...roomGroups.values()],
    amenitiesImages: [...amenityGroups.values()],
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
    equipmentServices,
    hasMantenimiento,
    status: data.status?.trim() || null,
    price: data.priceData?.trim() || null,
    geoData: data.geoData,
  };
}
