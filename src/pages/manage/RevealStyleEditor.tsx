import { Box, Stack, Typography } from '@mui/material'
import { useMemo, useRef, useState } from 'react'
import { AdvancedOptions, Button, EmojiPickerInput, HintText, Input, OptionTile, SectionLabel } from '../../components/ui'
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

const grid = (columns: string | Record<string, string>) => ({ display: 'grid', gridTemplateColumns: columns, gap: 0.7 })

function Swatch({ fill }: { fill: string }) {
  return <Box sx={{ width: { xs: 22, sm: 26 }, height: { xs: 22, sm: 26 }, flexShrink: 0, borderRadius: '50%', background: fill, boxShadow: `0 0 0 2px ${colors.surface.base}, 0 2px 8px rgba(15,23,42,0.18)` }} />
}

function SwitchDot({ on }: { on: boolean }) {
  return (
    <Box sx={{
      width: 26, height: 15, borderRadius: 99, flexShrink: 0, position: 'relative', transition: 'background 0.15s',
      background: on ? colors.primary.text : colors.border.medium,
      '&::after': {
        content: '""', position: 'absolute', top: 2, left: on ? 13 : 2, width: 11, height: 11, borderRadius: '50%',
        background: colors.surface.paper, transition: 'left 0.15s',
      },
    }} />
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

  const colorOptions = [
    { id: 'rarity', title: 'Da raridade', label: 'Cor da raridade', fill: rarityColor(form, theme.accent) },
    { id: 'gold', title: 'Dourado', label: 'Dourado', fill: `radial-gradient(circle at 35% 30%, #fff7cc, ${GOLD} 55%, #d97706)` },
    { id: 'rainbow', title: 'Arco-íris', label: 'Arco-íris', fill: rainbowConic() },
  ]

  return (
    <>
      <AdvancedOptions label={customized ? '✨ Abertura personalizada' : '✨ Opções avançadas da abertura'} spacing={2}>
        <Typography variant="sm" sx={{ color: colors.text.muted, lineHeight: 1.5 }}>
          Por padrão a abertura é tranquilinha, sem efeito nenhum. Se quiser caprichar nesta raridade, é aqui que você solta a imaginação.
        </Typography>

        <Box>
          <SectionLabel hint="quanto a abertura capricha" sx={{ mb: 0.8 }}>Destaque</SectionLabel>
          <Box sx={grid('repeat(auto-fit, minmax(96px, 1fr))')}>
            {TIERS.map((tier) => (
              <OptionTile key={tier.id} active={resolved.tier === tier.id} onClick={() => chooseTier(tier.id)} label={`Destaque ${tier.label}`} icon={tier.icon} title={tier.label} hint={tier.hint} />
            ))}
          </Box>
        </Box>

        <Box>
          <SectionLabel hint="brilho, raios e faíscas" sx={{ mb: 0.8 }}>Cor da luz</SectionLabel>
          <Box sx={grid({ xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' })}>
            {colorOptions.map((option) => (
              <OptionTile key={option.id} active={colorChoice === option.id} onClick={() => chooseColor(option.id)} label={option.label} title={option.title} icon={<Swatch fill={option.fill} />} layout={{ xs: 'row', sm: 'stack' }} />
            ))}
            <OptionTile
              active={colorChoice === 'custom'}
              onClick={() => { chooseColor(customColor); colorInput.current?.click() }}
              label="Escolher cor"
              title="Escolher"
              layout={{ xs: 'row', sm: 'stack' }}
              icon={(
                <Box sx={{ position: 'relative', display: 'flex' }}>
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
          <SectionLabel hint="toque pra ligar ou desligar" sx={{ mb: 0.8 }}>Efeitos</SectionLabel>
          <Box sx={grid('repeat(auto-fill, minmax(190px, 1fr))')}>
            {FLAGS.map((flag) => {
              const on = resolved[flag.id]
              return (
                <OptionTile
                  key={flag.id}
                  active={on}
                  onClick={() => toggle(flag.id)}
                  label={`${flag.label}: ${on ? 'ligado' : 'desligado'}`}
                  layout="row"
                  icon={<Box component="span" sx={{ filter: on ? 'none' : 'grayscale(1)', opacity: on ? 1 : 0.55 }}>{flag.icon}</Box>}
                  title={flag.label}
                  hint={flag.hint}
                  trailing={<SwitchDot on={on} />}
                />
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
          <SectionLabel hint="chuva ou explosão do seu jeito" sx={{ mb: 0.8 }}>Depois de virar</SectionLabel>
          <Box sx={grid('repeat(3, minmax(0, 1fr))')}>
            {REVEAL_EFFECTS.map((definition) => (
              <OptionTile
                key={definition.kind}
                active={effect.kind === definition.kind}
                icon={definition.icon}
                title={definition.label}
                onClick={() => {
                  onField('revealEffect', definition.kind)
                  if (definition.usesMedia && !form.revealMedia) onField('revealMedia', definition.defaultMedia)
                }}
              />
            ))}
          </Box>
          <HintText sx={{ fontStyle: 'italic', mt: 0.8 }}>{selectedEffect.description}</HintText>
          {selectedEffect.usesMedia && (
            <Box sx={{ mt: 1, p: 1.2, borderRadius: radius.lg, border: `1px solid ${colors.border.subtle}` }}>
              <Box sx={{ ...grid('repeat(2, minmax(0, 1fr))'), mb: 1.2 }}>
                <OptionTile active={!mediaIsImage} title="😀 Emoji" label="Emoji" onClick={() => onField('revealMedia', selectedEffect.defaultMedia || '✨')} />
                <OptionTile active={mediaIsImage} title="🖼️ GIF ou imagem" label="GIF ou imagem" onClick={() => onField('revealMedia', '')} />
              </Box>
              {mediaIsImage ? (
                <ImagePicker value={form.revealMedia || null} onChange={(url) => onField('revealMedia', url ?? '')} mediaType="stickers" label="Figurinha do efeito" />
              ) : (
                <EmojiPickerInput label="Emoji do efeito" value={effect.media} onChange={(emoji) => onField('revealMedia', emoji)} />
              )}
              <HintText sx={{ mt: 1 }}>Figurinhas com fundo transparente ficam bem melhores — a busca já filtra por elas.</HintText>
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
          <HintText sx={{ textAlign: 'center' }}>Abre um pacotinho de verdade com um bilhete desta raridade. Nada é salvo.</HintText>
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
