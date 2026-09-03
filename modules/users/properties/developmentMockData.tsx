export type DevelopmentMock = {
  id: string;
  name: string;
  location: string;
  zone: string;
  image?: string;
  typeView: string;
  nearTo: string;
  portraitImage: string;
  developmentGallery: object[];
};

export const DevelopmentMocks: DevelopmentMock[] = [
  {
    id: "ADHO",
    name: "Aldea Hortus",
    location: "Tondoroque, Nayarit",
    image: "https://picsum.photos/900/600?random=2",
    zone: "Bahia de banderas",
    typeView: "Vista panoramica",
    nearTo: "Cercas de la playa",
    portraitImage: "https://picsum.photos/900/600?random=2",
    developmentGallery: [
      {
        label: "Fachada",
        url: "https://picsum.photos/900/600?random=2",
      },
      {
        label: "Alberca",
        url: "https://picsum.photos/900/600?random=3",
      },
      {
        label: "Acceso",
        url: "https://picsum.photos/900/600?random=4",
      },
      {
        label: "Área común",
        url: "https://picsum.photos/900/600?random=5",
      },
      {
        label: "Exterior",
        url: "https://picsum.photos/900/600?random=6",
      },
    ],
  },
  {
    id: "VBC",
    name: "V Bucerias",
    location: "Bucerias, Nayarit",
    image: "https://picsum.photos/900/600?random=1",
    zone: "Bahia de banderas",
    typeView: "Vista panoramica",
    nearTo: "Cercas de la playa",
    portraitImage: "https://picsum.photos/900/600?random=1",
    developmentGallery: [
      {
        label: "Fachada",
        url: "https://picsum.photos/900/600?random=7",
      },
      {
        label: "Alberca",
        url: "https://picsum.photos/900/600?random=8",
      },
      {
        label: "Acceso",
        url: "https://picsum.photos/900/600?random=9",
      },
      {
        label: "Área común",
        url: "https://picsum.photos/900/600?random=10",
      },
      {
        label: "Exterior",
        url: "https://picsum.photos/900/600?random=11",
      },
    ],
  },
  {
    id: "MDP",
    name: "Mar de Plata",
    location: "Bucerias, Nayarit",
    image: "https://picsum.photos/900/600?random=3",
    zone: "Bahia de banderas",
    typeView: "Vista panoramica",
    nearTo: "Cercas de la playa",
    portraitImage: "https://picsum.photos/900/600?random=3",
    developmentGallery: [
      {
        label: "Fachada",
        url: "https://picsum.photos/900/600?random=12",
      },
      {
        label: "Alberca",
        url: "https://picsum.photos/900/600?random=13",
      },
      {
        label: "Acceso",
        url: "https://picsum.photos/900/600?random=14",
      },
      {
        label: "Área común",
        url: "https://picsum.photos/900/600?random=15",
      },
      {
        label: "Exterior",
        url: "https://picsum.photos/900/600?random=16",
      },
    ],
  },
  {
    id: "AVI",
    name: "Altea Vida Integral",
    location: "La floresta, Puerto Vallarta",
    image: "https://picsum.photos/900/600?random=4",
    zone: "Puerto Vallarta",
    typeView: "Vista panoramica",
    nearTo: "Cercas de la playa",
    portraitImage: "https://picsum.photos/900/600?random=4",
    developmentGallery: [
      {
        label: "Fachada",
        url: "https://picsum.photos/900/600?random=17",
      },
      {
        label: "Alberca",
        url: "https://picsum.photos/900/600?random=18",
      },
      {
        label: "Acceso",
        url: "https://picsum.photos/900/600?random=19",
      },
      {
        label: "Área común",
        url: "https://picsum.photos/900/600?random=20",
      },
      {
        label: "Exterior",
        url: "https://picsum.photos/900/600?random=21",
      },
    ],
  },
  {
    id: "ALNA",
    name: "Alana",
    location: "Mezcales, Nayarit",
    image: "https://picsum.photos/900/600?random=5  ",
    zone: "Bahia de banderas",
    typeView: "Vista panoramica",
    nearTo: "Cercas de la playa",
    portraitImage: "https://picsum.photos/900/600?random=5",
    developmentGallery: [
      {
        label: "Fachada",
        url: "https://picsum.photos/900/600?random=22",
      },
      {
        label: "Alberca",
        url: "https://picsum.photos/900/600?random=23",
      },
      {
        label: "Acceso",
        url: "https://picsum.photos/900/600?random=24",
      },
      {
        label: "Área común",
        url: "https://picsum.photos/900/600?random=25",
      },
      {
        label: "Exterior",
        url: "https://picsum.photos/900/600?random=26",
      },
    ],
  },
];

export type DevelopmentMockData = {
  id: string;
  status: string | number;
  developmentName: string;
  name: string;
  minPrice: number;
  maxPrice: number;
  rec: number;
  bath: number;
  parking: number;
  area: number;
  has: string[];
  amenities: string[];
  photos: object[];
  portraitImage: string;
  location: {
    lat: number;
    lng: number;
  };
  type: string;
  numDisponible: number;
  details: string[];
  renders: {
    name: string;
    render: string;
  }[];
  description: string;
  nearTo: string;
  developmentId: string;
  developmentData: DevelopmentMock;
};

export const DevelopmentMockData: DevelopmentMockData[] = [
  createDevelopmentModel(
    DevelopmentMocks[0],
    "ADHO-A",
    "Modelo Azalea",
    2850000,
    3120000,
    2,
    2,
    1,
    82,
    11,
  ),
  createDevelopmentModel(
    DevelopmentMocks[0],
    "ADHO-B",
    "Modelo Bugambilia",
    3380000,
    3690000,
    3,
    2.5,
    2,
    108,
    14,
  ),
  createDevelopmentModel(
    DevelopmentMocks[0],
    "ADHO-C",
    "Modelo Ceiba",
    4100000,
    4520000,
    3,
    3,
    2,
    136,
    17,
  ),

  createDevelopmentModel(
    DevelopmentMocks[1],
    "VBC-A",
    "Modelo Arena",
    3950000,
    4280000,
    1,
    1,
    1,
    64,
    21,
  ),
  createDevelopmentModel(
    DevelopmentMocks[1],
    "VBC-B",
    "Modelo Coral",
    5150000,
    5680000,
    2,
    2,
    1,
    91,
    24,
  ),
  createDevelopmentModel(
    DevelopmentMocks[1],
    "VBC-C",
    "Modelo Perla",
    6750000,
    7490000,
    3,
    3,
    2,
    132,
    27,
  ),

  createDevelopmentModel(
    DevelopmentMocks[2],
    "MDP-A",
    "Modelo Brisa",
    4200000,
    4650000,
    2,
    2,
    1,
    86,
    31,
  ),
  createDevelopmentModel(
    DevelopmentMocks[2],
    "MDP-B",
    "Modelo Marea",
    5520000,
    6100000,
    2,
    2.5,
    1,
    112,
    34,
  ),
  createDevelopmentModel(
    DevelopmentMocks[2],
    "MDP-C",
    "Modelo Horizonte",
    7180000,
    7950000,
    3,
    3,
    2,
    148,
    37,
  ),

  createDevelopmentModel(
    DevelopmentMocks[3],
    "AVI-A",
    "Modelo Esencia",
    2450000,
    2720000,
    2,
    2,
    1,
    78,
    41,
  ),
  createDevelopmentModel(
    DevelopmentMocks[3],
    "AVI-B",
    "Modelo Plenitud",
    3150000,
    3480000,
    3,
    2.5,
    2,
    104,
    44,
  ),
  createDevelopmentModel(
    DevelopmentMocks[3],
    "AVI-C",
    "Modelo Armonia",
    3890000,
    4290000,
    3,
    3,
    2,
    129,
    47,
  ),

  createDevelopmentModel(
    DevelopmentMocks[4],
    "ALNA-A",
    "Modelo Lirio",
    2650000,
    2940000,
    2,
    2,
    1,
    80,
    51,
  ),
  createDevelopmentModel(
    DevelopmentMocks[4],
    "ALNA-B",
    "Modelo Magnolia",
    3290000,
    3650000,
    3,
    2.5,
    2,
    106,
    54,
  ),
  createDevelopmentModel(
    DevelopmentMocks[4],
    "ALNA-C",
    "Modelo Jacaranda",
    3980000,
    4450000,
    3,
    3,
    2,
    134,
    57,
  ),
];

function createDevelopmentModel(
  developmentData: DevelopmentMock,
  id: string,
  name: string,
  minPrice: number,
  maxPrice: number,
  rec: number,
  bath: number,
  parking: number,
  area: number,
  imageSeed: number,
): DevelopmentMockData {
  return {
    id,
    status: 1,
    developmentName: developmentData.name,
    name,
    minPrice,
    maxPrice,
    rec,
    bath,
    parking,
    area,
    has: ["Cocina equipada", "Sala-comedor", "Terraza", "Area de lavado"],
    amenities: ["Alberca", "Areas verdes", "Seguridad 24/7", "Pet friendly"],
    photos: [
      {
        label: "Fachada",
        url: `https://picsum.photos/900/600?random=${imageSeed}`,
      },
      {
        label: "Sala-comedor",
        url: `https://picsum.photos/900/600?random=${imageSeed + 1}`,
      },
      {
        label: "Cocina",
        url: `https://picsum.photos/900/600?random=${imageSeed + 2}`,
      },
      {
        label: "Recamara principal",
        url: `https://picsum.photos/900/600?random=${imageSeed + 3}`,
      }
    ],
    portraitImage: `https://source.unsplash.com/featured/?architecture&sig=${imageSeed + 7}`,
    location: getDevelopmentLocation(developmentData.id),
    type: rec === 1 ? " Casa" : "Departamento",
    numDisponible: Math.max(2, 8 - rec),
    details: getModelDetails(rec),
    renders: [
      {
        name: "Planta baja",
        render: `https://picsum.photos/900/600?random=${imageSeed + 4}`,
      },
      {
        name: rec > 1 ? "Planta alta" : "Primer piso",
        render: `https://picsum.photos/900/600?random=${imageSeed + 5}`,
      },
      ...(rec >= 3
        ? [{
            name: "Segundo piso",
            render: `https://picsum.photos/900/600?random=${imageSeed + 6}`,
          }]
        : []),
    ],
    description: `${name} es un modelo de ${area} m2 dentro de ${developmentData.name}, con espacios funcionales, iluminacion natural y acabados contemporaneos.`,
    nearTo: developmentData.nearTo,
    developmentId: developmentData.id,
    developmentData,
  };
}

function getModelDetails(rec: number): string[] {
  return [
    ...(rec >= 3 ? ["Recamara en planta baja"] : []),
    "Persianas",
    "Patio privado",
    "Area de lavado",
    "Cocina integral",
    "Closets",
    "Preparacion para aire acondicionado",
  ];
}

function getDevelopmentLocation(developmentId: string): {
  lat: number;
  lng: number;
} {
  const locations: Record<string, { lat: number; lng: number }> = {
    ADHO: { lat: 20.7296, lng: -105.1605 },
    VBC: { lat: 20.7565, lng: -105.334 },
    MDP: { lat: 20.7543, lng: -105.3311 },
    AVI: { lat: 20.6534, lng: -105.2253 },
    ALNA: { lat: 20.7307, lng: -105.2824 },
  };

  return locations[developmentId];
}
