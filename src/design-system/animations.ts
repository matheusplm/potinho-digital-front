import { keyframes } from '@emotion/react'

export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`

export const fadeInHero = keyframes`
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
`

export const fadeInRight = keyframes`
  from { opacity: 0; transform: translateX(28px); }
  to   { opacity: 1; transform: translateX(0); }
`

export const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
`

export const overlayIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

export const cardIn = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`

export const slideR = keyframes`
  from { opacity: 0; transform: translateX(22px); }
  to   { opacity: 1; transform: translateX(0); }
`

export const slideL = keyframes`
  from { opacity: 0; transform: translateX(-22px); }
  to   { opacity: 1; transform: translateX(0); }
`

export const menuIn = keyframes`
  from { opacity: 0; transform: scale(0.94) translateY(-6px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
`

export const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`

export const hintWiggle = keyframes`
  0%   { transform: rotate(2deg) translateX(0px); }
  30%  { transform: rotate(-1deg) translateX(-20px); }
  55%  { transform: rotate(-3deg) translateX(-28px); }
  75%  { transform: rotate(-1deg) translateX(-14px); }
  100% { transform: rotate(2deg) translateX(0px); }
`

export const sway = keyframes`
  0%, 100% { transform: rotate(2deg) translateX(0px); }
  28%       { transform: rotate(-2deg) translateX(-9px); }
  72%       { transform: rotate(5deg) translateX(9px); }
`

export const shineSweep = keyframes`
  from { transform: translate3d(-130%,0,0) rotate(16deg); }
  to   { transform: translate3d(130%,0,0) rotate(16deg); }
`

export const packCtaFloat = keyframes`
  0%,100% { transform: translateY(0) scale(1); }
  50%     { transform: translateY(-4px) scale(1.055); }
`

export const heartPulseAura = keyframes`
  from { opacity: 0.42; transform: scale(0.88); }
  to   { opacity: 0; transform: scale(1.3); }
`

export const ghostPulse = keyframes`
  0%, 100% { transform: scale(1);   box-shadow: 0 0 0 0 rgba(0,0,0,0.12); }
  50%       { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(0,0,0,0); }
`

export const dropFade = keyframes`
  0%   { opacity: 0; transform: translateY(0);    }
  16%  { opacity: 1; transform: translateY(0);    }
  80%  { opacity: 0; transform: translateY(54vh); }
  100% { opacity: 0; transform: translateY(0);    }
`

export const heartBeat = keyframes`
  0%,100% { transform: scale(1);    }
  30%     { transform: scale(1.22); }
  60%     { transform: scale(0.94); }
`

export const chevronPulse = keyframes`
  0%,100% { opacity: 0.5; transform: translateY(0);   }
  50%     { opacity: 1;   transform: translateY(4px); }
`

export const floatHeart = (i: number) => keyframes`
  0%   { transform: translateY(0) rotate(${i % 2 === 0 ? -6 : 5}deg); opacity: 0; }
  10%  { opacity: ${0.06 + (i % 3) * 0.02}; }
  85%  { opacity: ${0.04 + (i % 3) * 0.01}; }
  100% { transform: translateY(-100vh) rotate(${i % 2 === 0 ? 10 : -8}deg); opacity: 0; }
`

export const floatParticle = (i: number) => keyframes`
  0%   { transform: translateY(0) rotate(${i % 2 === 0 ? -8 : 6}deg); opacity: 0; }
  12%  { opacity: ${0.42 + (i % 3) * 0.06}; }
  85%  { opacity: ${0.32 + (i % 3) * 0.05}; }
  100% { transform: translateY(-105vh) rotate(${i % 2 === 0 ? 12 : -10}deg); opacity: 0; }
`

export const floatHeartLanding = (i: number) => {
  const driftMid = i % 3 === 0 ? 16 : i % 3 === 1 ? -18 : 8
  const driftEnd = i % 2 === 0 ? -10 : 12
  const rotateMid = (i * 11) % 20 - 10
  const rotateStart = (i * 13 + 5) % 22 - 11
  const rotateEnd = (i * 7) % 18 - 9
  const opacityPeak = 0.14 + (i % 5) * 0.04
  const opacityLate = 0.06 + (i % 3) * 0.03
  return keyframes`
    0%   { transform: translateY(0) translateX(0) rotate(${rotateStart}deg) scale(0.82); opacity: 0; }
    14%  { opacity: ${opacityPeak}; }
    50%  { transform: translateY(-50vh) translateX(${driftMid}px) rotate(${rotateMid}deg) scale(1.12); }
    88%  { opacity: ${opacityLate}; }
    100% { transform: translateY(-115vh) translateX(${driftEnd}px) rotate(${rotateEnd}deg) scale(0.72); opacity: 0; }
  `
}
