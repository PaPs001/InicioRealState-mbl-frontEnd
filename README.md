# Inicio Real Estate - Mobile App

Aplicacion movil de React Native (Expo) para la plataforma de bienes raices.

## Requisitos

- Node.js 18+
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app en tu telefono (para desarrollo)

## Instalacion

```bash
cd mobile
npm install
```

## Desarrollo

```bash
# Iniciar servidor de desarrollo
npm start

# Para iOS
npm run ios

# Para Android
npm run android
```

## Estructura del Proyecto

```
mobile/
├── app/                    # Pantallas (Expo Router)
│   ├── (tabs)/            # Tabs principales
│   │   ├── index.tsx      # Pantalla de inicio
│   │   ├── catalog.tsx    # Catalogo de propiedades
│   │   ├── appointments.tsx # Citas
│   │   ├── favorites.tsx  # Favoritos
│   │   ├── profile.tsx    # Perfil
│   │   ├── leads.tsx      # Gestion de leads
│   │   ├── properties.tsx # Propiedades (asesor)
│   │   ├── registration.tsx # Registro venta/renta
│   │   ├── reviews.tsx    # Revision de registros
│   │   └── commissions.tsx # Comisiones
│   ├── property/
│   │   └── [id].tsx       # Detalle de propiedad
│   ├── login.tsx          # Pantalla de login
│   └── _layout.tsx        # Layout principal
├── contexts/
│   └── AuthContext.tsx    # Contexto de autenticacion
├── lib/
│   ├── types.ts           # Tipos TypeScript
│   ├── theme.ts           # Colores y estilos
│   └── mock-data.ts       # Datos de ejemplo
└── assets/                # Imagenes y recursos
```

## Roles de Usuario

La app soporta 5 tipos de usuarios:

1. **Inversionista**: Ve su portafolio y explora propiedades
2. **Buscando**: Explora catalogo y agenda visitas
3. **Inquilino**: Gestiona su contrato y pagos
4. **Asesor**: Gestiona leads, propiedades y registros
5. **Coordinador**: Revisa registros y gestiona comisiones

## Funcionalidades

### Clientes (Inversionista/Buscando/Inquilino)
- Dashboard con estadisticas
- Catalogo de propiedades con filtros
- Guardar favoritos
- Agendar citas de visita
- Ver detalles de propiedades
- Perfil con codigo de referido

### Asesores
- Dashboard con KPIs
- Gestion de leads
- Listado de propiedades
- Registro de ventas/rentas
- Seguimiento de comisiones

### Coordinadores
- Dashboard administrativo
- Gestion global de leads
- Revision de registros
- Aprobacion/rechazo
- Panel de comisiones

## Tecnologias

- React Native 0.73
- Expo SDK 50
- Expo Router 3
- TypeScript
- AsyncStorage
- Lucide Icons
