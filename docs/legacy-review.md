# Revisión de código legacy — 2026-11-04

Actualización 2026-11-06: se retiraron el hook anterior de propiedades y el servicio antiguo del catálogo. El estado actual y los candidatos cercanos están documentados en [la revisión de limpieza de propiedades](./property-cleanup-review.md). Este documento conserva los hallazgos de la revisión original.

Revisión estática del código TypeScript/TSX de la aplicación: 343 archivos fuente analizados, referencias de importación/exportación, rutas de Expo Router y consumidores de servicios. No incluye validación visual ni llamadas al backend. Los archivos de `app/` se consideran entradas de rutas aunque no tengan importaciones desde otros archivos.

Solo se modificó la limpieza autorizada de filtros en `usePropertiesScreen.ts`. Se conservaron el buscador, los precios mínimo/máximo y sus estados. Los demás hallazgos de este documento no se eliminaron.

## 1. Lógica anterior todavía activa: revisar primero

### Selector de propiedades al editar citas — corregido después de la revisión

- La edición usaba `useDashboardProperties()`, que construía sus opciones desde el catálogo compartido y no cargaba propiedades por su cuenta.
- Se migró `useAppointmentUpdateFlow` a `useAppointmentProperties()`, el mismo hook de creación, habilitado mientras el formulario está visible y filtrado por tipo de cita.
- El selector recorre las páginas del servicio y muestra los errores de carga. El formulario conserva el identificador y el texto de la propiedad asociada mientras llegan las opciones.
- `modules/users/main/hooks/userDashboardProperties.ts` se conservó; su retirada queda pendiente de una limpieza posterior.

### Dos implementaciones del mapa

- Actual: `modules/users/properties/components/propertiesMap/PropertiesMap.tsx`, integrado en `PropertiesListScreen` y alimentado con `controller.mapFilters`.
- Anterior: `modules/users/properties/screens/MapsPropertiesScreen.tsx`, todavía expuesto por `app/(users)/userAdviser/MapsProperties.tsx`.
- El anterior llama `useMapProperties()` sin filtros y resuelve la tarjeta con `findCatalogProperty()` desde el catálogo descargado. Con paginación puede no encontrar una propiedad que sí aparece como marcador.
- No se encontraron navegaciones explícitas a esa ruta por su nombre. Sigue siendo una ruta de Expo Router; no es un archivo muerto demostrado.

### Estado global con fuentes vacías

- `lib/services/user-properties.ts` tiene un `getUserProperties()` que siempre devuelve `[]`, distinto del endpoint real de propiedades.
- `lib/api/endpoints/activity.ts` devuelve `[]` para leads, citas y notificaciones.
- `contexts/auth/use-property-state.ts` y `contexts/auth/use-activity-state.ts` todavía consumen esos adaptadores y publican sus resultados en `AuthContext`.
- Son implementaciones provisionales activas. Hay que revisar sus consumidores y migrarlos antes de retirar los campos del contexto.

## 2. Archivos sin importadores encontrados

El análisis de dependencias no encontró consumidores estáticos de estos 15 archivos. Esto los hace candidatos de limpieza, no prueba que todo su contenido sea obsoleto. Los barrels y esqueletos se distinguen de componentes completos.

| Archivo | Observación |
| --- | --- |
| `components/animations/AnimatedLogo.tsx` | Componente sin consumidores encontrados. |
| `components/leads/LeadQuickActionsButton.tsx` | Componente sin consumidores encontrados. |
| `components/ui/PasswordTextInput.tsx` | Componente sin consumidores encontrados. |
| `components/userAdviser/AdviserBottomNav.tsx` | Implementación de navegación comentada. |
| `components/userCoordinator/CoordinatorBottomNav.styles.ts` | Archivo de estilos separado sin consumidores. |
| `contexts/auth/use-activity-domain.ts` | Wrapper del contexto sin consumidores encontrados. |
| `lib/hooks/index.ts` | Archivo vacío. |
| `lib/services/public-property-detail.ts` | Calendario, citas fijas de junio de 2024 y cálculos de ejemplo sin consumidores encontrados. |
| `modules/settings/hooks/index.ts` | Barrel sin consumidores; no implica que `useGoogleCalendarSettings` no se use directamente. |
| `modules/users/leads/components/card.tsx` | Componente sin consumidores encontrados. |
| `modules/users/navigation/adviserDashboardBottomNav.tsx` | Navegación alternativa con referencia a `PropertiesScreen.tsx`, pantalla que ya no existe. |
| `modules/users/properties/components/selectedProperties/CardInformation.tsx` | Componente que solo devuelve un `View` vacío. |
| `modules/users/properties/components/selectedProperties/NearPlaces.tsx` | Componente sin consumidores encontrados. |
| `modules/users/properties/index.ts` | Archivo vacío. |
| `modules/users/properties/screens/styles/propertiesListScreen.styles.tsx` | Estilos externos sin consumidores; la pantalla actual define estilos dentro de su propio archivo. |

## 3. Funciones antiguas dentro de archivos que sí se usan

- `lib/api/endpoints/catalog.ts:219`: `getCatalogPropertiesCoreAPI()` consulta `/users/properties/available`. Se reexporta en `lib/api/index.ts` y en el objeto `api.catalog`, pero no se encontraron llamadas desde las pantallas. Su helper `isAvailableProperty()` solo pertenece a ese recorrido.
- `modules/users/properties/services/properties.service.ts:28`: `getAvailableModuleProperties()` consulta el mismo endpoint y no tiene llamadas encontradas. El archivo sí contiene `getSelectedProperty()`, utilizado por `useSelectedProperty`; no debe eliminarse completo.
- `modules/users/properties/hooks/usePropertiesScreen.ts`: `canvasWidth`, `useWindowDimensions()` y el ancho calculado permanecen después de retirar el ancho explícito del header. `PropertyListHeader` todavía desestructura `canvasWidth` pero ya no lo aplica. El import de `getSelectedProperty` en ese hook tampoco tiene uso.

## 4. Prototipos y datos de demostración todavía accesibles

- `app/(users)/testing-selected-property.tsx` importa la pantalla de `modules/testingScreens/selectedPropertyScreen.tsx`.
- El dashboard en `modules/users/main/screens/advisor/index.tsx:126` incluye un acceso a esa ruta dentro del menú que muestra al pulsar el logo.
- La pantalla de pruebas usa `modules/users/properties/temporalMock.tsx`. No se debe borrar el mock sin quitar o aislar el acceso de prueba.
- Los desarrollos (`developmentMockData.tsx`, lista, detalle y modelos) todavía usan datos locales de demostración y tienen rutas activas. Son funcionalidades pendientes de conectar, no código muerto.

## 5. Restos comentados y compatibilidad

- `modules/users/main/hooks/userDashboardProperties.ts`: tipos y cálculos de oportunidades/comisiones comentados.
- `modules/users/main/components/Advisors/HeroCardsSection.tsx`: tarjeta de oportunidad y sus cálculos comentados.
- `app/_layout.tsx`: configuración de barra de navegación comentada y un efecto que calcula `tokenPreview` sin utilizarlo.
- `app/(auth)/(register)/regCoordinator` y `regCoordinator-new`: dos flujos conservados como rutas. La entrada de coordinador está comentada en `lib/services/register-entry.ts`. Antes de retirar alguno hay que confirmar cuál se conservará.
- `lib/types.ts`: wrapper marcado como deprecated que reexporta `lib/types/index.ts`. El alias `@/lib/types` todavía se utiliza ampliamente; eliminarlo requiere comprobar cómo resuelven ese alias TypeScript y Metro.
- `lib/theme.ts` y `theme/`: dos fuentes de tema con consumidores activos. No se recomienda borrar una de ellas sin migrar sus importaciones.
- Los imports de `expo-file-system/legacy` sí se utilizan para archivos, imágenes y PDF. El nombre `legacy` de la API no demuestra que sean código muerto del proyecto.

## Limpieza aplicada en esta revisión

En `usePropertiesScreen.ts` se retiraron:

- Comparaciones locales de recámaras, baños y estacionamientos condicionadas a modo mapa.
- Filtrado local por rangos de renta condicionado a modo mapa.
- Ordenamiento local por precio condicionado a modo mapa.
- Helper `isRentListing`, que solo servía a esas ramas.
- Dependencias que dejaron de intervenir en el cálculo de `filteredListings`.

El mapa real no consume `filteredListings`: obtiene sus datos desde `useMapProperties(mapFilters)`. El catálogo ya delega esos filtros y el orden al backend. Por eso esas ramas no tenían efecto visible en ninguno de los dos recorridos.

Validación: `tsc --noEmit` y `git diff --check` del archivo modificado, sin errores.
