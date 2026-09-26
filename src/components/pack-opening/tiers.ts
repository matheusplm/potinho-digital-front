import type { CollectionDailyReward, RarityConfig, RevealTier } from '../../types/note'

export type Tier = RevealTier

export const CARD_WIDTH = 'min(86vw, 360px, 34vh + 140px)'

export const GOLD = '#fbbf24'
export const RAINBOW = ['#ff6b6b', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#9775fa', '#f783ac']

const TIER_RANK: Record<Tier, number> = { common: 0, rare: 1, epic: 2, legendary: 3 }

export interface StyleFlags {
  rays: boolean
  shake: boolean
  tremble: boolean
  vibrate: boolean
  caption: string
}

export const TIER_DEFAULTS: Record<Tier, StyleFlags> = {
  common: { rays: false, shake: false, tremble: false, vibrate: false, caption: '' },
  rare: { rays: true, shake: false, tremble: false, vibrate: false, caption: '' },
  epic: { rays: true, shake: true, tremble: true, vibrate: true, caption: 'Hmm, esse parece especial 👀' },
  legendary: { rays: true, shake: true, tremble: true, vibrate: true, caption: 'Esse brilha diferente… ✨' },
}

export interface RevealStyle extends StyleFlags {
  tier: Tier
  color: string
  rainbow: boolean
}

export function withAlpha(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`
}

export function isHex(value: string | undefined): value is string {
  return !!value && /^#[0-9a-f]{6}$/i.test(value)
}

export function solidColor(value: string | undefined): string | null {
  const color = value?.trim()
  if (!color || color === 'transparent' || /gradient|var\(/i.test(color)) return null
  const hex = color.match(/^#([0-9a-f]{6})[0-9a-f]{2}$/i)
  if (hex) return `#${hex[1]}`
  const rgb = color.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i)
  if (rgb) return `rgb(${rgb[1]}, ${rgb[2]}, ${rgb[3]})`
  return color
}

export function tierOf(rarity: RarityConfig | undefined): Tier {
  return rarity?.revealStyle?.tier ?? 'common'
}

export function rarityColor(rarity: RarityConfig | undefined, fallback: string): string {
  return solidColor(rarity?.glowColor) ?? solidColor(rarity?.borderColor) ?? fallback
}

export function resolveStyle(rarity: RarityConfig | undefined, fallback: string): RevealStyle {
  const style = rarity?.revealStyle ?? {}
  const tier = tierOf(rarity)
  const defaults = TIER_DEFAULTS[tier]
  const rainbow = style.color === 'rainbow'
  const color = rainbow ? '#c084fc' : style.color === 'gold' ? GOLD : isHex(style.color) ? style.color : rarityColor(rarity, fallback)
  return {
    tier,
    color,
    rainbow,
    rays: style.rays ?? defaults.rays,
    shake: style.shake ?? defaults.shake,
    tremble: style.tremble ?? defaults.tremble,
    vibrate: style.vibrate ?? defaults.vibrate,
    caption: (style.caption ?? defaults.caption).trim(),
  }
}

export function paint(style: RevealStyle, index: number): string {
  return style.rainbow ? RAINBOW[index % RAINBOW.length] : style.color
}

export function rainbowConic(from = 0): string {
  return `conic-gradient(from ${from}deg, ${RAINBOW.join(', ')}, ${RAINBOW[0]})`
}

export function raysFill(style: RevealStyle, alpha: number): string {
  if (!style.rainbow) return `repeating-conic-gradient(from 0deg, ${withAlpha(style.color, alpha)} 0deg 7deg, transparent 7deg 22.5deg)`
  const stops = Array.from({ length: 16 }, (_, i) => {
    const start = i * 22.5
    return `${withAlpha(RAINBOW[i % RAINBOW.length], alpha + 10)} ${start}deg ${start + 7}deg, transparent ${start + 7}deg ${start + 22.5}deg`
  })
  return `conic-gradient(from 0deg, ${stops.join(', ')})`
}

export interface RevealItem {
  reward: CollectionDailyReward
  rarity: RarityConfig | undefined
  style: RevealStyle
}

export function revealOrder(rewards: CollectionDailyReward[], rarities: RarityConfig[], fallback: string): RevealItem[] {
  return rewards
    .map((reward) => {
      const rarity = rarities.find((item) => item.id === reward.rarity)
      return { reward, rarity, style: resolveStyle(rarity, fallback) }
    })
    .sort((a, b) => TIER_RANK[a.style.tier] - TIER_RANK[b.style.tier] || (b.rarity?.odds ?? 100) - (a.rarity?.odds ?? 100))
}

export function vibrationFor(tier: Tier): number | number[] {
  return tier === 'legendary' ? [30, 60, 90] : tier === 'epic' ? [25, 50] : 20
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    return
  }
}
