# Project Structure

Esta app ya puede crecer mejor sin rehacer toda la base si se sigue este criterio:

## Principios

- `app/`: solo rutas, pantallas y composición visual de Expo Router.
- `contexts/`: estado temporal o transversal. `AuthContext` puede seguir aquí mientras dure la etapa de pruebas.
- `lib/shared/`: utilidades base reutilizables entre features.
- `lib/auth/`: funciones relacionadas con sesión, login y registro.
- `lib/catalog/`: mapeo y consumo del catálogo.
- `lib/properties/`: creación, edición y lectura de propiedades del usuario.

## Estructura objetivo

```txt
app/
  (tabs)/
  components/
  property/
  *.tsx

contexts/
  AuthContext.tsx

lib/
  auth/
    register-user.ts
  catalog/
    catalog-api.ts
  properties/
    user-properties-api.ts
  shared/
    api-fetch.ts
  types.ts
  theme.ts
  mock-data.ts
```

## Regla práctica

Cuando agregues una nueva funcionalidad:

1. La pantalla vive en `app/`.
2. El request al backend vive en `lib/<feature>/`.
3. Los mapeos de payload/response viven junto al request.
4. Solo deja wrappers en rutas viejas mientras migras imports.

## Nota sobre AuthContext

No se dividió porque hoy se usa como soporte temporal para pruebas. Cuando el backend y el modelo final estén estables, entonces sí conviene reemplazarlo o simplificarlo.
