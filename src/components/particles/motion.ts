import { keyframes } from '@emotion/react'

export const fall = keyframes`
  0%   { transform: translate3d(0, -14vh, 0); opacity: 0; }
  7%   { opacity: var(--alpha); }
  88%  { opacity: var(--alpha); }
  100% { transform: translate3d(var(--drift), 112vh, 0); opacity: 0; }
`

export const rise = keyframes`
  0%   { transform: translate3d(0, 0, 0) scale(0.7); opacity: 0; }
  8%   { opacity: var(--alpha); transform: translate3d(0, -8vh, 0) scale(1); }
  90%  { opacity: var(--alpha); }
  100% { transform: translate3d(var(--drift), -118vh, 0) scale(1); opacity: 0; }
`

export const riseAndPop = keyframes`
  0%   { transform: translate3d(0, 0, 0) scale(0.6); opacity: 0; }
  8%   { opacity: var(--alpha); transform: translate3d(0, -8vh, 0) scale(1); }
  93%  { opacity: var(--alpha); transform: translate3d(calc(var(--drift) * 0.93), -104vh, 0) scale(1); }
  96%  { opacity: var(--alpha); transform: translate3d(calc(var(--drift) * 0.96), -107vh, 0) scale(1.35); }
  100% { opacity: 0; transform: translate3d(var(--drift), -108vh, 0) scale(1.7); }
`

export const sway = keyframes`
  from { transform: translate3d(calc(var(--sway) * -1), 0, 0); }
  to   { transform: translate3d(var(--sway), 0, 0); }
`

export const wobble = keyframes`
  0%   { transform: translate3d(calc(var(--sway) * -1), 0, 0) scale(1, 0.94); }
  50%  { transform: translate3d(var(--sway), 0, 0) scale(0.94, 1); }
  100% { transform: translate3d(calc(var(--sway) * -1), 0, 0) scale(1, 0.94); }
`

export const flutter = keyframes`
  0%   { transform: rotateZ(var(--tilt)) rotateX(0deg) rotateY(0deg); }
  25%  { transform: rotateZ(calc(var(--tilt) + 38deg)) rotateX(30deg) rotateY(24deg); }
  50%  { transform: rotateZ(calc(var(--tilt) + 12deg)) rotateX(56deg) rotateY(-8deg); }
  75%  { transform: rotateZ(calc(var(--tilt) - 28deg)) rotateX(26deg) rotateY(-32deg); }
  100% { transform: rotateZ(var(--tilt)) rotateX(0deg) rotateY(0deg); }
`

export const bob = keyframes`
  0%, 100% { transform: rotate(calc(var(--tilt) * -1)) scale(1); }
  50%      { transform: rotate(var(--tilt)) scale(1.06); }
`

export const gust = keyframes`
  0%, 52%, 100% { transform: translate3d(0, 0, 0); }
  62%           { transform: translate3d(calc(var(--gust) * 0.55), calc(var(--gust) * -0.04), 0); }
  72%           { transform: translate3d(var(--gust), calc(var(--gust) * -0.1), 0); }
  86%           { transform: translate3d(calc(var(--gust) * 0.35), 0, 0); }
`

export const twinkle = keyframes`
  0%, 100% { opacity: calc(var(--alpha) * 0.2); transform: scale(0.5) rotate(0deg); }
  50%      { opacity: var(--alpha); transform: scale(1) rotate(45deg); }
`

export const hover = keyframes`
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(var(--sway), -22px, 0); }
`

export const shootingStar = keyframes`
  0%, 86% { opacity: 0; transform: translate3d(0, 0, 0) rotate(18deg); }
  88%     { opacity: 1; }
  100%    { opacity: 0; transform: translate3d(75vw, 26vh, 0) rotate(18deg); }
`

export const wander = keyframes`
  0%   { transform: translate3d(0, 0, 0); }
  25%  { transform: translate3d(var(--sway), -28px, 0); }
  50%  { transform: translate3d(calc(var(--sway) * 0.4), -52px, 0); }
  75%  { transform: translate3d(calc(var(--sway) * -0.6), -20px, 0); }
  100% { transform: translate3d(0, 0, 0); }
`

export const glow = keyframes`
  0%, 100% { opacity: 0.12; transform: scale(0.7); }
  45%, 60% { opacity: var(--alpha); transform: scale(1); }
`
