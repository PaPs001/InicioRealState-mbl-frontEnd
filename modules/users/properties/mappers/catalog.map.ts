import type {
  PropertyCard2,
  PropertyMarkerCard,
} from "../types/Property/property.model";
import type {
  PropertyCatalogItemResponse,
  PropertyMarkerResponse,
} from "../types/Property/property.response";
import * as normalizeFunctions from "@/lib/utils/property-catalog";

type CardSource = Omit<PropertyMarkerResponse, "geoData">;

function mapBaseCard(item: CardSource): PropertyCard2 {
  //// a eliminar
  const price = normalizeFunctions.formatPriceData(item.priceData);
  const bed = normalizeFunctions.formattedBed(item.bed);
  const {hasMantenance, amenities, statusAmenities} = normalizeFunctions.extractAmenities(item.equipmentServices)
  const statusAmen = normalizeFunctions.formatText(item.propertyAmenities)
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
    statusAmenitie: statusAmen  === "No aplica" ? undefined : statusAmen || statusAmenities,
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

export function mapSelectedProperty(){

}
