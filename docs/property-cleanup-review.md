# Limpieza de propiedades y citas — 2026-11-06

Revisión estática de imports, reexportaciones, llamadas y rutas de Expo Router en el proyecto. Se usó la resolución de módulos de TypeScript para comprobar los consumidores y sus diagnósticos de símbolos locales sin uso. Las reexportaciones se distinguieron de las llamadas reales. No se hicieron peticiones al backend ni una validación visual en dispositivo.

## Limpieza aplicada

- Eliminado `modules/users/main/hooks/userDashboardProperties.ts` y su reexportación desde `hooks/index.ts`: no había consumidores del hook. Creación y edición de citas ya usan `useAppointmentProperties`.
- Eliminado `getCatalogPropertiesCoreAPI` de `lib/api/endpoints/catalog.ts` y su reexportación en `lib/api/index.ts`: no tenía llamadas, solo exportaciones y un ejemplo de documentación. El ejemplo ahora usa el servicio filtrado actual. Se conserva el resto del módulo de catálogo, que sí tiene consumidores.
- El helper `isAvailableProperty`, que buscaba «disponible», ya se había eliminado al separar listado y estado. Se confirmó su ausencia.
- La regla global que interpretaba `pending_sale` / `pending_rent` ya se había eliminado. Se confirmó su ausencia. `getAvailableProperties` se conserva porque sigue siendo usado y mantiene la exclusión por propietario.
- Durante la validación se encontró una declaración incompleta `const status =` en el mapeo. Se completó con `item.status` y se utiliza esa variable en el resultado, sin transformar el estado.

## Otros candidatos confirmados, conservados para revisión

Estos elementos no se eliminaron en esta limpieza adicional.

| Elemento | Evidencia y alcance de una posible limpieza |
| --- | --- |
| `getAvailableModuleProperties`, en `modules/users/properties/services/properties.service.ts` | Sin llamadas ni importadores del símbolo. Conserva otra implementación antigua de `/users/properties/available`. El archivo también contiene `getSelectedProperty` y su caché, que sí se utilizan; retirar solo la función y sus imports/constante exclusivos. |
| `getPropertyAgentName` y `getPropertyOwnerName`, en `lib/services/property-domain.ts` | Solo se encontraron sus declaraciones. Las demás funciones de ese archivo sí tienen consumidores. |
| `modules/users/properties/components/selectedProperties/CardInformation.tsx` | Sin imports ni reexportaciones. El componente únicamente devuelve un `View` vacío. |
| `modules/users/properties/components/selectedProperties/NearPlaces.tsx` | Sin imports ni reexportaciones. Sus estilos y tipos están contenidos en el mismo archivo. |
| `modules/users/properties/screens/styles/propertiesListScreen.styles.tsx` | Archivo de estilos sin importadores. La pantalla actual utiliza sus propios estilos. |
| `modules/users/properties/index.ts` | Archivo vacío, sin importadores. |
| `lib/services/public-property-detail.ts` | Sin importadores ni reexportaciones. Contiene calendario y horarios de ejemplo, citas de junio de 2024 y helpers de un detalle anterior. |

## Restos dentro de archivos utilizados

- `usePropertiesScreen.ts`: import de `getSelectedProperty` sin uso; el setter `setActivePropertyId` no se llama, por lo que ese estado permanece en `null`. Antes de retirar el campo, ajustar los fallbacks y el objeto devuelto que lo mencionan.
- `usePropertiesScreen.ts` y `PropertyListHeader.tsx`: `canvasWidth` se calcula con `useWindowDimensions`, pero su único consumidor lo desestructura sin usarlo. Se podría retirar esa cadena sin modificar estilos.
- `PropertySortModal.tsx`: variables de precio mínimo/máximo, sus setters, `listingFilter` y el import de `TextInput` no se leen en ese componente. Los filtros de precio sí siguen funcionando en el hook; este hallazgo no autoriza retirar su lógica compartida.
- `PropertyListCard.tsx`: imports sin uso de `StyleSheet` y varios iconos (`Bath`, `BedDouble`, `Car`, `ChevronDown`, `ChevronLeft`, `MapIcon`, `MapPin`, `Search`, `SlidersHorizontal`).
- `PropertiesMap.tsx`: el import de `Pressable` solo corresponde a JSX comentado. `MapsPropertiesScreen.tsx` conserva un import de `PropertyListHeader` cuyo uso también está comentado.
- `userDashboardCalendar.ts`: desestructura `updateAppointment` sin leerlo. La función del contexto sí se usa desde `useAppointmentUpdateFlow`; retirar únicamente esa desestructuración local.
- `modules/users/main/screens/advisor/index.tsx`: desestructura `profileImageUpload` sin usarlo y conserva un import de `icons` sin uso. `useDashboardProfile` sigue activo y llama otros hooks; no se debe eliminar el hook por este hallazgo.
- TypeScript también señala imports y variables locales sin uso en componentes y estilos cercanos de dashboard, citas y desarrollos. Son candidatos a una limpieza de símbolos locales, no evidencia de que esas pantallas completas estén sin uso.

## Código conservado con entradas activas

- El mapa anterior, `MapsPropertiesScreen.tsx`, sigue expuesto por `app/(users)/userAdviser/MapsProperties.tsx`. No se encontraron navegaciones explícitas a esa ruta, pero Expo Router la registra: no se considera código muerto solo por carecer de imports desde otras pantallas.
- La pantalla de pruebas de propiedades tiene ruta y un acceso desde el dashboard; su mock se mantiene.
- Las pantallas de desarrollos y sus datos de demostración tienen rutas/consumidores activos.
- Los servicios del catálogo filtrado, mapa, conteos y detalle tienen consumidores activos. También se conservan el estado y la caché del catálogo, la paginación y los selectores actuales de citas.

## Validación

- `tsc --noEmit`: correcto.
- `git diff --check`: correcto.
- Sin referencias de código al hook retirado, al servicio retirado ni a los estados inventados.
- Sin cambios de estilos, JSX de pantallas ni navegación en esta limpieza.

Los hallazgos de ausencia de consumidores corresponden al código presente en este repositorio. Las rutas de Expo Router se trataron como puntos de entrada aunque no tuvieran importadores.
