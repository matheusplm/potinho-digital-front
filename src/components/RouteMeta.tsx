import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://www.potinhodigital.com.br'
const BRAND = 'Potinho Digital'
const DEFAULT_TITLE = 'Potinho Digital — Álbum afetivo de bilhetes para quem você ama'
const DEFAULT_DESCRIPTION = 'Crie bilhetes digitais personalizados e presenteie quem você ama com pacotinhos surpresa — como um álbum de figurinhas, só que com mensagens de verdade. Gratuito.'

const PUBLIC_PAGES: Record<string, { title: string; description: string }> = {
  '/': { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
  '/login': {
    title: `Entrar — ${BRAND}`,
    description: 'Entre na sua conta do Potinho Digital para abrir seus pacotinhos e reler os bilhetes de quem você ama.',
  },
  '/register': {
    title: `Criar conta grátis — ${BRAND}`,
    description: 'Crie sua conta grátis e monte um álbum de bilhetes com pacotinhos surpresa para quem você ama.',
  },
}

const SECTION_TITLES: Array<[string, string]> = [
  ['/home', 'Início'],
  ['/colecoes', 'Coleções'],
  ['/conquistas', 'Conquistas'],
  ['/favoritas', 'Favoritas'],
  ['/notificacoes', 'Novidades'],
  ['/conta', 'Minha conta'],
  ['/convite', 'Convite'],
  ['/esqueci-minha-senha', 'Recuperar senha'],
  ['/redefinir-senha', 'Nova senha'],
  ['/verificar-email', 'Confirmar email'],
  ['/confirmar-troca-email', 'Trocar email'],
]

function setMeta(selector: string, attr: 'content' | 'href', value: string, create: () => HTMLElement) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

export function RouteMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
    const page = PUBLIC_PAGES[path]
    const section = SECTION_TITLES.find(([prefix]) => path.startsWith(prefix))?.[1]

    document.title = page?.title ?? (section ? `${section} · ${BRAND}` : BRAND)
    setMeta('meta[name="description"]', 'content', page?.description ?? DEFAULT_DESCRIPTION, () => Object.assign(document.createElement('meta'), { name: 'description' }))
    setMeta('meta[name="robots"]', 'content', page ? 'index, follow' : 'noindex, nofollow', () => Object.assign(document.createElement('meta'), { name: 'robots' }))
    setMeta('link[rel="canonical"]', 'href', `${SITE_URL}${page ? path : '/'}`, () => Object.assign(document.createElement('link'), { rel: 'canonical' }))
  }, [pathname])

  return null
}
