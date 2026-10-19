# Settings module

Este módulo concentra preferencias globales del usuario. No debe contener reglas
de autenticación ni permisos de seguridad del backend.

## Estructura

- `SettingsProvider.tsx`: estado global, hidratación y selección del tema.
- `storage.ts`: persistencia local por `userId`.
- `capabilities.ts`: funciones visibles según renta, venta o ambas.
- `hooks.ts`: API pública para las pantallas.
- `screens/`: interfaz reutilizable de configuración.
- `components/`: componentes exclusivos del módulo.

Las rutas dentro de `app/` deben ser pequeñas y delegar su implementación:

```tsx
export { default } from '@/modules/settings/screens/AppSettingsScreen'
```

## Consumo

Para lógica de renta y venta:

```tsx
const { operationMode, capabilities } = useOperationMode()

return capabilities.canViewRentals ? <RentalSection /> : null
```

## Backend

Actualmente las preferencias se guardan localmente. Para sincronizarlas entre
dispositivos, `loadSettings` y `saveSettings` pueden conectarse a endpoints del
perfil y conservar `AsyncStorage` como caché.

Las capacidades de este módulo controlan la interfaz. Los permisos reales
siempre deben validarse también en el backend.
