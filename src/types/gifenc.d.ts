declare module 'gifenc' {
  interface GIFEncoderInstance {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: { palette?: Uint8Array; delay?: number; repeat?: number }): void
    finish(): void
    bytesView(): Uint8Array
  }
  export function GIFEncoder(): GIFEncoderInstance
  export function quantize(data: Uint8ClampedArray | Uint8Array, maxColors: number): Uint8Array
  export function applyPalette(data: Uint8ClampedArray | Uint8Array, palette: Uint8Array): Uint8Array
}
