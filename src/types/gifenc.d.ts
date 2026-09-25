declare module 'gifenc' {
  type PaletteColor = number[]
  type Palette = PaletteColor[]
  type ColorFormat = 'rgb565' | 'rgb444' | 'rgba4444'
  interface WriteFrameOptions {
    palette?: Palette
    delay?: number
    repeat?: number
    transparent?: boolean
    transparentIndex?: number
    dispose?: number
    colorDepth?: number
    first?: boolean
  }
  interface GIFEncoderInstance {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: WriteFrameOptions): void
    finish(): void
    bytes(): Uint8Array
    bytesView(): Uint8Array
  }
  export function GIFEncoder(): GIFEncoderInstance
  export function quantize(data: Uint8ClampedArray | Uint8Array, maxColors: number, options?: { format?: ColorFormat }): Palette
  export function applyPalette(data: Uint8ClampedArray | Uint8Array, palette: Palette, format?: ColorFormat): Uint8Array
}
