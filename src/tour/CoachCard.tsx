import { Box, ButtonBase, Stack, Typography, type SxProps, type Theme } from '@mui/material'
import { forwardRef, useState, type ReactNode } from 'react'
import { mergeSx } from '../components/ui'
import { useBackground } from '../context/BackgroundContext'
import { colors, fadeIn, font, radius } from '../design-system'
import { withAlpha } from '../utils/colorUtils'
import { CHAPTERS, type TourStep } from './steps'

export type CoachMode = 'floating' | 'center' | 'inline'

interface CoachCardProps {
  step: TourStep
  mode: CoachMode
  title?: string
  body?: string
  primary?: { label: string; onClick: () => void }
  secondary?: { label: string; onClick: () => void }
  hint?: string
  onExit: () => void
  sx?: SxProps<Theme>
}

function CoachButton({ children, onClick, filled }: { children: ReactNode; onClick: () => void; filled: boolean }) {
  const { theme } = useBackground()
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        px: 1.8, py: 0.9, borderRadius: radius.full, fontFamily: font.sans, fontWeight: 800, fontSize: '0.82rem',
        color: filled ? theme.onAccent : colors.text.secondary,
        background: filled ? theme.accent : colors.fill.subtle,
        border: `1.5px solid ${filled ? theme.accent : colors.border.medium}`,
        boxShadow: filled ? `0 6px 18px ${withAlpha(theme.accent, 35)}` : 'none',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': { transform: 'translateY(-1px)' },
      }}
    >
      {children}
    </ButtonBase>
  )
}

function ChapterProgress({ chapter }: { chapter: number }) {
  const { theme } = useBackground()
  if (chapter < 0 || chapter >= CHAPTERS.length) return null
  return (
    <Stack spacing={0.7}>
      <Typography variant="label" sx={{ color: theme.accent }}>
        Passo {chapter + 1} de {CHAPTERS.length} · {CHAPTERS[chapter]}
      </Typography>
      <Stack direction="row" spacing={0.5}>
        {CHAPTERS.map((name, index) => (
          <Box key={name} sx={{
            flex: 1, height: 4, borderRadius: radius.full,
            background: index <= chapter ? theme.accent : colors.fill.medium,
            opacity: index < chapter ? 0.55 : 1,
          }} />
        ))}
      </Stack>
    </Stack>
  )
}

export const CoachCard = forwardRef<HTMLDivElement, CoachCardProps>(function CoachCard(
  { step, mode, title, body, primary, secondary, hint, onExit, sx },
  ref,
) {
  const { theme } = useBackground()
  const [confirmingExit, setConfirmingExit] = useState(false)
  const inline = mode === 'inline'

  return (
    <Box
      ref={ref}
      role={inline ? 'note' : 'dialog'}
      aria-live="polite"
      sx={mergeSx({
        p: inline ? 1.6 : 2.2,
        borderRadius: radius.xl,
        background: inline ? withAlpha(theme.accent, 8) : colors.surface.paper,
        border: `1.5px solid ${withAlpha(theme.accent, inline ? 30 : 40)}`,
        boxShadow: inline ? 'none' : `0 18px 50px rgba(0,0,0,${theme.isDark ? 0.5 : 0.22}), 0 0 0 1px ${withAlpha(theme.accent, 12)}`,
        backdropFilter: inline ? 'none' : 'blur(20px)',
        animation: `${fadeIn} 0.25s ease`,
      }, sx)}
    >
      <Stack spacing={1.3}>
        <ChapterProgress chapter={step.chapter} />
        {confirmingExit ? (
          <>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.05rem', color: colors.text.primary, lineHeight: 1.25 }}>
              Sair do tutorial?
            </Typography>
            <Typography variant="md" sx={{ color: colors.text.secondary, lineHeight: 1.55 }}>
              Tudo que você já criou fica salvo. Dá pra rever quando quiser em Ver tutorial, no menu.
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              <CoachButton filled={false} onClick={onExit}>Sair</CoachButton>
              <CoachButton filled onClick={() => setConfirmingExit(false)}>Continuar tutorial</CoachButton>
            </Stack>
          </>
        ) : (
          <>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: inline ? '1rem' : '1.12rem', color: colors.text.primary, lineHeight: 1.25 }}>
              {title ?? step.title}
            </Typography>
            <Typography variant="md" sx={{ color: colors.text.secondary, lineHeight: 1.55 }}>
              {body ?? step.body}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, pt: 0.3 }}>
              <Typography
                component="button"
                type="button"
                variant="sm"
                onClick={() => setConfirmingExit(true)}
                sx={{ border: 'none', background: 'none', p: 0, cursor: 'pointer', color: colors.text.muted, fontWeight: 700, fontFamily: 'inherit', '&:hover': { color: colors.text.secondary } }}
              >
                {step.id === 'welcome' ? 'Agora não' : 'Sair do tutorial'}
              </Typography>
              <Box sx={{ flex: 1 }} />
              {hint && !primary && (
                <Typography variant="sm" sx={{ fontWeight: 800, color: theme.accent }}>
                  {hint}
                </Typography>
              )}
              {secondary && <CoachButton filled={false} onClick={secondary.onClick}>{secondary.label}</CoachButton>}
              {primary && <CoachButton filled onClick={primary.onClick}>{primary.label}</CoachButton>}
            </Stack>
          </>
        )}
      </Stack>
    </Box>
  )
})
