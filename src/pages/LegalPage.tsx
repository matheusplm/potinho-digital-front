import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BrandMark, Copyright } from '../components/Brand'
import { useUser } from '../context/UserContext'
import { colors, font, gradients, radius } from '../design-system'

export type LegalDoc = 'termos' | 'privacidade'

interface Section {
  title: string
  body: ReactNode[]
}

const UPDATED_AT = '29 de setembro de 2026'
const CONTACT_EMAIL = 'matheusmty@gmail.com'
const CONTROLLER = 'Matheus Pereira Lopes de Morais'

const contact = (
  <>
    pelo <strong>Falar com o suporte</strong>, em Minha conta, ou pelo e-mail{' '}
    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
  </>
)

const TERMS: Section[] = [
  {
    title: 'O que é o Potinho',
    body: [
      'O Potinho Digital é um lugar pra escrever bilhetes e entregar pra quem você ama em pacotinhos surpresa, como um álbum de figurinhas feito de mensagens. Ao criar uma conta ou usar o site, você concorda com estes termos e com a nossa Política de Privacidade.',
    ],
  },
  {
    title: 'Sua conta',
    body: [
      'Use dados verdadeiros, guarde bem sua senha e não compartilhe o acesso. Cada conta é de uma pessoa. Se você tem menos de 18 anos, use o Potinho com o conhecimento de quem é responsável por você. O serviço não é feito para crianças com menos de 12 anos.',
      'Você pode sair quando quiser: em Minha conta, “Excluir minha conta” apaga tudo na hora.',
    ],
  },
  {
    title: 'O que você escreve é seu',
    body: [
      'Os bilhetes, textos e coleções continuam sendo seus. Você só nos dá a permissão necessária pra guardar esse conteúdo e mostrar para as pessoas que você convidou. A gente não vende, não publica e não usa o que você escreve pra anúncios.',
      'Você é responsável pelo que coloca aqui, inclusive por imagens que você adiciona por link. Elas continuam hospedadas no site de onde vieram.',
    ],
  },
  {
    title: 'O que não pode',
    body: [
      <Box component="ul" key="list" sx={{ m: 0, pl: 2.4 }}>
        <li>conteúdo ilegal, de ódio, assédio, ameaça ou que exponha alguém sem permissão;</li>
        <li>qualquer conteúdo sexual envolvendo menores de idade;</li>
        <li>usar convites ou notificações pra mandar spam ou incomodar quem não quer receber;</li>
        <li>copiar conteúdo protegido por direitos autorais sem autorização;</li>
        <li>tentar burlar a segurança, os limites de uso ou acessar dados de outras pessoas;</li>
        <li>usar robôs ou automações pra criar contas ou coletar dados.</li>
      </Box>,
      'Se algo assim acontecer, a gente pode remover o conteúdo e suspender ou encerrar a conta.',
    ],
  },
  {
    title: 'Convites e e-mails',
    body: [
      'Só convide quem você conhece e quer presentear. Pra proteger a caixa de entrada de todo mundo, existe um limite de convites e de e-mails que cada pessoa pode receber por dia.',
    ],
  },
  {
    title: 'Funcionamento e mudanças',
    body: [
      'O Potinho é gratuito e oferecido do jeito que está. A gente se esforça pra ele ficar sempre no ar e sem erros, mas não dá pra garantir isso 100% do tempo. Se um bilhete for muito importante pra você, guarde uma cópia também.',
      'Recursos podem mudar, surgir ou sair. Se um dia existirem recursos pagos, as condições vão aparecer antes de qualquer cobrança. Quando estes termos mudarem de um jeito importante, a gente avisa no site.',
    ],
  },
  {
    title: 'Lei e contato',
    body: [
      'Estes termos seguem as leis do Brasil, incluindo o Código de Defesa do Consumidor e a Lei Geral de Proteção de Dados (LGPD).',
      <>Dúvidas, sugestões ou problemas: fale com a gente {contact}.</>,
    ],
  },
]

const PRIVACY: Section[] = [
  {
    title: 'Quem cuida dos seus dados',
    body: [
      <>
        O Potinho Digital é mantido por <strong>{CONTROLLER}</strong>, que é o responsável (controlador) pelos seus dados e também quem atende pedidos
        sobre eles (encarregado). Você fala com ele {contact}.
      </>,
    ],
  },
  {
    title: 'O que a gente guarda',
    body: [
      <Box component="ul" key="list" sx={{ m: 0, pl: 2.4 }}>
        <li><strong>Conta:</strong> nome, e-mail, nome de usuário (se você escolher) e senha, guardada só como código embaralhado, que nem a gente consegue ler. Se entrar com o Google, recebemos seu nome e e-mail de lá.</li>
        <li><strong>O que você cria:</strong> coleções, bilhetes, pacotinhos, conquistas, links de imagens e os e-mails das pessoas que você convida.</li>
        <li><strong>Uso:</strong> bilhetes abertos, favoritos, conquistas, e a data do seu último login e acesso.</li>
        <li><strong>Notificações:</strong> se você ativar, o endereço técnico que o seu navegador gera pra receber avisos.</li>
        <li><strong>Suporte:</strong> o recado que você manda, a página onde estava e o tipo de aparelho e navegador.</li>
        <li><strong>Segurança:</strong> o endereço IP e o e-mail usados em tentativas de login, cadastro e recuperação de senha, só pra barrar abuso. Isso some sozinho em até 24 horas.</li>
      </Box>,
      'Não usamos cookies de rastreamento, não temos anúncios e não usamos ferramentas de análise de terceiros. O navegador guarda só o necessário pra você continuar logado e lembrar suas preferências, como o tema de fundo.',
    ],
  },
  {
    title: 'Pra que a gente usa',
    body: [
      'Pra fazer o Potinho funcionar: criar sua conta, guardar e entregar seus bilhetes, enviar convites e avisos que você pediu, responder o suporte e proteger o serviço contra abuso. É isso. Seus dados não são vendidos nem usados pra publicidade.',
      'A base legal é a execução do serviço que você pediu ao criar a conta, o legítimo interesse de manter o site seguro e, no caso das notificações, o seu consentimento, que você pode tirar quando quiser.',
    ],
  },
  {
    title: 'Com quem os dados passam',
    body: [
      'Só com serviços que fazem o Potinho funcionar, e só o necessário pra cada um:',
      <Box component="ul" key="list" sx={{ m: 0, pl: 2.4 }}>
        <li><strong>Amazon Web Services:</strong> servidores, banco de dados e envio de e-mails, na região de São Paulo.</li>
        <li><strong>Vercel:</strong> hospeda as páginas do site.</li>
        <li><strong>Cloudflare Turnstile:</strong> a verificação anti-robô do login e do cadastro.</li>
        <li><strong>Google:</strong> o login com Google, se você escolher, e as fontes do site.</li>
        <li><strong>Serviços de notificação do navegador</strong> (Google, Apple ou Mozilla), se você ativar os avisos.</li>
      </Box>,
      'Alguns desses serviços podem processar dados fora do Brasil, sempre com proteções adequadas. As imagens que você adiciona por link são carregadas direto do site onde estão hospedadas.',
    ],
  },
  {
    title: 'Por quanto tempo',
    body: [
      'Enquanto sua conta existir. Quando você exclui a conta, apagamos na hora sua conta, suas coleções (inclusive as da lixeira), seus bilhetes, seu progresso, seus convites e seus recados pro suporte.',
      'Sobram só registros técnicos que expiram sozinhos: o histórico de e-mails enviados (endereço, tipo e data) some em até 90 dias, e os registros de segurança, em até 24 horas. Recados de suporte de contas ativas ficam guardados por até 1 ano.',
    ],
  },
  {
    title: 'Seus direitos',
    body: [
      'Pela LGPD, você pode a qualquer momento:',
      <Box component="ul" key="list" sx={{ m: 0, pl: 2.4 }}>
        <li>confirmar se tratamos seus dados e ter acesso a eles;</li>
        <li>corrigir nome, usuário, e-mail e senha em Minha conta;</li>
        <li>excluir sua conta e seus dados em Minha conta, na hora;</li>
        <li>pedir uma cópia dos seus dados ou saber com quem eles foram compartilhados;</li>
        <li>desativar as notificações quando quiser.</li>
      </Box>,
      <>Pra qualquer pedido, fale {contact}. Se achar que algo não foi resolvido, você também pode procurar a Autoridade Nacional de Proteção de Dados (ANPD).</>,
    ],
  },
  {
    title: 'Segurança',
    body: [
      'Usamos conexão criptografada, senhas embaralhadas, limites contra tentativas repetidas e acesso restrito aos dados. Nenhum sistema é 100% à prova de falhas, mas se acontecer algum incidente que coloque você em risco, a gente avisa.',
    ],
  },
  {
    title: 'Mudanças nesta política',
    body: [
      'Se esta política mudar de um jeito importante, a gente avisa no site antes. A data da última atualização fica logo no topo.',
    ],
  },
]

const DOCS: Record<LegalDoc, { title: string; intro: string; sections: Section[] }> = {
  termos: {
    title: 'Termos de uso',
    intro: 'As regras do jogo, sem juridiquês desnecessário.',
    sections: TERMS,
  },
  privacidade: {
    title: 'Política de privacidade',
    intro: 'O que a gente guarda, por quê, e como você manda nos seus dados.',
    sections: PRIVACY,
  },
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUser()
  const { title, intro, sections } = DOCS[doc]
  const other: LegalDoc = doc === 'termos' ? 'privacidade' : 'termos'

  const goBack = () => {
    if (location.key !== 'default') navigate(-1)
    else navigate(user ? '/home' : '/')
  }

  return (
    <Box sx={{ height: '100dvh', overflowY: 'auto', overflowX: 'hidden', background: gradients.page }}>
      <Box component="main" sx={{ maxWidth: 720, mx: 'auto', px: 2, pt: { xs: 2, md: 4 }, pb: 6 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: { xs: 3, md: 4 }, gap: 1 }}>
          <Box
            component="button"
            type="button"
            onClick={goBack}
            sx={{
              all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 0.6,
              px: 1.3, py: 0.7, borderRadius: radius.full, fontSize: '0.85rem', fontWeight: 700,
              color: colors.primary.text, background: colors.surface.overlay, border: `1px solid ${colors.border.subtle}`,
              '&:focus-visible': { outline: `2px solid ${colors.primary.main}`, outlineOffset: 2 },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 17 }} />
            Voltar
          </Box>
          <BrandMark logo={28} size="1rem" />
        </Stack>

        <Typography component="h1" sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.4rem' }, color: colors.text.primary, lineHeight: 1.1 }}>
          {title}
        </Typography>
        <Typography variant="lg" sx={{ mt: 1, color: colors.text.secondary }}>
          {intro}
        </Typography>
        <Typography variant="sm" sx={{ mt: 0.6, color: colors.text.muted }}>
          Última atualização: {UPDATED_AT}
        </Typography>

        <Stack spacing={3} sx={{ mt: 4 }}>
          {sections.map((section, index) => (
            <Box component="section" key={section.title}>
              <Typography component="h2" sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.2rem', color: colors.text.primary, mb: 1 }}>
                {index + 1}. {section.title}
              </Typography>
              <Stack spacing={1.2} sx={{
                color: colors.text.secondary, fontSize: '0.95rem', lineHeight: 1.65,
                '& li': { mb: 0.6 },
                '& a': { color: colors.primary.text, fontWeight: 700, wordBreak: 'break-all' },
                '& strong': { color: colors.text.primary },
              }}>
                {section.body.map((paragraph, i) => (
                  typeof paragraph === 'string'
                    ? <Typography key={i} component="p" sx={{ m: 0, font: 'inherit', color: 'inherit' }}>{paragraph}</Typography>
                    : <Box key={i} sx={{ m: 0 }}>{paragraph}</Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>

        <Box sx={{ mt: 5, pt: 3, borderTop: `1px solid ${colors.border.subtle}`, textAlign: 'center' }}>
          <Typography variant="md" sx={{ color: colors.text.secondary, mb: 2 }}>
            Veja também: <Link to={`/${other}`} replace style={{ color: colors.primary.text, fontWeight: 700 }}>{DOCS[other].title}</Link>
          </Typography>
          <Copyright />
        </Box>
      </Box>
    </Box>
  )
}
