import type * as ImagePicker from 'expo-image-picker'

const PDF_IMAGE_PHYSICAL_WIDTH_IN = 11.25
const PDF_IMAGE_PHYSICAL_HEIGHT_IN = 24.07
const LEGACY_IMAGE_ASPECT_RATIO = 1080 / 2300
const MIN_SCALED_IMAGE_HEIGHT = 1600

function parseExifNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  if (typeof value === 'string') {
    const fraction = value.match(/^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/)
    if (fraction) {
      const denominator = Number(fraction[2])
      return denominator > 0 ? Number(fraction[1]) / denominator : null
    }
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  }
  if (value && typeof value === 'object') {
    const rational = value as { numerator?: unknown; denominator?: unknown }
    const numerator = Number(rational.numerator)
    const denominator = Number(rational.denominator)
    if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator > 0) {
      return numerator / denominator
    }
  }
  return null
}

export function validateAgentPresentationImage(
  asset: ImagePicker.ImagePickerAsset,
): string | null {
  const xResolution = parseExifNumber(asset.exif?.XResolution ?? asset.exif?.xResolution)
  const yResolution = parseExifNumber(asset.exif?.YResolution ?? asset.exif?.yResolution)
  const resolutionUnit = Number(asset.exif?.ResolutionUnit ?? asset.exif?.resolutionUnit)
  const unitMultiplier = resolutionUnit === 3 ? 2.54 : 1
  const xDpi = xResolution ? xResolution * unitMultiplier : null
  const yDpi = yResolution ? yResolution * unitMultiplier : xDpi

  const isLegacySize = asset.width === 1080 && asset.height === 2300
  const aspectRatio = asset.width / asset.height
  const isScaledLegacySize = asset.height >= MIN_SCALED_IMAGE_HEIGHT
    && Math.abs(aspectRatio - LEGACY_IMAGE_ASPECT_RATIO) <= 0.002
  if (isLegacySize || isScaledLegacySize) return null

  if (asset.width === 3375 && asset.height === 7221 && !xDpi && !yDpi) return null

  if (xDpi && yDpi) {
    const widthInches = asset.width / xDpi
    const heightInches = asset.height / yDpi
    if (
      Math.abs(widthInches - PDF_IMAGE_PHYSICAL_WIDTH_IN) <= 0.02
      && Math.abs(heightInches - PDF_IMAGE_PHYSICAL_HEIGHT_IN) <= 0.02
    ) return null
  }

  const detectedDensity = xDpi && yDpi
    ? ` y ${Math.round(xDpi)} x ${Math.round(yDpi)} DPI`
    : ' y sin densidad utilizable'
  return `La imagen seleccionada mide ${asset.width} x ${asset.height} px${detectedDensity}. No se subió porque la foto para el PDF debe medir físicamente 11.25 x 24.07 pulgadas, ser legacy 1080 x 2300 px a 96 DPI, o medir 3375 x 7221 px si no incluye densidad.`
}
