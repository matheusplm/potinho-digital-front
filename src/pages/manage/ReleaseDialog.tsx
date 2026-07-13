import { Box, Dialog, DialogActions, DialogContent, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Button, toast } from '../../components/ui'
import { NotifyComposer, ToggleRow, EMPTY_NOTIFY_DRAFT, notifyDraftToConfig } from '../../components/manage/NotifyComposer'
import type { NotifyDraft } from '../../components/manage/NotifyComposer'
import { useReleaseNotesMutation, useCollectionPacksQuery, useCollectionAccessQuery, useAddPackOpensMutation } from '../../hooks/useNotes'
import { useBackground } from '../../context/BackgroundContext'
import { colors, font, radius } from '../../design-system'
import type { NoteRecord, RarityConfig } from '../../types/note'

const CHIP_PREVIEW_LIMIT = 6

export function ReleaseDialog({ cid, notes, rarities, open, onClose }: {
  cid: string
  notes: NoteRecord[]
  rarities: RarityConfig[]
  open: boolean
  onClose: () => void
}) {
  const { theme } = useBackground()
  const releaseMutation = useReleaseNotesMutation(cid)
  const addPackOpensMutation = useAddPackOpensMutation(cid)
  const { data: packs = [] } = useCollectionPacksQuery(cid)
  const { data: accesses = [] } = useCollectionAccessQuery(cid)
  const [notify, setNotify] = useState<NotifyDraft>(EMPTY_NOTIFY_DRAFT)
  const [giveBonus, setGiveBonus] = useState(false)
  const [bonusPackId, setBonusPackId] = useState('')
  const [bonusOpens, setBonusOpens] = useState(1)
  const [bonusEmails, setBonusEmails] = useState<string[]>([])

  const bonusPacks = useMemo(
    () => packs.filter((pack) => pack.category !== 'daily' && pack.distribution !== 'all_with_access'),
    [packs],
  )

  useEffect(() => {
    if (!open) return
    setNotify(EMPTY_NOTIFY_DRAFT)
    setGiveBonus(false)
    setBonusOpens(1)
    setBonusEmails(accesses.map((a) => a.email))
  }, [open, accesses])

  useEffect(() => {
    if (giveBonus && !bonusPackId && bonusPacks.length) setBonusPackId(bonusPacks[0].id)
  }, [giveBonus, bonusPackId, bonusPacks])

  const count = notes.length
  const preview = notes.slice(0, CHIP_PREVIEW_LIMIT)
  const remaining = count - preview.length
  const bonusReady = giveBonus && !!bonusPackId && bonusEmails.length > 0

  function toggleBonusEmail(email: string) {
    setBonusEmails((current) => current.includes(email) ? current.filter((e) => e !== email) : [...current, email])
  }

  function handleRelease() {
    releaseMutation.mutate({ noteIds: notes.map((n) => n.id), notify: notifyDraftToConfig(notify) }, {
      onSuccess: async ({ notified }) => {
        let bonusOk = true
        if (bonusReady) {
          try {
            await Promise.all(bonusEmails.map((email) => addPackOpensMutation.mutateAsync({ email, packId: bonusPackId, opens: bonusOpens })))
          } catch {
            bonusOk = false
          }
        }
        const details = [
          notified ? 'Os leitores foram avisados.' : null,
          bonusReady ? (bonusOk ? 'Brinde enviado! 🎁' : 'O brinde falhou — tenta de novo em Acessos.') : null,
        ].filter(Boolean).join(' ')
        toast.success(`${count} bilhete${count === 1 ? '' : 's'} lançado${count === 1 ? '' : 's'}! 🚀`, details ? { description: details } : undefined)
        onClose()
      },
      onError: (e) => toast.error((e as Error).message || 'Erro ao lançar bilhetes.'),
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, overflow: 'hidden' } } }}>
      <Box sx={{ px: 3, pt: 2.6, pb: 2, background: `linear-gradient(135deg, ${theme.accent}1c, transparent 70%)` }}>
        <Stack direction="row" alignItems="center" spacing={1.4}>
          <Box sx={{
            width: 46, height: 46, borderRadius: radius.lg, flexShrink: 0, fontSize: '1.4rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${theme.accent}1e`, border: `1px solid ${theme.accent}38`,
          }}>
            🚀
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.15rem', color: colors.text.primary, lineHeight: 1.2 }}>
              Lançar {count} bilhete{count === 1 ? '' : 's'}
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: colors.text.secondary, mt: 0.2 }}>
              Eles entram no sorteio e aparecem pros leitores. 🔒 Sem volta depois.
            </Typography>
          </Box>
        </Stack>
      </Box>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2.2}>
          <Stack direction="row" spacing={0.6} sx={{ flexWrap: 'wrap', rowGap: 0.6 }}>
            {preview.map((note) => {
              const r = rarities.find((x) => x.id === note.rarity)
              return (
                <Box key={note.id} sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.5, maxWidth: 190,
                  px: 1.1, py: 0.45, borderRadius: radius.full,
                  background: colors.surface.overlay, border: `1px solid ${r?.borderColor ?? colors.border.subtle}`,
                }}>
                  <Typography sx={{ fontSize: '0.74rem', flexShrink: 0 }}>{r?.emoji ?? '💌'}</Typography>
                  <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {note.title}
                  </Typography>
                </Box>
              )
            })}
            {remaining > 0 && (
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', px: 1.1, py: 0.45, borderRadius: radius.full,
                background: `${theme.accent}14`, border: `1px solid ${theme.accent}30`,
              }}>
                <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: theme.accent }}>
                  +{remaining} bilhete{remaining === 1 ? '' : 's'}
                </Typography>
              </Box>
            )}
          </Stack>

          <Box sx={{ height: '1px', background: colors.border.subtle }} />

          <NotifyComposer
            value={notify}
            onChange={setNotify}
            toggleTitle="Avisar os leitores?"
            toggleSubtitle="anuncie a novidade com uma mensagem sua"
            messagePlaceholder="Chegaram bilhetes novos fresquinhos pra você... 💙"
          />

          <Box sx={{ height: '1px', background: colors.border.subtle }} />

          <Stack spacing={1.6}>
            <ToggleRow
              checked={giveBonus}
              onToggle={() => setGiveBonus((v) => !v)}
              title="🎁 Dar pacotinhos de brinde junto?"
              subtitle="concede aberturas extra de um pacote pra comemorar"
            />

            {giveBonus && (
              <Stack spacing={1.6} sx={{ pl: 0.3 }}>
                {bonusPacks.length === 0 ? (
                  <Typography sx={{ fontSize: '0.76rem', color: colors.text.muted }}>
                    Você ainda não tem pacotes elegíveis pra brinde (crie um em Pacotes).
                  </Typography>
                ) : (
                  <>
                    <Box>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.7 }}>
                        Qual pacote?
                      </Typography>
                      <Stack direction="row" spacing={0.7} sx={{ flexWrap: 'wrap', rowGap: 0.7 }}>
                        {bonusPacks.map((pack) => {
                          const active = bonusPackId === pack.id
                          return (
                            <Box key={pack.id} onClick={() => setBonusPackId(pack.id)} sx={{
                              px: 1.2, py: 0.6, borderRadius: radius.lg, cursor: 'pointer',
                              background: active ? `${colors.primary.main}14` : 'rgba(0,0,0,0.04)',
                              border: `1.5px solid ${active ? colors.primary.main : 'transparent'}`,
                              transition: 'all 0.14s',
                            }}>
                              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: active ? colors.primary.main : colors.text.secondary }}>
                                {pack.emoji} {pack.name}
                              </Typography>
                            </Box>
                          )
                        })}
                      </Stack>
                    </Box>

                    <TextField
                      label="Quantas aberturas"
                      type="number"
                      value={bonusOpens}
                      onChange={(e) => setBonusOpens(Math.max(1, Number(e.target.value)))}
                      inputProps={{ min: 1 }}
                      fullWidth
                      size="small"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.lg } }}
                    />

                    {accesses.length > 1 && (
                      <Box>
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.7 }}>
                          Para quem?
                        </Typography>
                        <Stack direction="row" spacing={0.7} sx={{ flexWrap: 'wrap', rowGap: 0.7 }}>
                          {accesses.map((access) => {
                            const active = bonusEmails.includes(access.email)
                            return (
                              <Box key={access.email} onClick={() => toggleBonusEmail(access.email)} sx={{
                                px: 1.2, py: 0.6, borderRadius: radius.lg, cursor: 'pointer',
                                background: active ? `${colors.primary.main}14` : 'rgba(0,0,0,0.04)',
                                border: `1.5px solid ${active ? colors.primary.main : 'transparent'}`,
                                transition: 'all 0.14s',
                              }}>
                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: active ? colors.primary.main : colors.text.secondary }}>
                                  {access.email}
                                </Typography>
                              </Box>
                            )
                          })}
                        </Stack>
                      </Box>
                    )}
                  </>
                )}
              </Stack>
            )}
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Ainda não</Button>
        <Button
          variant="primary"
          loading={releaseMutation.isPending}
          disabled={giveBonus && bonusPacks.length > 0 && (!bonusPackId || bonusEmails.length === 0)}
          onClick={handleRelease}
          sx={{ flex: 1.4 }}
        >
          Lançar agora 🚀
        </Button>
      </DialogActions>
    </Dialog>
  )
}
