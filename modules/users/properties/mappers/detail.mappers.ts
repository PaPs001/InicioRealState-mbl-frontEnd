import type {
  AmenitiesEstructure,
  selectedPropertyBackendData,
} from "@/lib/types";
import type { PropertyRoomImageResponse } from "@/lib/types/property";

export type PropertyDetailRoom = {
  id: string;
  name: string;
  image: string;
  images: string[];
};

const PROPERTY_IMAGES_URL = "https://images.contentforge.fyi";

function imageUrl(
  image: PropertyRoomImageResponse,
  size: "thumbnail" | "medium" | "large",
) {
  const key = (
    size === "large"
      ? image.largeKey || image.mediumKey || image.key
      : size === "thumbnail"
        ? image.key || image.mediumKey || image.largeKey
        : image.mediumKey || image.largeKey || image.key
  )?.trim();
  if (!key) return null;
  return `${PROPERTY_IMAGES_URL}/${key.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/")}`;
}

type PropertyFeature = {
  principal: string;
  extra: string | null;
  extraName: string | null;
};

export interface LocationsData {
  latitude: number;
  longitude: number;
}

export interface GeoData {
  place: string | null;
  placeId: string | null;
  locations: LocationsData;
  formatAddress: string | null;
}

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
  images: string[];
  previewImages: string[];
  rooms: PropertyDetailRoom[];
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
): PropertyDetail {
  const galleryImages = new Map<string, string>();
  const previewImages = new Map<string, string>();
  const cover = data.urlImage?.trim();
  const rooms = (data.rooms ?? []).flatMap((room, index) => {
    const images = (room.images ?? []).flatMap((image) => {
      const url = imageUrl(image, "large");
      if (!url) return [];
      const identity = image.fileId?.trim() || url;
      if (!galleryImages.has(identity)) {
        galleryImages.set(identity, url);
        previewImages.set(identity, imageUrl(image, "thumbnail") || url);
      }
      return [url];
    });
    if (!images.length) return [];
    const firstImage = (room.images ?? [])
      .map((image) => imageUrl(image, "medium"))
      .find(Boolean);
    return [
      {
        id: room._id || `${room.idFolder}-${index}`,
        name: room.name_room?.trim() || "Habitación",
        image: firstImage || images[0],
        images: [...new Set(images)],
      },
    ];
  });
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
  if (data.security24_7 === true) {
    otherAmenities.push({ name: "Seguridad 24/7", color: "" });
  }
  return {
    images: [
      ...new Set([...(cover ? [cover] : []), ...galleryImages.values()]),
    ],
    previewImages: [
      ...new Set([...(cover ? [cover] : []), ...previewImages.values()]),
    ],
    rooms,
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
    geoData: data.geoData,
  };
}
