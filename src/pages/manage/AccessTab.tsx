import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ReplayIcon from '@mui/icons-material/Replay'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { Box, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Input, LoadingState, toast } from '../../components/ui'
import { useCollectionAccessQuery, useCollectionPacksQuery, useAddPackOpensMutation, useCollectionInvitesQuery, useSendInviteMutation, useCancelInviteMutation } from '../../hooks/useNotes'
import { colors, font, radius } from '../../design-system'
import { useBackground } from '../../context/BackgroundContext'
import { useUser } from '../../context/UserContext'
import type { CollectionInvite, CollectionPack } from '../../types/note'
import { actionButtonSx } from './shared'

interface AccessTabProps { cid: string }

const STATUS_LABEL: Record<CollectionInvite['status'], string> = {
  pending: 'Pendente',
  accepted: 'Aceito',
  rejected: 'Recusado',
  expired: 'Expirado',
}

const STATUS_COLOR: Record<CollectionInvite['status'], string> = {
  pending: '#d97706',
  accepted: '#16a34a',
  rejected: '#dc2626',
  expired: '#6b7280',
}

export function AccessTab({ cid }: AccessTabProps) {
  const { slug = '' } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { theme } = useBackground()
  const { user } = useUser()

  const { data: accesses = [], isLoading: accessLoading } = useCollectionAccessQuery(cid)
  const { data: invites = [], isLoading: invitesLoading } = useCollectionInvitesQuery(cid)
  const { data: packs = [] } = useCollectionPacksQuery(cid)
  const sendInviteMutation = useSendInviteMutation(cid)
  const cancelInviteMutation = useCancelInviteMutation(cid)
  const addPackOpensMutation = useAddPackOpensMutation(cid)

  const [emailInput, setEmailInput] = useState('')
  const [packOpensDialog, setPackOpensDialog] = useState<{ email: string; pack: CollectionPack; currentOpens: number | undefined } | null>(null)
  const [packOpensInput, setPackOpensInput] = useState(1)

  const accessBonusPacks = useMemo(
    () => packs.filter((pack) => pack.category !== 'daily' && pack.distribution !== 'all_with_access'),
    [packs],
  )

  function effectiveStatus(i: CollectionInvite): CollectionInvite['status'] {
    if (i.status === 'pending' && new Date(i.expiresAt) < new Date()) return 'expired'
    return i.status
  }

  const pendingInvites = useMemo(() => invites.filter((i) => effectiveStatus(i) === 'pending'), [invites])
  const rejectedInvites = useMemo(() => invites.filter((i) => { const s = effectiveStatus(i); return s === 'rejected' || s === 'expired' }), [invites])
  const acceptedInvites = useMemo(() => invites.filter((i) => effectiveStatus(i) === 'accepted'), [invites])

  async function handleInvite() {
    const email = emailInput.trim()
    if (!email) return
    if (user?.email && email.toLowerCase() === user.email.toLowerCase()) {
      toast.error('Você não pode se convidar para a sua própria coleção.')
      return
    }
    try {
      await sendInviteMutation.mutateAsync(email)
      setEmailInput('')
      toast.success(`Convite enviado para ${email}!`, { description: 'O leitor verá um link de confirmação no email.' })
    } catch (e) {
      toast.error((e as Error).message || 'Erro ao enviar convite.')
    }
  }

  async function handleResendInvite(email: string) {
    try {
      await sendInviteMutation.mutateAsync(email)
      toast.success('Convite reenviado!', { description: email })
    } catch (e) {
      toast.error((e as Error).message || 'Erro ao reenviar convite.')
    }
  }

  async function handleCancelInvite(email: string) {
    try {
      await cancelInviteMutation.mutateAsync(email)
      toast.success('Convite cancelado.')
    } catch (e) {
      toast.error((e as Error).message || 'Erro ao cancelar convite.')
    }
  }

  function openPackOpensDialog(email: string, pack: CollectionPack, currentOpens: number | undefined) {
    setPackOpensInput(1)
    setPackOpensDialog({ email, pack, currentOpens })
  }

  async function handleConfirmPackOpens() {
    if (!packOpensDialog) return
    const { email, pack } = packOpensDialog
    try {
      await addPackOpensMutation.mutateAsync({ email, packId: pack.id, opens: packOpensInput })
      toast.success('Brindes atualizados.')
      setPackOpensDialog(null)
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao atualizar brindes.')
    }
  }

  async function handleRemovePackAccess() {
    if (!packOpensDialog) return
    const { email, pack } = packOpensDialog
    try {
      await addPackOpensMutation.mutateAsync({ email, packId: pack.id, opens: 0 })
      toast.success('Acesso ao brinde removido.')
      setPackOpensDialog(null)
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao remover brinde.')
    }
  }

  const isLoading = accessLoading || invitesLoading

  return (
    <>
      <Stack spacing={2}>
        <Card sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.8, color: colors.text.muted, textTransform: 'uppercase' }}>
              Convidar por email
            </Typography>
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <Input type="email" placeholder="email@exemplo.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleInvite() } }}
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { fontSize: '0.84rem' }, '& input': { py: 0.75 } }} />
              <Button variant="primary" loading={sendInviteMutation.isPending} onClick={handleInvite} disabled={!emailInput.trim()} sx={{ py: 0.85, px: 1.5, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                <PersonAddIcon sx={{ fontSize: 16, mr: 0.4 }} /> Convidar
              </Button>
            </Stack>
          </Stack>
        </Card>

        {isLoading && <LoadingState compact label="Carregando acessos" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} />}

        {!isLoading && pendingInvites.length > 0 && (
          <Stack spacing={1}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.8, color: colors.text.muted, textTransform: 'uppercase', px: 0.5 }}>
              Convites pendentes
            </Typography>
            {pendingInvites.map((invite) => (
              <InviteRow
                key={invite.token}
                invite={invite}
                effectiveStatus={effectiveStatus(invite)}
                isMutating={sendInviteMutation.isPending || cancelInviteMutation.isPending}
                onResend={() => void handleResendInvite(invite.email)}
                onCancel={() => void handleCancelInvite(invite.email)}
              />
            ))}
          </Stack>
        )}

        {!isLoading && rejectedInvites.length > 0 && (
          <Stack spacing={1}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.8, color: colors.text.muted, textTransform: 'uppercase', px: 0.5 }}>
              Convites recusados / expirados
            </Typography>
            {rejectedInvites.map((invite) => (
              <InviteRow
                key={invite.token}
                invite={invite}
                effectiveStatus={effectiveStatus(invite)}
                isMutating={sendInviteMutation.isPending || cancelInviteMutation.isPending}
                onResend={() => void handleResendInvite(invite.email)}
                onCancel={() => void handleCancelInvite(invite.email)}
              />
            ))}
          </Stack>
        )}

        {!isLoading && acceptedInvites.length > 0 && (
          <Stack spacing={1}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.8, color: colors.text.muted, textTransform: 'uppercase', px: 0.5 }}>
              Convites aceitos
            </Typography>
            {acceptedInvites.map((invite) => (
              <InviteRow
                key={invite.token}
                invite={invite}
                effectiveStatus={effectiveStatus(invite)}
                isMutating={false}
                onResend={() => void handleResendInvite(invite.email)}
                onCancel={() => void handleCancelInvite(invite.email)}
                hideActions
              />
            ))}
          </Stack>
        )}

        {!isLoading && accesses.length === 0 && pendingInvites.length === 0 && rejectedInvites.length === 0 && acceptedInvites.length === 0 && (
          <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted, textAlign: 'center', py: 2 }}>
            Nenhum acesso ou convite ainda
          </Typography>
        )}

        {accesses.length > 0 && (
          <Stack spacing={1}>
            {!isLoading && (
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.8, color: colors.text.muted, textTransform: 'uppercase', px: 0.5 }}>
                Leitores com acesso
              </Typography>
            )}
            {accesses.map((a) => (
              <Card key={a.email} sx={{ p: 1.8 }}>
                <Stack spacing={1.4}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 36, height: 36, borderRadius: radius.md, background: `linear-gradient(135deg,${colors.primary.main},${colors.rose.main})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Typography sx={{ fontFamily: font.serif, fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                        {a.email[0].toUpperCase()}
                      </Typography>
                    </Box>
                    <Typography sx={{ flex: 1, fontSize: '0.84rem', color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.email}
                    </Typography>
                    <IconButton size="small" aria-label="ver coleção" onClick={() => navigate(`/colecoes/${slug}/gerenciar/leitores/${encodeURIComponent(a.email)}`)} sx={{ ...actionButtonSx('neutral'), flexShrink: 0 }}>
                      <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Stack>

                  {accessBonusPacks.length > 0 && (
                    <Stack spacing={0.8}>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.7, color: colors.text.muted, textTransform: 'uppercase' }}>
                        Brindes liberados
                      </Typography>
                      <Stack direction="row" spacing={0.7} sx={{ flexWrap: 'wrap', rowGap: 0.7 }}>
                        {accessBonusPacks.map((pack) => {
                          const opens = a.packOpens?.[pack.id]
                          const selected = opens !== undefined
                          const label = selected ? `${pack.emoji} ${pack.name} (${opens})` : `${pack.emoji} ${pack.name}`
                          return (
                            <Chip
                              key={pack.id}
                              label={label}
                              onClick={() => openPackOpensDialog(a.email, pack, opens)}
                              disabled={addPackOpensMutation.isPending}
                              sx={{
                                maxWidth: '100%', height: 28, borderRadius: radius.full, fontSize: '0.72rem', fontWeight: 800,
                                color: selected ? '#fff' : pack.accent,
                                background: selected ? pack.accent : `${pack.accent}12`,
                                border: `1px solid ${pack.accent}${selected ? '00' : '33'}`,
                                '& .MuiChip-label': { px: 1, overflow: 'hidden', textOverflow: 'ellipsis' },
                                '&:hover': { background: selected ? pack.accent : `${pack.accent}1f` },
                              }}
                            />
                          )
                        })}
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      <Dialog open={!!packOpensDialog} onClose={() => setPackOpensDialog(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)' } } }}>
        <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.text.primary, pb: 0.5 }}>
          {packOpensDialog ? `${packOpensDialog.pack.emoji} ${packOpensDialog.pack.name}` : ''}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={1.5}>
            {packOpensDialog?.currentOpens !== undefined && (
              <Typography sx={{ fontSize: '0.82rem', color: colors.text.secondary }}>
                Aberturas atuais: <strong>{packOpensDialog.currentOpens}</strong>
              </Typography>
            )}
            <TextField
              label="Quantas aberturas adicionar"
              type="number"
              value={packOpensInput}
              onChange={(e) => setPackOpensInput(Math.max(1, Number(e.target.value)))}
              inputProps={{ min: 1 }}
              fullWidth
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.lg } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: 'wrap' }}>
          {packOpensDialog?.currentOpens !== undefined && (
            <Button variant="ghost" loading={addPackOpensMutation.isPending} onClick={handleRemovePackAccess} sx={{ flex: '1 1 100%', color: 'error.main' }}>
              Remover brinde
            </Button>
          )}
          <Button variant="ghost" onClick={() => setPackOpensDialog(null)} sx={{ flex: 1 }}>Cancelar</Button>
          <Button variant="primary" loading={addPackOpensMutation.isPending} disabled={packOpensInput < 1 || addPackOpensMutation.isPending} onClick={handleConfirmPackOpens} sx={{ flex: 1 }}>
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

interface InviteRowProps {
  invite: CollectionInvite
  effectiveStatus: CollectionInvite['status']
  isMutating: boolean
  onResend: () => void
  onCancel: () => void
  hideActions?: boolean
}

function InviteRow({ invite, effectiveStatus: status, isMutating, onResend, onCancel, hideActions }: InviteRowProps) {
  const statusColor = STATUS_COLOR[status]
  const statusLabel = STATUS_LABEL[status]
  return (
    <Card sx={{ p: 1.8 }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box sx={{ width: 36, height: 36, borderRadius: radius.md, background: `${statusColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 700, color: statusColor, fontSize: '0.9rem' }}>
            {invite.email[0].toUpperCase()}
          </Typography>
        </Box>
        <Typography sx={{ flex: 1, fontSize: '0.84rem', color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {invite.email}
        </Typography>
        <Chip
          label={statusLabel}
          size="small"
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800, color: statusColor, background: `${statusColor}18`, borderRadius: radius.full, flexShrink: 0 }}
        />
        {!hideActions && (
          <>
            <Tooltip title="Reenviar convite" placement="top" arrow enterTouchDelay={0}>
              <span>
                <IconButton size="small" aria-label="reenviar convite" disabled={isMutating} onClick={onResend} sx={{ ...actionButtonSx('neutral'), flexShrink: 0 }}>
                  <ReplayIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Cancelar convite" placement="top" arrow enterTouchDelay={0}>
              <span>
                <IconButton size="small" aria-label="cancelar convite" disabled={isMutating} onClick={onCancel} sx={{ ...actionButtonSx('neutral'), flexShrink: 0 }}>
                  <CancelOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}
      </Stack>
    </Card>
  )
}
