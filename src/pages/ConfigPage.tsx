import { useState } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'
import {
  Box, Stack, Typography, Tabs, Tab, Card, CardContent, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, CircularProgress, IconButton, Tooltip,
} from '@mui/material'
import { keyframes } from '@emotion/react'
import { useRaritiesQuery, useTypesQuery, useUpdateRarityMutation, useUpdateTypeMutation } from '../hooks/useNotes'
import { useUser } from '../context/UserContext'
import type { RarityConfig, NoteTypeConfig } from '../types/note'

const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`

function ColorRow({ label, field, value, onChange }: { label: string; field: string; value: string; onChange: (f: string, v: string) => void }) {
  const isGradient = value.startsWith('linear') || value.startsWith('radial')
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Typography sx={{ fontSize: '0.8rem', color: '#475569', width: 120, flexShrink: 0 }}>{label}</Typography>
      {!isGradient && (
        <Box sx={{ position: 'relative', width: 32, height: 32, borderRadius: 1.5, overflow: 'hidden', border: '1.5px solid rgba(0,0,0,0.1)', flexShrink: 0 }}>
          <input
            type="color" value={value}
            onChange={(e) => onChange(field, e.target.value)}
            style={{ position: 'absolute', inset: 0, width: '200%', height: '200%', border: 'none', cursor: 'pointer', padding: 0, margin: '-25%' }}
          />
        </Box>
      )}
      <TextField
        value={value} onChange={(e) => onChange(field, e.target.value)}
        size="small" fullWidth
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.78rem' }, '& input': { py: 0.7 } }}
      />
    </Stack>
  )
}

function RarityEditor({ rarity, onClose }: { rarity: RarityConfig; onClose: () => void }) {
  const [form, setForm] = useState({ ...rarity })
  const { mutate, isPending } = useUpdateRarityMutation()

  const set = (field: string, value: string | number) => setForm((f) => ({ ...f, [field]: value }))

  const save = () => {
    const { id, createdAt, updatedAt, ...data } = form
    mutate({ id, data }, { onSuccess: onClose })
  }

  return (
    <>
      <DialogTitle sx={{ fontFamily: '"Playfair Display",serif', pb: 1 }}>
        Editar {form.emoji} {form.label}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack direction="row" spacing={1.5}>
            <TextField label="Label" value={form.label} onChange={(e) => set('label', e.target.value)} size="small" sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField label="Emoji" value={form.emoji} onChange={(e) => set('emoji', e.target.value)} size="small" sx={{ width: 80, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField label="Odds %" type="number" value={form.odds} onChange={(e) => set('odds', Number(e.target.value))} size="small" sx={{ width: 90, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Stack>
          <ColorRow label="Fundo do card" field="cardBg" value={form.cardBg} onChange={set} />
          <ColorRow label="Cor do texto" field="textColor" value={form.textColor} onChange={set} />
          <ColorRow label="Cor da legenda" field="captionColor" value={form.captionColor} onChange={set} />
          <ColorRow label="Cor da borda" field="borderColor" value={form.borderColor} onChange={set} />
          <ColorRow label="Shadow" field="shadow" value={form.shadow} onChange={set} />
          <ColorRow label="Glow (vazio = sem)" field="glowColor" value={form.glowColor} onChange={set} />
          <ColorRow label="Fundo do chip" field="chipBg" value={form.chipBg} onChange={set} />
          <ColorRow label="Texto do chip" field="chipColor" value={form.chipColor} onChange={set} />
          <Box sx={{ p: 1.5, borderRadius: 2, background: form.cardBg, border: `1.5px solid ${form.borderColor}`, boxShadow: form.shadow }}>
            <Stack direction="row" alignItems="center" spacing={0.8}>
              <Chip label={`${form.emoji} ${form.label.toUpperCase()}`} size="small"
                sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, background: form.chipBg, color: form.chipColor, '& .MuiChip-label': { px: 0.9 } }} />
              <Typography sx={{ fontSize: '0.85rem', fontStyle: 'italic', color: form.textColor }}>Preview do card</Typography>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, textTransform: 'none' }}>Cancelar</Button>
        <Button onClick={save} variant="contained" disabled={isPending} sx={{ borderRadius: 2, textTransform: 'none', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)' }}>
          {isPending ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Salvar'}
        </Button>
      </DialogActions>
    </>
  )
}

function TypeEditor({ type, onClose }: { type: NoteTypeConfig; onClose: () => void }) {
  const [form, setForm] = useState({ ...type })
  const { mutate, isPending } = useUpdateTypeMutation()

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const save = () => {
    const { id, createdAt, updatedAt, ...data } = form
    mutate({ id, data }, { onSuccess: onClose })
  }

  return (
    <>
      <DialogTitle sx={{ fontFamily: '"Playfair Display",serif', pb: 1 }}>
        Editar {form.emoji} {form.label}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack direction="row" spacing={1.5}>
            <TextField label="Label" value={form.label} onChange={(e) => set('label', e.target.value)} size="small" sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField label="Emoji" value={form.emoji} onChange={(e) => set('emoji', e.target.value)} size="small" sx={{ width: 80, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Stack>
          <ColorRow label="Cor de destaque" field="accentColor" value={form.accentColor} onChange={set} />
          <ColorRow label="Fundo da tag" field="tagBg" value={form.tagBg} onChange={set} />
          <ColorRow label="Texto da tag" field="tagColor" value={form.tagColor} onChange={set} />
          <Box sx={{ display: 'inline-flex', px: 0.8, py: 0.3, borderRadius: 1, bgcolor: form.tagBg, gap: 0.3, alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.8rem' }}>{form.emoji}</Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: form.tagColor }}>{form.label}</Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, textTransform: 'none' }}>Cancelar</Button>
        <Button onClick={save} variant="contained" disabled={isPending} sx={{ borderRadius: 2, textTransform: 'none', background: 'linear-gradient(135deg,#e11d48,#fb7185)' }}>
          {isPending ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Salvar'}
        </Button>
      </DialogActions>
    </>
  )
}

export function ConfigPage() {
  const [tab, setTab] = useState(0)
  const [editingRarity, setEditingRarity] = useState<RarityConfig | null>(null)
  const [editingType, setEditingType] = useState<NoteTypeConfig | null>(null)
  const [copied, setCopied] = useState(false)
  const { data: rarities = [] } = useRaritiesQuery()
  const { data: types = [] } = useTypesQuery()
  const { user } = useUser()

  const handleCopyCode = () => {
    if (!user?.coupleCode) return
    navigator.clipboard.writeText(user.coupleCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', bgcolor: '#f8fafc' }}>
      <Box sx={{ flexShrink: 0, px: 2, pt: 2.5, pb: 1 }}>
        <Typography variant="h6" sx={{ fontFamily: '"Playfair Display",serif', color: '#1e3a5f', fontWeight: 700 }}>
          Configurações
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b' }}>Personalize raridades e tipos</Typography>

        {user?.coupleCode && (
          <Box sx={{ mt: 2, mb: 0.5, p: 2, borderRadius: 2.5, background: 'linear-gradient(135deg,rgba(29,78,216,0.06),rgba(190,24,93,0.06))', border: '1.5px solid rgba(29,78,216,0.15)' }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: 0.8, mb: 1 }}>
              CÓDIGO DE CONVITE
            </Typography>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.6rem', color: '#1e3a5f', letterSpacing: '0.18em' }}>
                {user.coupleCode}
              </Typography>
              <Tooltip title={copied ? 'Copiado!' : 'Copiar código'}>
                <IconButton onClick={handleCopyCode} size="small" sx={{ color: copied ? '#15803d' : '#1d4ed8' }}>
                  {copied ? <CheckIcon sx={{ fontSize: 20 }} /> : <ContentCopyIcon sx={{ fontSize: 20 }} />}
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', mt: 0.5, fontStyle: 'italic' }}>
              Compartilhe com quem você ama 💙
            </Typography>
          </Box>
        )}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 1, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }, '& .Mui-selected': { color: '#1d4ed8' }, '& .MuiTabs-indicator': { bgcolor: '#1d4ed8' } }}>
          <Tab label="Raridades" />
          <Tab label="Tipos" />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pb: 2 }}>
        {tab === 0 && (
          <Stack spacing={1.5} sx={{ animation: `${fadeIn} 0.3s ease` }}>
            {rarities.map((r) => (
              <Card key={r.id} onClick={() => setEditingRarity(r)} sx={{ cursor: 'pointer', background: r.cardBg, border: `1.5px solid ${r.borderColor}`, boxShadow: r.shadow, transition: 'transform 0.15s', '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ py: '12px !important' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip label={`${r.emoji} ${r.label.toUpperCase()}`} size="small"
                        sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, background: r.chipBg, color: r.chipColor, '& .MuiChip-label': { px: 0.9 } }} />
                    </Stack>
                    <Typography sx={{ fontSize: '0.78rem', color: r.captionColor, fontWeight: 600 }}>{r.odds}% chance</Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
        {tab === 1 && (
          <Stack spacing={1.5} sx={{ animation: `${fadeIn} 0.3s ease` }}>
            {types.map((t) => (
              <Card key={t.id} onClick={() => setEditingType(t)} sx={{ cursor: 'pointer', background: 'rgba(255,255,255,0.9)', border: `1.5px solid ${t.accentColor}22`, boxShadow: `0 2px 8px ${t.accentColor}18`, transition: 'transform 0.15s', '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ py: '12px !important' }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ px: 1, py: 0.4, borderRadius: 1.5, bgcolor: t.tagBg, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.85rem' }}>{t.emoji}</Typography>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: t.tagColor }}>{t.label}</Typography>
                    </Box>
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: t.accentColor }} />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      <Dialog open={!!editingRarity} onClose={() => setEditingRarity(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {editingRarity && <RarityEditor rarity={editingRarity} onClose={() => setEditingRarity(null)} />}
      </Dialog>

      <Dialog open={!!editingType} onClose={() => setEditingType(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {editingType && <TypeEditor type={editingType} onClose={() => setEditingType(null)} />}
      </Dialog>
    </Box>
  )
}
