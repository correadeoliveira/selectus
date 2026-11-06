import { addMonth } from "./calendar";
import type { DemoState, Format, Work } from "./types";

export const formats: Record<
  Format,
  { label: string; plural: string; route: string; verb: string }
> = {
  filme: {
    label: "Filme",
    plural: "Filmes",
    route: "/filmes",
    verb: "Assistir",
  },
  livro: {
    label: "Livro",
    plural: "Livros",
    route: "/livros",
    verb: "Ler agora",
  },
  arte: { label: "Arte", plural: "Arte", route: "/arte", verb: "Contemplar" },
  musica: {
    label: "Música",
    plural: "Música",
    route: "/musica",
    verb: "Ouvir agora",
  },
  noticia: {
    label: "Notícia",
    plural: "Notícias",
    route: "/noticias",
    verb: "Ler notícia",
  },
  artigo: {
    label: "Artigo",
    plural: "Artigos",
    route: "/inspire-se",
    verb: "Ler reflexão",
  },
};
export const emotions = [
  { id: "inspirador", emoji: "🙏", label: "Inspirador" },
  { id: "admiravel", emoji: "👏", label: "Admirável" },
  { id: "pensativo", emoji: "🤔", label: "Faz pensar" },
  { id: "comovente", emoji: "😢", label: "Comovente" },
  { id: "surpreendente", emoji: "😮", label: "Surpreendente" },
] as const;
export const navigation = [
  ["/", "Início"],
  ["/filmes", "Filmes"],
  ["/livros", "Livros"],
  ["/arte", "Arte"],
  ["/musica", "Música"],
  ["/noticias", "Notícias"],
  ["/inspire-se", "Inspire-se"],
  ["/comunidade", "Comunidade"],
  ["/relacionamentos", "Relacionamentos"],
  ["/colecoes", "Minhas Coleções"],
] as const;
export const collections = [
  {
    id: "esperanca",
    title: "Histórias de esperança",
    subtitle: "A luz também encontra seus caminhos.",
    image: "/assets/hero.jpg",
    tag: "Esperança",
    count: 8,
  },
  {
    id: "beleza",
    title: "Beleza que faz pensar",
    subtitle: "Um convite a olhar mais devagar.",
    image: "/assets/art-1.jpg",
    tag: "Beleza",
    count: 8,
  },
  {
    id: "familia",
    title: "Amor que atravessa o tempo",
    subtitle: "Os laços que fazem de nós quem somos.",
    image: "/assets/garden.jpg",
    tag: "Família",
    count: 8,
  },
  {
    id: "sacra",
    title: "Entre o céu e a terra",
    subtitle: "Arte, silêncio e formação católica.",
    image: "/assets/church.jpg",
    tag: "Formação católica",
    count: 4,
  },
];
const reader = [
  "Uma noite destas, vindo da cidade para o Engenho Novo, encontrei no trem da Central um rapaz aqui do bairro, que eu conheço de vista e de chapéu. Cumprimentou-me, sentou-se ao pé de mim, falou da lua e dos ministros, e acabou recitando-me versos.",
  "A viagem era curta, e os versos pode ser que não fossem inteiramente maus. Sucedeu, porém, que, como eu estava cansado, fechei os olhos três ou quatro vezes; tanto bastou para que ele interrompesse a leitura e metesse os versos no bolso.",
  "— Continue, disse eu acordando.\n— Já acabei, murmurou ele.\n— São muito bonitos.",
  "Vi-lhe fazer um gesto para tirá-los outra vez do bolso, mas não passou do gesto; estava amuado. No dia seguinte entrou a dizer de mim nomes feios, e acabou alcunhando-me Dom Casmurro. Os vizinhos, que não gostam dos meus hábitos reclusos e calados, deram curso à alcunha, que afinal pegou.",
];
type Entry = [
  string,
  string,
  Format,
  string,
  string,
  string,
  string,
  string,
  string[],
];
const entries: Entry[] = [
  [
    "viagem-lua",
    "Viagem à Lua",
    "filme",
    "Georges Méliès",
    "1902",
    "13 min",
    "Uma aventura que nasceu da imaginação e mudou para sempre a forma de contar histórias.",
    "moon",
    ["Imaginação", "Esperança", "Clássicos"],
  ],
  [
    "general",
    "A General",
    "filme",
    "Buster Keaton",
    "1926",
    "78 min",
    "Entre trens e desencontros, a coragem toma a forma improvável de uma grande comédia.",
    "train",
    ["Família", "Clássicos"],
  ],
  [
    "gabinete",
    "O gabinete do Dr. Caligari",
    "filme",
    "Robert Wiene",
    "1920",
    "74 min",
    "Sombras, cenários e uma pergunta sobre o que nossos olhos realmente conseguem ver.",
    "cinema",
    ["Beleza", "Clássicos"],
  ],
  [
    "luzes",
    "O imigrante",
    "filme",
    "Charles Chaplin",
    "1917",
    "25 min",
    "A travessia de quem parte em busca de um futuro, contada com humor e humanidade.",
    "ocean",
    ["Esperança", "Família"],
  ],
  [
    "dom-casmurro",
    "Dom Casmurro",
    "livro",
    "Machado de Assis",
    "1899",
    "256 páginas",
    "Memória, amor e as histórias que contamos a nós mesmos. Um encontro com um clássico brasileiro.",
    "book-1",
    ["Família", "Clássicos"],
  ],
  [
    "jardim-secreto",
    "O jardim secreto",
    "livro",
    "Frances Hodgson Burnett",
    "1911",
    "Obra em inglês",
    "Entre muros e flores, uma descoberta sobre cuidado, amizade e recomeços.",
    "garden",
    ["Esperança", "Beleza"],
  ],
  [
    "confissoes",
    "Confissões",
    "livro",
    "Santo Agostinho",
    "c. 397",
    "Edição a selecionar",
    "A inquietação de uma vida em busca de sentido, verdade e pertencimento.",
    "book-2",
    ["Formação católica", "Esperança"],
  ],
  [
    "alencar",
    "O guarani",
    "livro",
    "José de Alencar",
    "1857",
    "Edição a selecionar",
    "Natureza e imaginação no romance que ocupa um lugar singular na literatura brasileira.",
    "forest",
    ["Beleza", "Clássicos"],
  ],
  [
    "grande-jatte",
    "Uma tarde de domingo",
    "arte",
    "Georges Seurat",
    "1884–1886",
    "Óleo sobre tela",
    "Pequenos pontos de cor revelam uma vida inteira. Detenha o olhar e encontre outros detalhes.",
    "art-1",
    ["Beleza", "Família"],
  ],
  [
    "quarto",
    "O quarto",
    "arte",
    "Vincent van Gogh",
    "1888",
    "Óleo sobre tela",
    "O desejo de repouso e acolhimento ganha forma em um quarto de cores inesquecíveis.",
    "art-2",
    ["Beleza", "Esperança"],
  ],
  [
    "nenufares",
    "Reflexos de nuvens",
    "arte",
    "Claude Monet",
    "c. 1914–1926",
    "Óleo sobre tela",
    "A água, a luz e um instante que parece durar para sempre.",
    "art-3",
    ["Beleza", "Esperança"],
  ],
  [
    "onda",
    "A grande onda",
    "arte",
    "Katsushika Hokusai",
    "c. 1831",
    "Xilogravura",
    "O movimento do mar e a delicadeza humana diante de uma natureza imensa.",
    "art-4",
    ["Beleza", "Clássicos"],
  ],
  [
    "clair",
    "Clair de lune",
    "musica",
    "Claude Debussy",
    "1905",
    "Gravação a selecionar",
    "Um intervalo de delicadeza para ouvir com tempo e deixar a mente encontrar silêncio.",
    "piano",
    ["Beleza", "Esperança"],
  ],
  [
    "bach",
    "Prelúdio em dó maior",
    "musica",
    "Johann Sebastian Bach",
    "1722",
    "Amostra de piano",
    "Uma sequência de notas que abre espaço para a ordem, o respiro e a contemplação.",
    "music-2",
    ["Beleza", "Clássicos"],
  ],
  [
    "satie",
    "Gymnopédie nº 1",
    "musica",
    "Erik Satie",
    "1888",
    "Gravação a selecionar",
    "Uma melodia que caminha sem pressa e transforma a escuta em presença.",
    "music-3",
    ["Beleza", "Esperança"],
  ],
  [
    "ave",
    "Ave Maria",
    "musica",
    "Franz Schubert",
    "1825",
    "Gravação a selecionar",
    "A força da tradição musical em uma composição que atravessa gerações.",
    "church",
    ["Formação católica", "Família"],
  ],
  [
    "bibliotecas",
    "O encontro começa em uma biblioteca",
    "noticia",
    "Redação Selectus · demonstração",
    "2026",
    "4 min de leitura",
    "Pauta demonstrativa: como espaços de leitura podem aproximar gerações e fortalecer os vínculos de um bairro.",
    "library",
    ["Família", "Cultura"],
  ],
  [
    "patrimonio",
    "Preservar a memória é cuidar do futuro",
    "noticia",
    "Redação Selectus · demonstração",
    "2026",
    "3 min de leitura",
    "Pauta demonstrativa sobre patrimônio, conservação e o valor de reconhecer a história dos lugares.",
    "church",
    ["Beleza", "Cultura"],
  ],
  [
    "educacao",
    "O lugar dos clássicos na formação",
    "noticia",
    "Redação Selectus · demonstração",
    "2026",
    "5 min de leitura",
    "Uma análise demonstrativa sobre leitura, educação e o encontro entre diferentes gerações.",
    "book-2",
    ["Família", "Educação"],
  ],
  [
    "voluntarios",
    "A cultura do cuidado no dia a dia",
    "noticia",
    "Redação Selectus · demonstração",
    "2026",
    "3 min de leitura",
    "Pauta demonstrativa sobre os pequenos gestos que tornam uma comunidade mais próxima.",
    "garden",
    ["Esperança", "Sociedade"],
  ],
  [
    "olhar",
    "A beleza pede um pouco de silêncio",
    "artigo",
    "Equipe Selectus · demonstração",
    "2026",
    "6 min de leitura",
    "Nem tudo o que importa precisa de pressa. Uma reflexão sobre reaprender a olhar.",
    "hero",
    ["Beleza", "Esperança"],
  ],
  [
    "casa",
    "O que faz de um lugar a nossa casa?",
    "artigo",
    "Equipe Selectus · demonstração",
    "2026",
    "5 min de leitura",
    "Entre lembranças e pessoas, há algo que não cabe nas paredes.",
    "art-2",
    ["Família", "Beleza"],
  ],
  [
    "servir",
    "Há grandeza nos pequenos gestos",
    "artigo",
    "Equipe Selectus · demonstração",
    "2026",
    "4 min de leitura",
    "Um convite a reconhecer a esperança nos encontros mais simples.",
    "forest",
    ["Esperança", "Família"],
  ],
  [
    "sacra",
    "A arte como caminho de contemplação",
    "artigo",
    "Equipe Selectus · demonstração",
    "2026",
    "7 min de leitura",
    "Uma introdução à arte sacra e aos símbolos que convidam à reflexão.",
    "church",
    ["Formação católica", "Beleza"],
  ],
];
const artSources = [
  "https://commons.wikimedia.org/wiki/File:A_Sunday_on_La_Grande_Jatte,_Georges_Seurat,_1884.jpg",
  "https://commons.wikimedia.org/wiki/File:Vincent_van_Gogh_-_De_slaapkamer_-_Google_Art_Project.jpg",
  "https://commons.wikimedia.org/wiki/File:Reflections_of_Clouds_on_the_Water-Lily_Pond.jpg",
  "https://commons.wikimedia.org/wiki/File:Tsunami_by_hokusai_19th_century.jpg",
];
export function createSeed(now = new Date()): DemoState {
  const at = (days: number) =>
    new Date(now.getTime() + days * 86400000).toISOString();
  const works: Work[] = entries.map((e, i) => ({
    id: e[0],
    title: e[1],
    format: e[2],
    author: e[3],
    year: e[4],
    duration: e[5],
    description: e[6],
    image: "/assets/" + e[7] + ".jpg",
    imageCredit: e[7].startsWith("art-")
      ? "Wikimedia Commons · reprodução de obra em domínio público"
      : "Fotografia de ambientação · fontes em Créditos",
    tags: e[8],
    publishedAt: at(-(i % 4) - Math.floor(i / 4) * 0.09),
    status: "publicado",
    featured: [0, 4, 8, 13].includes(i),
    versions: [
      {
        id: e[0] + "-v1",
        label:
          e[2] === "livro"
            ? i === 4
              ? "Original em português · amostra"
              : "Ficha de demonstração"
            : e[2] === "musica"
              ? i === 13
                ? "Síntese original · amostra"
                : "Ficha de demonstração"
              : "Versão de demonstração",
        language: "pt-BR",
        media:
          i === 0
            ? "/assets/moon.mp4"
            : i === 13
              ? "/assets/prelude.wav"
              : undefined,
        source:
          i === 0
            ? "https://commons.wikimedia.org/wiki/File:Le_Voyage_dans_la_Lune_(1902).webm"
            : i === 4
              ? "https://pt.wikisource.org/wiki/Dom_Casmurro/I"
              : i >= 8 && i < 12
                ? artSources[i - 8]
                : i >= 16
                  ? "Produção original da equipe · demonstração"
                  : "Seleção demonstrativa; arquivo de produção pendente",
        rights:
          i >= 16
            ? "Texto original criado para demonstrar a experiência editorial, sem reprodução de notícia de terceiros."
            : i === 13
              ? "Composição em domínio público; síntese original Selectus, CC0."
              : i === 4
                ? "Texto original em domínio público; transcrição de amostra."
                : i >= 8 && i < 12
                  ? "Reprodução fiel de obra em domínio público, via Wikimedia Commons."
                  : i === 0
                    ? "Cópia sem trilha; fonte Wikimedia Commons com marcação de domínio público."
                    : "Metadados de demonstração. Direitos da versão final ainda não conferidos.",
        evidence:
          i >= 16
            ? "Texto original demonstrativo da equipe; fotografias com licença própria em Créditos"
            : i === 0
              ? "Wikimedia Commons · PD-old-auto-expired"
              : i === 4
                ? "Wikisource · autor falecido em 1908"
                : i >= 8 && i < 12
                  ? "Wikimedia Commons · página do arquivo em Créditos"
                  : i === 13
                    ? "Arquivo gerado localmente, sem gravação de terceiros"
                    : "",
        territories: "Brasil · demonstração",
        reviewer: "Equipe de demonstração",
        reviewed: [
          0, 4, 8, 9, 10, 11, 13, 16, 17, 18, 19, 20, 21, 22, 23,
        ].includes(i),
      },
    ],
    body:
      i === 4
        ? reader
        : e[2] === "artigo" || e[2] === "noticia"
          ? [
              e[6],
              "Este texto foi escrito para demonstrar a experiência editorial do Selectus. Não relata um acontecimento real nem substitui uma apuração jornalística.",
              "Uma boa conversa começa quando damos espaço à atenção. Um livro compartilhado, uma música ouvida juntos e um lugar preservado podem abrir caminhos para compreender melhor o mundo e as pessoas ao nosso redor.",
              "O Selectus nasce desse desejo de encontro: reconhecer o que permanece, aproximar perspectivas e construir conversas com respeito. A curadoria de inspiração cristã tem raízes católicas e acolhe a participação de todos.",
            ]
          : undefined,
    category: ["Cultura", "Sociedade", "Educação", "Família"][i % 4],
    editorial: i === 18 ? "Análise" : "Notícia",
    source:
      e[2] === "noticia"
        ? "Pauta fictícia · sem fonte jornalística externa"
        : undefined,
    corrections: [],
  }));
  const scenarios = [
    "gratuito",
    "pagante",
    "bonificado",
    "vencido",
    "equipe",
  ] as const;
  return {
    version: 1,
    scenario: "bonificado",
    currentUserId: "bonificado",
    users: [
      ...scenarios.map((id) => ({
        id,
        name: id === "equipe" ? "Equipe Selectus" : "Mariana Oliveira",
        contact: id + "@exemplo.test",
        role:
          id === "equipe" ? ("administrador" as const) : ("membro" as const),
        suspended: false,
        formation: false,
      })),
      {
        id: "ana",
        name: "Ana Beatriz",
        contact: "ana@exemplo.test",
        role: "membro",
        suspended: false,
        formation: false,
      },
      {
        id: "pedro",
        name: "Pedro Henrique",
        contact: "pedro@exemplo.test",
        role: "membro",
        suspended: false,
        formation: false,
      },
      {
        id: "clara",
        name: "Clara Martins",
        contact: "clara@exemplo.test",
        role: "membro",
        suspended: false,
        formation: false,
      },
      {
        id: "amigo-demo",
        name: "Seu próximo convidado",
        contact: "amigo@exemplo.test",
        role: "membro",
        suspended: false,
        formation: false,
      },
    ],
    works,
    interactions: {
      "bonificado:dom-casmurro": { liked: true },
      "bonificado:grande-jatte": { liked: true, emotion: "admiravel" },
      "ana:viagem-lua": { liked: true, emotion: "surpreendente" },
      "pedro:grande-jatte": { liked: true },
      "clara:olhar": { liked: true, emotion: "inspirador" },
    },
    progress: {
      "bonificado:dom-casmurro-v1": 2,
      "bonificado:viagem-lua-v1": 42,
    },
    comments: [
      {
        id: "c1",
        workId: "viagem-lua",
        userId: "ana",
        text: "É bonito perceber o quanto a imaginação já era capaz de fazer. O cinema também começou com um sonho.",
        date: at(-1),
        removed: false,
      },
      {
        id: "c2",
        workId: "grande-jatte",
        userId: "pedro",
        text: "Quanto mais tempo olho, mais detalhes encontro. A sensação é de entrar devagar na cena.",
        date: at(-2),
        removed: false,
      },
      {
        id: "c3",
        workId: "dom-casmurro",
        userId: "clara",
        text: "Voltar a um clássico em outra fase da vida é quase ler um livro diferente. Alguém mais sente isso?",
        date: at(-1),
        removed: false,
      },
      {
        id: "c4",
        workId: "dom-casmurro",
        userId: "ana",
        parentId: "c3",
        text: "Sim! A gente muda e o que chama a atenção no texto também muda.",
        date: at(-1),
        removed: false,
      },
      {
        id: "c5",
        workId: "olhar",
        userId: "pedro",
        text: "Uma boa lembrança para desacelerar e dar atenção às coisas pequenas.",
        date: at(-2),
        removed: false,
      },
    ],
    grants: [
      {
        id: "g1",
        userId: "bonificado",
        origin: "bonus",
        reference: "boas-vindas-demo",
        start: at(-4),
        end: at(26),
      },
      {
        id: "g2",
        userId: "pagante",
        origin: "pago",
        reference: "pagamento-demo",
        start: at(-5),
        end: addMonth(new Date(at(-5))).toISOString(),
      },
      {
        id: "g3",
        userId: "vencido",
        origin: "pago",
        reference: "pagamento-vencido",
        start: at(-35),
        end: addMonth(new Date(at(-35))).toISOString(),
      },
      {
        id: "g4",
        userId: "equipe",
        origin: "bonus",
        reference: "equipe-demo",
        start: at(-1),
        end: at(29),
      },
    ],
    payments: [
      {
        id: "pagamento-demo",
        userId: "pagante",
        amount: 99,
        status: "confirmado",
        createdAt: at(-5),
        expiresAt: at(-4),
      },
    ],
    referrals: [
      {
        id: "r1",
        inviterId: "bonificado",
        inviteeId: "amigo-demo",
        name: "Seu próximo convidado",
        code: "SELECT-BONIFICADO",
        registered: false,
        opened: false,
        granted: false,
      },
    ],
    reports: [],
    blocked: {},
    audit: [
      {
        id: "a1",
        action: "Ambiente de demonstração iniciado",
        date: now.toISOString(),
        actor: "Sistema",
      },
    ],
    support: [],
  };
}
