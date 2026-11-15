import type {
  PropertyCard2,
  PropertyMarkerCard,
  SelectedPropertyMapped,
  PropertyDetailRoom,
} from "../types/Property/property.model";
import type {
  PropertyCatalogItemResponse,
  PropertyMarkerResponse,
  SelectedPropertyResponse,
} from "../types/Property/property.response";
import * as normalizeFunctions from "@/lib/utils/property-catalog";

type CardSource = Omit<PropertyMarkerResponse, "geoData" | "equipmentServices"> & {
  equipmentServices?: PropertyMarkerResponse["equipmentServices"] | null;
};

function mapBaseCard(item: CardSource): PropertyCard2 {
  const bed = normalizeFunctions.formattedBed(item.bed);
  const { hasMantenance, amenities, statusAmenities } =
    normalizeFunctions.extractAmenities(item.equipmentServices ?? []);
  const statusAmen = normalizeFunctions.formatText(item.propertyAmenities);
  return {
    _id: item._id,
    id: item.id,
    title: item.name,
    address: item.address,
    price: item.priceData, //// al final no
    bedrooms: bed.bedrooms, //// aqui si se formateo por numero
    bathrooms: normalizeFunctions.parseCount(item.wc),
    parkings: normalizeFunctions.parseCount(item.parking), /// estos tres son el mismo caso
    isAland: item.isALand,
    typeListProperty: item.list,
    propertyImage: item.urlImage || undefined,
    statusAmenitie:
      statusAmen === "No aplica" ? undefined : statusAmen || statusAmenities,
    statusProperty: normalizeFunctions.formatText(item.status),
    zone: normalizeFunctions.formatText(item.zonaText),
    amenities: amenities,
    propertyView: normalizeFunctions.formatText(item.propertyView),
    hasSolarPanel: normalizeFunctions.extractBoolean(item.solarPanel),
    flex: bed.flex,
    balcony: bed.balcony,
    hasMantenance: hasMantenance,
  };
}

export function mapApiPropertyToCard(
  item: PropertyCatalogItemResponse,
): PropertyCard2 {
  return mapBaseCard(item);
}

export function mapApiMarkerToCard(
  item: PropertyMarkerResponse,
): PropertyMarkerCard {
  return {
    ...mapBaseCard(item),
    geoData: item.geoData,
  };
}

export function mapSelectedProperty(
  item: SelectedPropertyResponse,
  resolvedImages: ReadonlyMap<string, string> = new Map(),
): SelectedPropertyMapped {
  const galleryImages = new Set<string>();
  const roomGroups = new Map<string, PropertyDetailRoom>();
  const amenityGroup = new Map<string, PropertyDetailRoom>();
  const cover = item.urlImage?.trim();

  for (const image of item.images ?? item.Images ?? []) {
    const url = resolvedImages.get(image.key) || undefined;
    if (!url) continue;

    galleryImages.add(url);
    const zone = image.zone?.trim();

    const isAmenity = /^Amenidades\b/i.test(zone ?? "");

    const name = isAmenity
      ? zone?.replace(/^Amenidades\s*-\s*/i, "").trim()
      : zone;

    if (!name) continue;

    const groups = isAmenity ? amenityGroup : roomGroups;
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

  const property = mapBaseCard(item);
  return {
    ...property,
    amenities: property.amenities ?? [],
    geoData: item.geoData,
    titleApp: item.titleApp?.trim() || undefined,
    zone: normalizeFunctions.formatText(item.zonaText?.trim() || item.address),
    descriptionProperty: item.description?.trim() || undefined,
    images,
    rooms: [...roomGroups.values()],
    amenitiesImages: [...amenityGroup.values()],
    previewImages: images,
  };
}
