import { useId } from 'react'

const SMALL = 56

export function PotinhoMark({ size = 36 }: { size?: number }) {
  const id = `pm${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const simple = size < SMALL
  return (
    <svg width={size} height={size} viewBox={simple ? '96 16 380 452' : '50 10 430 460'} aria-hidden style={{ display: 'block', flexShrink: 0, overflow: 'visible' }}>
      {simple ? (
        <>
            <g transform="rotate(-5 256 300)">
              <g transform="translate(13 15)" fill="rgba(42,36,29,0.2)">
                <path d="M206 168 V210 C120 226 96 300 108 360 C118 420 180 452 256 452 C332 452 394 420 404 360 C416 300 392 226 306 210 V168 Z"/>
                <rect x="192" y="152" width="128" height="24" rx="8"/>
              </g>
              <g stroke="#2a241d" strokeWidth="13.5" strokeLinejoin="round" strokeLinecap="round">
                <g transform="rotate(11 268 130)">
                  <rect x="226" y="38" width="80" height="170" rx="5" fill="color-mix(in srgb, var(--pd-ink) 26%, #fffdf7)"/>
                </g>
                <g transform="rotate(-9 242 130)">
                  <path d="M196 26 H264 L290 52 V204 H196 Z" fill="#fffdf7"/>
                  <path d="M264 26 V52 H290" fill="color-mix(in srgb, var(--pd-ink) 26%, #fffdf7)" strokeWidth="9.450000000000001"/>
        
                  <g transform="translate(244 128)">
                    <circle r="26" fill="var(--pd-ink)" strokeWidth="12.15"/>
                    <path d="M0 9.5 C-1 8.4 -9.8 2.4 -9.8 -3.6 C-9.8 -7.4 -6.9 -10 -3.9 -10 C-2.2 -10 -0.7 -9.1 0 -7.8 C0.7 -9.1 2.2 -10 3.9 -10 C6.9 -10 9.8 -7.4 9.8 -3.6 C9.8 2.4 1 8.4 0 9.5 Z" fill="#fffdf7" stroke="none" transform="translate(0 1) scale(1.3)"/>
                  </g>
                </g>
              </g>
              <path d="M206 168 V210 C120 226 96 300 108 360 C118 420 180 452 256 452 C332 452 394 420 404 360 C416 300 392 226 306 210 V168 Z" fill="#fbf3df"/>
              <path d="M134 296 C126 338 134 382 160 410" fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="12" strokeLinecap="round"/>
              <path d="M206 168 V210 C120 226 96 300 108 360 C118 420 180 452 256 452 C332 452 394 420 404 360 C416 300 392 226 306 210 V168 Z" fill="none" stroke="#2a241d" strokeWidth="18.900000000000002" strokeLinejoin="round"/>
              <rect x="192" y="152" width="128" height="24" rx="8" fill="#cfa66f" stroke="#2a241d" strokeWidth="16.200000000000003" strokeLinejoin="round"/>
              <g transform="rotate(-4 256 350)" stroke="#2a241d" strokeLinejoin="round" strokeLinecap="round">
                <rect x="196" y="318" width="120" height="76" rx="6" fill="#fffdf7" strokeWidth="12.15"/>
                <rect x="226" y="304" width="60" height="22" fill="var(--pd-ink)" fillOpacity="0.5" stroke="none" transform="rotate(2 256 315)"/>
                <path d="M0 9.5 C-1 8.4 -9.8 2.4 -9.8 -3.6 C-9.8 -7.4 -6.9 -10 -3.9 -10 C-2.2 -10 -0.7 -9.1 0 -7.8 C0.7 -9.1 2.2 -10 3.9 -10 C6.9 -10 9.8 -7.4 9.8 -3.6 C9.8 2.4 1 8.4 0 9.5 Z" fill="var(--pd-ink)" strokeWidth="3.6" transform="translate(256 361) scale(2.1)"/>
              </g>
              <g transform="translate(386 96) rotate(26)" stroke="#2a241d" strokeLinejoin="round" strokeLinecap="round">
                <rect x="-54" y="-26" width="108" height="52" rx="14" fill="#cfa66f" strokeWidth="16.200000000000003"/>
                <path d="M-30 -10 V10 M-10 -12 V12 M10 -12 V12 M30 -10 V10" fill="none" strokeOpacity="0.35" strokeWidth="6"/>
              </g>
            </g>
        </>
      ) : (
        <>
            <g transform="rotate(-5 256 300)">
              <g transform="translate(13 15)" fill="rgba(42,36,29,0.2)">
                <path d="M206 168 V210 C120 226 96 300 108 360 C118 420 180 452 256 452 C332 452 394 420 404 360 C416 300 392 226 306 210 V168 Z"/>
                <rect x="192" y="152" width="128" height="24" rx="8"/>
              </g>
              <g stroke="#2a241d" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round">
                <g transform="rotate(11 268 130)">
                  <rect x="226" y="38" width="80" height="170" rx="5" fill="color-mix(in srgb, var(--pd-ink) 26%, #fffdf7)"/>
                </g>
                <g transform="rotate(-9 242 130)">
                  <path d="M196 26 H264 L290 52 V204 H196 Z" fill="#fffdf7"/>
                  <path d="M264 26 V52 H290" fill="color-mix(in srgb, var(--pd-ink) 26%, #fffdf7)" strokeWidth="7"/>
                  <path d="M212 62 H268 M212 84 H274" fill="none" strokeOpacity="0.42" strokeWidth="6"/>
                  <g transform="translate(244 128)">
                    <circle r="26" fill="var(--pd-ink)" strokeWidth="9"/>
                    <path d="M0 9.5 C-1 8.4 -9.8 2.4 -9.8 -3.6 C-9.8 -7.4 -6.9 -10 -3.9 -10 C-2.2 -10 -0.7 -9.1 0 -7.8 C0.7 -9.1 2.2 -10 3.9 -10 C6.9 -10 9.8 -7.4 9.8 -3.6 C9.8 2.4 1 8.4 0 9.5 Z" fill="#fffdf7" stroke="none" transform="translate(0 1) scale(1.3)"/>
                  </g>
                </g>
              </g>
              <path d="M206 168 V210 C120 226 96 300 108 360 C118 420 180 452 256 452 C332 452 394 420 404 360 C416 300 392 226 306 210 V168 Z" fill="#fbf3df"/>
              <g clipPath={`url(#${id})`} stroke="#2a241d" strokeWidth="8" strokeLinejoin="round">
                <g transform="rotate(-14 170 400)"><rect x="132" y="372" width="72" height="56" rx="4" fill="color-mix(in srgb, var(--pd-ink) 26%, #fffdf7)"/><path d="M132 392 H204" fill="none" strokeOpacity="0.35" strokeWidth="5"/></g>
                <g transform="rotate(12 340 404)"><rect x="304" y="378" width="72" height="56" rx="4" fill="#fffdf7"/><path d="M304 398 H376" fill="none" strokeOpacity="0.35" strokeWidth="5"/></g>
                <g transform="rotate(-4 256 424)"><rect x="216" y="400" width="80" height="58" rx="4" fill="color-mix(in srgb, var(--pd-ink) 26%, #fffdf7)"/><path d="M216 420 H296" fill="none" strokeOpacity="0.35" strokeWidth="5"/></g>
              </g>
              <clipPath id={id}><path d="M206 168 V210 C120 226 96 300 108 360 C118 420 180 452 256 452 C332 452 394 420 404 360 C416 300 392 226 306 210 V168 Z"/></clipPath>
              <path d="M134 296 C126 338 134 382 160 410" fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="12" strokeLinecap="round"/>
              <path d="M206 168 V210 C120 226 96 300 108 360 C118 420 180 452 256 452 C332 452 394 420 404 360 C416 300 392 226 306 210 V168 Z" fill="none" stroke="#2a241d" strokeWidth="14" strokeLinejoin="round"/>
              <rect x="192" y="152" width="128" height="24" rx="8" fill="#cfa66f" stroke="#2a241d" strokeWidth="12" strokeLinejoin="round"/>
              <g transform="rotate(-4 256 350)" stroke="#2a241d" strokeLinejoin="round" strokeLinecap="round">
                <rect x="196" y="318" width="120" height="76" rx="6" fill="#fffdf7" strokeWidth="9"/>
                <rect x="226" y="304" width="60" height="22" fill="var(--pd-ink)" fillOpacity="0.5" stroke="none" transform="rotate(2 256 315)"/>
                <path d="M0 9.5 C-1 8.4 -9.8 2.4 -9.8 -3.6 C-9.8 -7.4 -6.9 -10 -3.9 -10 C-2.2 -10 -0.7 -9.1 0 -7.8 C0.7 -9.1 2.2 -10 3.9 -10 C6.9 -10 9.8 -7.4 9.8 -3.6 C9.8 2.4 1 8.4 0 9.5 Z" fill="var(--pd-ink)" strokeWidth="3.6" transform="translate(256 361) scale(2.1)"/>
              </g>
              <g transform="translate(386 96) rotate(26)" stroke="#2a241d" strokeLinejoin="round" strokeLinecap="round">
                <rect x="-54" y="-26" width="108" height="52" rx="14" fill="#cfa66f" strokeWidth="12"/>
                <path d="M-30 -10 V10 M-10 -12 V12 M10 -12 V12 M30 -10 V10" fill="none" strokeOpacity="0.35" strokeWidth="6"/>
              </g>
              <g stroke="#2a241d" strokeWidth="9" strokeLinecap="round" fill="none">
                <path d="M440 160 L456 148"/><path d="M448 184 H468"/><path d="M432 134 L440 116"/>
              </g>
              <g stroke="var(--pd-ink)" strokeWidth="9" strokeLinecap="round" fill="none">
                <path d="M86 150 V178 M72 164 H100"/><path d="M118 98 V114 M110 106 H126"/>
              </g>
            </g>
        </>
      )}
    </svg>
  )
}
