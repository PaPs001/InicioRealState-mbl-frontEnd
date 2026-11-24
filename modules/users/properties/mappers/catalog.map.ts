import { roullete } from "../constants/propertyConstants";
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

type CardSource = Omit<
  PropertyMarkerResponse,
  "geoData" | "equipmentServices"
> & {
  equipmentServices?: PropertyMarkerResponse["equipmentServices"] | null;
};

function mapBaseCard(item: CardSource): PropertyCard2 {
  const bed = normalizeFunctions.formattedBed(item.bed);
  const {
    hasMantenance,
    amenities: equipmentServices,
    statusAmenities,
  } = normalizeFunctions.extractAmenities(item.equipmentServices ?? []);
  const { amenities } = normalizeFunctions.extractAmenities(
    item.amenities ?? [],
  );
  const statusAmen = normalizeFunctions.formatText(item.propertyAmenities);
  const { namePropertie, desarrollo } = normalizeFunctions.containText(item.name)
  return {
    _id: item._id,
    id: item.id,
    title: namePropertie,
    address: item.address,
    development: item.development,
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
    equipmentServices,
    propertyView: normalizeFunctions.formatText(item.propertyView),
    hasSolarPanel: normalizeFunctions.extractBoolean(item.solarPanel),
    flex: bed.flex,
    balcony: bed.balcony,
    hasMantenance: hasMantenance,
    propertyType: item.propertyType || undefined
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
      groups.set(normalizeFunctions.normalizeText(name), {
        id: normalizeFunctions.normalizeText(name),
        name,
        image: url,
        images: [url],
      });
    }
  }

  const images = [...new Set([...(cover ? [cover] : []), ...galleryImages])];

  const newSortRooms = new Map<string, PropertyDetailRoom>();
  for (const name of roullete) {
    const room = roomGroups.get(normalizeFunctions.normalizeText(name));
    if (room) {
      newSortRooms.set(name, room);
    }
  }

  const property = mapBaseCard(item);
  return {
    ...property,
    amenities: property.amenities ?? [],
    geoData: item.geoData,
    titleApp: item.titleApp?.trim() || undefined,
    zone: normalizeFunctions.formatText(item.zonaText?.trim() || item.address),
    descriptionProperty: item.description?.trim() || undefined,
    images,
    rooms: [...newSortRooms.values()],
    amenitiesImages: [...amenityGroup.values()],
    previewImages: images,
    developmentAmenities: item.developmentAmenities ?? [],
    detailedEquipment: item.detailedEquipment ?? [],
    titleCode: item.name,
    locationURL: item.locationUrl ?? "",
    developmentName: item.development,
    propertyArea: item.propertyArea || undefined,
    propertyDimension: item.propertyDimensions || undefined
  };
}
