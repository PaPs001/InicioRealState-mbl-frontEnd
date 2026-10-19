# Tipografía por plataforma

La fuente de tamaños está en `theme/typography.ts`. Los valores base corresponden a Android y web; iOS suma `IOS_FONT_SIZE_OFFSET` (inicialmente 2). Es una compensación de diseño que debe verificarse visualmente, no una conversión de unidades entre sistemas.

Para estilos nuevos, usa nombres compartidos:

```tsx
import { textSize, platformLineHeight } from '@/theme/typography'

const styles = StyleSheet.create({
  title: { fontSize: textSize.title, lineHeight: platformLineHeight(26) },
  subtitle: { fontSize: textSize.subtitle },
  body: { fontSize: textSize.body, lineHeight: platformLineHeight(20) },
})
```

| Nombre | Android / web | iOS |
| --- | ---: | ---: |
| title | 20 | 22 |
| subtitle | 16 | 18 |
| body | 14 | 16 |
| bodySmall | 13 | 15 |
| caption | 12 | 14 |

`fontScale` conserva tamaños especiales del diseño existente. La migración centraliza los valores sin redondearlos a otras medidas. Los exports anteriores de `theme/typography.ts` y `lib/theme.ts` conservan sus nombres y estilos por compatibilidad, pero toman sus tamaños de la misma escala. Para código nuevo se recomienda `textSize`, porque los nombres históricos de ambos temas no tienen el mismo significado.

Las alturas de línea numéricas explícitas pasan por `platformLineHeight` para acompañar el ajuste. No se desactiva el escalado de accesibilidad del sistema.

Antes de dar por calibrado el ajuste, comparar Android e iOS con la misma configuración de tamaño de texto, revisar campos, botones y navegación de altura fija, textos multilínea y escalado de accesibilidad. No se han validado visualmente estos cambios en dispositivos.
