import { keyframes } from '@emotion/react'

export const stageIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

export const pouchEnter = keyframes`
  0%   { opacity: 0; transform: translate3d(0, 38vh, 0) scale(0.55) rotate(-8deg); }
  60%  { opacity: 1; transform: translate3d(0, -14px, 0) scale(1.04) rotate(2deg); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
`

export const pouchFloat = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0); }
  50%      { transform: translate3d(0, -12px, 0); }
`

export const pouchShake = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
  20%      { transform: translate3d(-4px, 1px, 0) rotate(-1.6deg); }
  40%      { transform: translate3d(4px, -1px, 0) rotate(1.6deg); }
  60%      { transform: translate3d(-3px, 0, 0) rotate(-1deg); }
  80%      { transform: translate3d(3px, 0, 0) rotate(1deg); }
`

export const pouchExit = keyframes`
  0%   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  100% { opacity: 0; transform: translate3d(0, 34vh, 0) scale(0.7); }
`

export const stripFly = keyframes`
  0%   { transform: translate3d(0, -8px, 0) rotate(-7deg); opacity: 1; }
  100% { transform: translate3d(-46vw, -44vh, 0) rotate(-120deg); opacity: 0; }
`

export const foilSweep = keyframes`
  0%   { transform: translate3d(-120%, 0, 0) skewX(-18deg); }
  55%, 100% { transform: translate3d(220%, 0, 0) skewX(-18deg); }
`

export const hintSlide = keyframes`
  0%   { transform: translate3d(0, 0, 0); opacity: 0; }
  12%  { opacity: 1; }
  70%  { transform: translate3d(var(--track), 0, 0); opacity: 1; }
  85%, 100% { transform: translate3d(var(--track), 0, 0); opacity: 0; }
`

export const raysSpin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg) scale(var(--ray-scale)); }
  to   { transform: translate(-50%, -50%) rotate(360deg) scale(var(--ray-scale)); }
`

export const flash = keyframes`
  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
  25%  { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(2.6); }
`

export const spark = keyframes`
  0%   { opacity: 0; transform: translate3d(0, 0, 0) scale(0.4); }
  15%  { opacity: 1; }
  100% { opacity: 0; transform: translate3d(var(--dx), var(--dy), 0) scale(1); }
`

export const screenShake = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0); }
  15% { transform: translate3d(-9px, 4px, 0); }
  30% { transform: translate3d(8px, -5px, 0); }
  45% { transform: translate3d(-6px, 3px, 0); }
  60% { transform: translate3d(5px, -2px, 0); }
  80% { transform: translate3d(-2px, 1px, 0); }
`

export const cardRise = keyframes`
  0%   { opacity: 0; transform: translate3d(0, 30vh, 0) scale(0.45) rotate(-6deg); }
  65%  { opacity: 1; transform: translate3d(0, -12px, 0) scale(1.03) rotate(1deg); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
`

export const cardLeave = keyframes`
  0%   { opacity: 1; transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
  100% { opacity: 0; transform: translate3d(38vw, -30vh, 0) scale(0.35) rotate(14deg); }
`

export const tremble = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
  25%      { transform: translate3d(-1.5px, 0, 0) rotate(-0.6deg); }
  75%      { transform: translate3d(1.5px, 0, 0) rotate(0.6deg); }
`

export const edgeGlow = keyframes`
  0%, 100% { opacity: 0.55; }
  50%      { opacity: 1; }
`

export const badgePop = keyframes`
  0%   { opacity: 0; transform: scale(0.3) rotate(-18deg); }
  60%  { opacity: 1; transform: scale(1.2) rotate(6deg); }
  100% { opacity: 1; transform: scale(1) rotate(-4deg); }
`

export const ringBurst = keyframes`
  0%   { opacity: 0.9; transform: translate(-50%, -50%) scale(0.4); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.9); }
`

export const riseIn = keyframes`
  from { opacity: 0; transform: translate3d(0, 18px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
`

export const hueSpin = keyframes`
  from { filter: blur(var(--blur, 22px)) hue-rotate(0deg); }
  to   { filter: blur(var(--blur, 22px)) hue-rotate(360deg); }
`

export const haloPulse = keyframes`
  0%, 100% { opacity: var(--halo-min, 0.55); }
  50%      { opacity: var(--halo-max, 0.95); }
`
