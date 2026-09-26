import { Box, Stack, Typography, type SxProps, type Theme } from '@mui/material'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { AdvancedOptions, Button, EmojiPickerInput, Input } from '../../components/ui'
import { ImagePicker } from '../../components/ImagePicker'
import { PackOpeningStage, type StagePack } from '../../components/pack-opening/PackOpeningStage'
import { GOLD, isHex, rainbowConic, rarityColor, resolveStyle, type StyleFlags, type Tier } from '../../components/pack-opening/tiers'
import { useBackground } from '../../context/BackgroundContext'
import { colors, radius } from '../../design-system'
import { REVEAL_EFFECTS, REVEAL_EFFECT_MAP, isImageMedia, normalizeRevealEffect } from '../../effects'
import { useCollectionPacksQuery, useCollectionTypesQuery } from '../../hooks/useNotes'
import type { CollectionDailyReward, RarityConfig, RarityRevealStyle } from '../../types/note'

type Flag = Exclude<keyof StyleFlags, 'caption'>

const TIERS: { id: Tier; icon: string; label: string; hint: string }[] = [
  { id: 'common', icon: '🤍', label: 'Tranquilo', hint: 'o padrão' },
  { id: 'rare', icon: '💫', label: 'Brilhante', hint: 'raios suaves' },
  { id: 'epic', icon: '🔮', label: 'Épico', hint: 'tremor e suspense' },
  { id: 'legendary', icon: '👑', label: 'Lendário', hint: 'o show inteiro' },
]

const FLAGS: { id: Flag; icon: string; label: string; hint: string }[] = [
  { id: 'rays', icon: '☀️', label: 'Raios de luz', hint: 'giram atrás do bilhete' },
  { id: 'shake', icon: '💥', label: 'Tela tremendo', hint: 'quando o pacote estoura' },
  { id: 'tremble', icon: '💓', label: 'Bilhete tremendo', hint: 'antes de virar' },
  { id: 'vibrate', icon: '📳', label: 'Vibrar o celular', hint: 'no estouro e ao virar' },
]

const activeTint = `color-mix(in srgb, ${colors.primary.text} 12%, transparent)`

function Heading({ title, hint }: { title: string; hint?: string }) {
  return (
    <Stack direction="row" alignItems="baseline" sx={{ mb: 0.8, flexWrap: 'wrap', columnGap: 1 }}>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.6, whiteSpace: 'nowrap' }}>
        {title}
      </Typography>
      {hint && <Typography sx={{ fontSize: '0.66rem', color: colors.text.muted }}>{hint}</Typography>}
    </Stack>
  )
}

function Tile({ active, onClick, label, children, sx }: { active: boolean; onClick: () => void; label: string; children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Box
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      sx={[{
        position: 'relative', p: 1, borderRadius: radius.lg, cursor: 'pointer', userSelect: 'none', outline: 'none',
        background: active ? activeTint : 'transparent',
        border: `1.5px solid ${active ? colors.primary.text : colors.border.subtle}`,
        transition: 'transform 0.15s ease, border-color 0.15s ease, background 0.15s ease',
        '&:hover': { transform: 'translateY(-1px)', borderColor: colors.primary.text },
        '&:focus-visible': { boxShadow: `0 0 0 3px ${activeTint}`, borderColor: colors.primary.text },
      }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Box>
  )
}

function Swatch({ fill }: { fill: string }) {
  return <Box sx={{ width: { xs: 22, sm: 26 }, height: { xs: 22, sm: 26 }, flexShrink: 0, borderRadius: '50%', background: fill, boxShadow: `0 0 0 2px ${colors.surface.base}, 0 2px 8px rgba(15,23,42,0.18)` }} />
}

function ColorOption({ active, onClick, label, text, swatch }: { active: boolean; onClick: () => void; label: string; text: string; swatch: ReactNode }) {
  return (
    <Tile
      active={active}
      onClick={onClick}
      label={label}
      sx={{
        display: 'flex', alignItems: 'center', flexDirection: { xs: 'row', sm: 'column' },
        justifyContent: { xs: 'flex-start', sm: 'center' }, gap: { xs: 0.8, sm: 0.6 }, px: { xs: 0.9, sm: 1 },
      }}
    >
      {swatch}
      <Typography sx={{
        minWidth: 0, fontSize: '0.68rem', fontWeight: 700, lineHeight: 1.2, overflowWrap: 'anywhere',
        textAlign: { xs: 'left', sm: 'center' }, color: active ? colors.primary.text : colors.text.secondary,
      }}>
        {text}
      </Typography>
    </Tile>
  )
}

export function RevealStyleEditor({ cid, form, rarities, onStyle, onField }: {
  cid: string
  form: RarityConfig
  rarities: RarityConfig[]
  onStyle: (style: RarityRevealStyle) => void
  onField: (field: 'revealEffect' | 'revealMedia', value: string) => void
}) {
  const { theme } = useBackground()
  const { data: packs = [] } = useCollectionPacksQuery(cid)
  const { data: types = [] } = useCollectionTypesQuery(cid)
  const [testing, setTesting] = useState(false)
  const colorInput = useRef<HTMLInputElement>(null)
  const style = form.revealStyle ?? {}
  const [customColor, setCustomColor] = useState(isHex(style.color) ? style.color : '#ec4899')
  const resolved = resolveStyle(form, theme.accent)
  const tierChoice = resolved.tier
  const colorChoice = style.color === 'gold' || style.color === 'rainbow' ? style.color : isHex(style.color) ? 'custom' : 'rarity'
  const effect = normalizeRevealEffect(form.revealEffect, form.revealMedia, form.revealEmoji, form.emoji)
  const selectedEffect = REVEAL_EFFECT_MAP[effect.kind]
  const mediaIsImage = isImageMedia(effect.media)

  const pack = packs.find((item) => item.status === 'active') ?? packs[0]
  const stagePack: StagePack = {
    name: pack?.name || 'Pacotinho de teste',
    emoji: pack?.emoji || '💌',
    gradient: pack?.gradient ?? '',
    accent: pack?.accent || theme.accent,
  }
  const sampleId = form.id || 'amostra_nova'
  const stageRarities = useMemo(() => [...rarities.filter((item) => item.id !== sampleId), { ...form, id: sampleId }], [rarities, form, sampleId])
  const sample = useMemo<CollectionDailyReward[]>(() => [{
    id: 'amostra', title: 'Exemplo de bilhete ✨', message: 'É assim que o leitor vai ver esta raridade saindo do pacotinho.',
    rarity: sampleId, typeId: types[0]?.id ?? '', isNew: true,
  }], [sampleId, types])

  const customized = effect.kind !== 'none' || resolved.tier !== 'common' || resolved.rays || resolved.shake || resolved.tremble
    || resolved.vibrate || !!resolved.caption || colorChoice !== 'rarity'

  const chooseTier = (tier: Tier) => onStyle({ tier, color: style.color })
  const chooseColor = (color: string) => onStyle({ ...style, color })
  const toggle = (flag: Flag) => onStyle({ ...style, [flag]: !resolved[flag] })
  const reset = () => {
    onStyle({})
    onField('revealEffect', 'none')
  }

  return (
    <>
      <AdvancedOptions label={customized ? '✨ Abertura personalizada' : '✨ Opções avançadas da abertura'} spacing={2}>
        <Typography sx={{ fontSize: '0.72rem', color: colors.text.muted, lineHeight: 1.5 }}>
          Por padrão a abertura é tranquilinha, sem efeito nenhum. Se quiser caprichar nesta raridade, é aqui que você solta a imaginação.
        </Typography>

        <Box>
          <Heading title="Destaque" hint="quanto a abertura capricha" />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: 0.7 }}>
            {TIERS.map((tier) => {
              const active = tierChoice === tier.id
              return (
                <Tile key={tier.id} active={active} onClick={() => chooseTier(tier.id)} label={`Destaque ${tier.label}`}>
                  <Typography sx={{ fontSize: '1.15rem', lineHeight: 1.1, textAlign: 'center' }}>{tier.icon}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, textAlign: 'center', mt: 0.3, color: active ? colors.primary.text : colors.text.primary }}>{tier.label}</Typography>
                  <Typography sx={{ fontSize: '0.6rem', textAlign: 'center', color: colors.text.muted, lineHeight: 1.2 }}>{tier.hint}</Typography>
                </Tile>
              )
            })}
          </Box>
        </Box>

        <Box>
          <Heading title="Cor da luz" hint="brilho, raios e faíscas" />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' }, gap: 0.7 }}>
            <ColorOption active={colorChoice === 'rarity'} onClick={() => chooseColor('rarity')} label="Cor da raridade" text="Da raridade" swatch={<Swatch fill={rarityColor(form, theme.accent)} />} />
            <ColorOption active={colorChoice === 'gold'} onClick={() => chooseColor('gold')} label="Dourado" text="Dourado" swatch={<Swatch fill={`radial-gradient(circle at 35% 30%, #fff7cc, ${GOLD} 55%, #d97706)`} />} />
            <ColorOption active={colorChoice === 'rainbow'} onClick={() => chooseColor('rainbow')} label="Arco-íris" text="Arco-íris" swatch={<Swatch fill={rainbowConic()} />} />
            <ColorOption
              active={colorChoice === 'custom'}
              onClick={() => { chooseColor(customColor); colorInput.current?.click() }}
              label="Escolher cor"
              text="Escolher"
              swatch={(
                <Box sx={{ position: 'relative', flexShrink: 0, display: 'flex' }}>
                  <Swatch fill={customColor} />
                  <input
                    ref={colorInput}
                    type="color"
                    value={customColor}
                    tabIndex={-1}
                    aria-hidden
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => { setCustomColor(e.target.value); chooseColor(e.target.value) }}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none', border: 0, padding: 0 }}
                  />
                </Box>
              )}
            />
          </Box>
        </Box>

        <Box>
          <Heading title="Efeitos" hint="toque pra ligar ou desligar" />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 0.7 }}>
            {FLAGS.map((flag) => {
              const on = resolved[flag.id]
              return (
                <Tile key={flag.id} active={on} onClick={() => toggle(flag.id)} label={`${flag.label}: ${on ? 'ligado' : 'desligado'}`}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography sx={{ fontSize: '1.1rem', lineHeight: 1, filter: on ? 'none' : 'grayscale(1)', opacity: on ? 1 : 0.55 }}>{flag.icon}</Typography>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: on ? colors.text.primary : colors.text.secondary, lineHeight: 1.2 }}>{flag.label}</Typography>
                      <Typography sx={{ fontSize: '0.6rem', color: colors.text.muted, lineHeight: 1.2 }}>{flag.hint}</Typography>
                    </Box>
                    <Box sx={{
                      width: 26, height: 15, borderRadius: 99, flexShrink: 0, position: 'relative', transition: 'background 0.15s',
                      background: on ? colors.primary.text : colors.border.medium,
                      '&::after': {
                        content: '""', position: 'absolute', top: 2, left: on ? 13 : 2, width: 11, height: 11, borderRadius: '50%',
                        background: colors.surface.paper, transition: 'left 0.15s',
                      },
                    }} />
                  </Stack>
                </Tile>
              )
            })}
          </Box>
        </Box>

        <Input
          label="Frase antes de virar"
          value={resolved.caption}
          onChange={(e) => onStyle({ ...style, caption: e.target.value })}
          placeholder="Ex.: Esse brilha diferente… ✨"
          helperText="Aparece embaixo do bilhete antes de virar. Vazio = sem frase."
          slotProps={{ htmlInput: { maxLength: 80 } }}
          sx={{ '& .MuiFormHelperText-root': { color: colors.text.muted, fontSize: '0.64rem', mx: 0.5 } }}
        />

        <Box>
          <Heading title="Depois de virar" hint="chuva ou explosão do seu jeito" />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.7 }}>
            {REVEAL_EFFECTS.map((definition) => {
              const active = effect.kind === definition.kind
              return (
                <Tile
                  key={definition.kind}
                  active={active}
                  label={definition.label}
                  onClick={() => {
                    onField('revealEffect', definition.kind)
                    if (definition.usesMedia && !form.revealMedia) onField('revealMedia', definition.defaultMedia)
                  }}
                >
                  <Typography sx={{ fontSize: '1.1rem', lineHeight: 1.15, textAlign: 'center' }}>{definition.icon}</Typography>
                  <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, textAlign: 'center', mt: 0.2, color: active ? colors.primary.text : colors.text.secondary }}>
                    {definition.label}
                  </Typography>
                </Tile>
              )
            })}
          </Box>
          <Typography sx={{ fontSize: '0.66rem', color: colors.text.muted, fontStyle: 'italic', mt: 0.8 }}>
            {selectedEffect.description}
          </Typography>
          {selectedEffect.usesMedia && (
            <Box sx={{ mt: 1, p: 1.2, borderRadius: radius.lg, border: `1px solid ${colors.border.subtle}` }}>
              <Stack direction="row" spacing={0.7} sx={{ mb: 1.2 }}>
                {(['emoji', 'image'] as const).map((option) => {
                  const active = option === 'image' ? mediaIsImage : !mediaIsImage
                  return (
                    <Box key={option} sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
                      <Tile
                        active={active}
                        label={option === 'emoji' ? 'Emoji' : 'GIF ou imagem'}
                        onClick={() => onField('revealMedia', option === 'emoji' ? (selectedEffect.defaultMedia || '✨') : '')}
                        sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, textAlign: 'center', color: active ? colors.primary.text : colors.text.secondary }}>
                          {option === 'emoji' ? '😀 Emoji' : '🖼️ GIF ou imagem'}
                        </Typography>
                      </Tile>
                    </Box>
                  )
                })}
              </Stack>
              {mediaIsImage ? (
                <ImagePicker value={form.revealMedia || null} onChange={(url) => onField('revealMedia', url ?? '')} mediaType="stickers" label="Figurinha do efeito" />
              ) : (
                <EmojiPickerInput label="Emoji do efeito" value={effect.media} onChange={(emoji) => onField('revealMedia', emoji)} />
              )}
              <Typography sx={{ fontSize: '0.62rem', color: colors.text.muted, mt: 1, lineHeight: 1.4 }}>
                Figurinhas com fundo transparente ficam bem melhores — a busca já filtra por elas.
              </Typography>
            </Box>
          )}
        </Box>

        <Box>
          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} sx={{ gap: 1 }}>
            {customized && (
              <Button variant="ghost" onClick={reset} sx={{ flex: { sm: 1 }, py: 1, lineHeight: 1.25 }}>
                ↺ Deixar tranquila
              </Button>
            )}
            <Button variant="primary" onClick={() => setTesting(true)} sx={{ flex: { sm: 1.4 }, py: 1, lineHeight: 1.25 }}>
              🎬 Testar abertura
            </Button>
          </Stack>
          <Typography sx={{ fontSize: '0.64rem', color: colors.text.muted, textAlign: 'center', mt: 0.7 }}>
            Abre um pacotinho de verdade com um bilhete desta raridade. Nada é salvo.
          </Typography>
        </Box>
      </AdvancedOptions>

      <PackOpeningStage
        open={testing}
        pack={stagePack}
        rewards={testing ? sample : null}
        rarities={stageRarities}
        types={types}
        onClose={() => setTesting(false)}
      />
    </>
  )
}
