# Estructura de Pantallas (Screens)

Este directorio contiene las pantallas organizadas por dominio para mejor escalabilidad.

## Dominios

### `/auth` - Autenticacion
- `login.tsx` - Pantalla de inicio de sesion
- `register.tsx` - Pantalla de registro
- `create-account.tsx` - Flujo de creacion de cuenta
- `logout-transition.tsx` - Transicion de cierre de sesion
- `register-transition.tsx` - Transicion post-registro

### `/properties` - Gestion de Propiedades
- `add-property.tsx` - Agregar nueva propiedad
- `my-properties.tsx` - Mis propiedades
- `property-detail.tsx` - Detalle de propiedad
- `list-property.tsx` - Listar propiedad
- `my-rental.tsx` - Mi renta actual

### `/catalog` - Catalogo
- `catalog.tsx` - Catalogo de propiedades
- `favorites.tsx` - Propiedades favoritas

### `/appointments` - Citas
- `appointments.tsx` - Gestion de citas

### `/messages` - Comunicacion
- `messages.tsx` - Mensajes
- `notifications.tsx` - Notificaciones

### `/earnings` - Finanzas
- `earnings.tsx` - Ganancias
- `campaigns.tsx` - Campanas

## Uso

```typescript
// Importar pantallas individuales
import { LoginScreen, RegisterScreen } from '@/app/screens/auth'
import { CatalogScreen, FavoritesScreen } from '@/app/screens/catalog'

// O importar todo
import * as Screens from '@/app/screens'
```

## Nota sobre Expo Router

Los archivos en la raiz de `/app` se mantienen para compatibilidad con las rutas existentes de Expo Router. 
Las pantallas en `/screens` son copias organizadas que pueden usarse para:
- Importar componentes en otras partes de la app
- Referencia de codigo organizado
- Migracion gradual

Para nuevas pantallas, crearlas primero en `/screens/{dominio}/` y luego crear el archivo de ruta en `/app/`.
