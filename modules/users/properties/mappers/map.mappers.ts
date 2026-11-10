import type { ListingProperty, PropertyMarker } from "@/lib/types";
import {
  normalizeBooleanFlag,
  normalizeListingType,
} from "@/lib/utils/property-catalog";

const text = (value?: string | null) => {
  const normalized = value?.trim();
  return normalized &&
    !/^(sin dato|sin datos|n\/a|null|undefined)$/i.test(normalized)
    ? normalized
    : undefined;
};

export function mapMarkerToListing2(marker: PropertyMarker){
  
}

export function mapMarkerToListing(marker: PropertyMarker): ListingProperty {
  const tags = [
    ...new Set(
      (marker.equipmentServices ?? [])
        .map((service) => text(service.name))
        .filter((name): name is string => Boolean(name)),
    ),
  ].slice(0, 6);
  const solarPanel = text(marker.solarPanel);
  const isLand = normalizeBooleanFlag(marker.isALand);
  return {
    id: marker.id || marker._id,
    title: text(marker.name) || "Propiedad disponible",
    code: text(marker.address) || text(marker.geoData?.formatAddress) || "",
    city:
      text(marker.zonaText) ||
      text(marker.geoData?.place) ||
      "Zona sin asignar",
    view: text(marker.propertyView),
    price: 0,
    priceLabel: text(marker.priceData) || "Precio no disponible",
    listingType: normalizeListingType(marker.list),
    status: marker.status ?? null,
    image: text(marker.urlImage),
    geoData: marker.geoData,
    solarPanelLabel:
      solarPanel && !/^(no|false|0)$/i.test(solarPanel)
        ? solarPanel
        : undefined,
    bedrooms: text(marker.bed) || "—",
    bedroomsCount: Number.parseFloat(marker.bed ?? "") || 0,
    bathrooms: text(marker.wc) || "—",
    bathroomsCount: Number.parseFloat(marker.wc ?? "") || 0,
    parking: text(marker.parking) || "—",
    parkingCount: Number.parseFloat(marker.parking ?? "") || 0,
    propertyType: isLand ? "land" : "apartment",
    isLand,
    isFurnished: false,
    tags,
  };
}
