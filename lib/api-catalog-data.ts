import { Property } from "./types";

export interface PropertyCataLogItemResponse {
    address: string;
    banner: boolean;
    bed: string | null;
    editedPhotos: string | null;
    googleDriveImages: string | null;
    id: string;
    isALand: boolean;
    list: "sale" | "rent" | string;
    locationUrl: string | null;
    maxPrice: number | null;
    minPrice: number | null;
    name: string;
    offer: boolean;
    originalPhotos: string | null;
    owner: string | null;
    parking: string | null;
    priceData: string | null;
    priceSpecial: number | null;
    propertyAmenities: string | null;
    propertyArea: string | null;
    propertyDescription: string | null;
    propertyDimensions: string | null;
    propertyInformation: string | null;
    propertyPayment: string | null;
    propertyView: string | null;
    status: string | null;
    urlImage: string | null;
    wc: string | null;
    zonaText: string | null;
}

function extractNumber(value: string | null | undefined): number {
    if (!value) return 0;
    const match = value.match(/(\d+(\.\d+)?)/);
    return match ? Number(match[1]) : 0;
}

/*En caso de no ser necesaria esta funcion a futuro debera de ser borrada
    Esta funcion se encarga de mapear el status del API a los status definidos en el tipo Property, esto es necesario debido a que el API puede retornar diferentes valores para el status y necesitamos estandarizarlos para nuestro uso interno.
*/
function mapStatusToPropertyStatus(
    list: PropertyCataLogItemResponse['list'],
    status: PropertyCataLogItemResponse['status']
): Property["status"] {
    const normalizedStatus = (status || "" ).toLowerCase();
    if (normalizedStatus.includes("proceso")) {
        return list === "rent" ? "pending_rent" : "pending_sale";
    }

    if (list === "rent") {
        return "for_rent";
    }

    return "for_sale";
}

export function mapTrialpropertyToPropertyCataLogItem(item: PropertyCataLogItemResponse): Property {
    const parsedPrice = item.minPrice ?? item.maxPrice ?? item.priceSpecial ?? 0;
    const area = extractNumber(item.propertyArea) || extractNumber(item.propertyDimensions);
    const bedrooms = extractNumber(item.bed);
    const bathrooms = extractNumber(item.wc);
    const amenities = (item.propertyAmenities || "")
        .split(/,|\n/)
        .map((value) => value.trim())
        .filter(Boolean);
   return {
        id: item.id,
        title: item.name || "Propiedad sin titulo",
        address: item.address || "Sin direccion",
        city: item.zonaText || "Sin ubicacion",
        price: parsedPrice,
        monthlyRent: item.list === "rent" ? parsedPrice : undefined,
        type: item.isALand ? "land" : "apartment",
        bedrooms: item.isALand ? 0 : bedrooms,
        bathrooms: item.isALand ? 0 : bathrooms,
        sqMeters: area,
        images: item.urlImage ? [item.urlImage] : [],
        status: mapStatusToPropertyStatus(item.list, item.status),
        description: item.propertyDescription || item.name || "Sin descripcion",
        amenities,
        features: amenities,
        createdAt: new Date().toISOString(),
    };
}
export async function CataLogData(){
    try {
        const response = await fetch('https://inicio-notifications-service.vercel.app/properties/list', {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                list: "rent"
            })
        });
        if(!response.ok){
            throw new Error('eerror para primera prueba de api en mobile')
        }
        const data = await response.json() as PropertyCataLogItemResponse[];
        //console.log('Data recibida del API:', data);
        return data
            .filter(item => (item.status || "").toLowerCase().includes("disponible"))
            .map(mapTrialpropertyToPropertyCataLogItem);
    }catch (error){
        console.error('Error al obtener datos del API:', error);
        throw error;
    }
}
