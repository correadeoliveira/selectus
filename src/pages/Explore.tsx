import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChatCircle,
  Empty,
  FilmSlate,
  Filters,
  Heart,
  MusicNotes,
  PageHeading,
  Palette,
  Play,
  SectionHeading,
  Sparkle,
  WorkCard,
  WorkGrid,
  dateLabel,
} from "../components";
import { collections, formats } from "../data";
import { catalogService, interactionKey } from "../services";
import { useDemo } from "../store";
import type { Format } from "../types";

export function Home() {
  const { state, user } = useDemo();
  const [filter, setFilter] = useState<Format | "todos">("todos");
  const [heroIndex, setHeroIndex] = useState(0);
  const slides = [
    {
      image: "/assets/hero.jpg",
      alt: "Montanhas envoltas em névoa e luz ao amanhecer",
      lines: ["Há histórias que", "ficam com a gente."],
      theme: "Esperança",
      caption: "Um convite para recomeçar",
      name: "Histórias de esperança",
    },
    {
      image: "/assets/art-1.jpg",
      alt: "Uma tarde de domingo, de Georges Seurat",
      lines: ["A beleza encontra", "quem aprende a olhar."],
      theme: "Beleza",
      caption: "Um outro tempo para o olhar",
      name: "Beleza que faz pensar",
    },
    {
      image: "/assets/garden.jpg",
      alt: "Jardim iluminado pelo sol",
      lines: ["Boas histórias.", "Melhores companhias."],
      theme: "Família",
      caption: "Um lugar para estar mais perto",
      name: "Amor e família",
    },
  ];
  const slide = slides[heroIndex];
  const works = catalogService.published(state);
  const continued = works.filter(
    (w) =>
      user &&
      state.progress[interactionKey(user.id, w.versions[0].id)] !== undefined,
  );
  const latest = [...works].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
  return (
    <div className="home">
      <div className="welcome page-width">
        <div>
          <span className="greeting">Seu tempo merece boas histórias.</span>
          <span className="welcome-sub">
            Que bom ter você por aqui
            {user ? ", " + user.name.split(" ")[0] : ""}.
          </span>
        </div>
        <span className="welcome-note">
          <span className="live-dot" /> Um novo olhar, todos os dias
        </span>
      </div>
      <section className="hero" aria-labelledby="hero-title">
        <img
          className="hero-image"
          src={slide.image}
          alt={slide.alt}
          fetchPriority="high"
        />
        <div className="hero-scrim" />
        <div className="hero-inner page-width">
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkle size={16} weight="fill" /> Seleção especial
            </span>
            <h1 id="hero-title">
              {slide.lines[0]}
              <br />
              {slide.lines[1]}
            </h1>
            <p>
              Filmes, livros, arte e música para alimentar o olhar.
              <br className="desktop-only" /> E conversas para levar tudo isso
              além.
            </p>
            <div className="hero-actions">
              <Link
                className="button primary"
                to={"/inspire-se?tema=" + encodeURIComponent(slide.theme)}
              >
                <Play weight="fill" size={17} />
                Explore a seleção
              </Link>
              <Link className="button hero-secondary" to="/sobre">
                Conheça o Selectus <ArrowUpRight size={19} />
              </Link>
            </div>
            <div className="hero-members">
              <span className="mini-symbol">
                <Heart weight="fill" size={14} />
              </span>
              <span>Mais sentido no que você vê, lê e ouve.</span>
            </div>
          </div>
          <Link
            className="hero-caption"
            to={"/inspire-se?tema=" + encodeURIComponent(slide.theme)}
          >
            <span>{slide.caption}</span>
            <strong>
              {slide.name} <ArrowUpRight size={22} />
            </strong>
          </Link>
        </div>
        <div className="hero-bottom page-width">
          <span
            className="hero-index"
            role="group"
            aria-label="Seleções em destaque"
          >
            {slides.map((item, index) => (
              <button
                aria-label={item.name}
                aria-pressed={heroIndex === index}
                onClick={() => setHeroIndex(index)}
                key={item.name}
              >
                <i />
              </button>
            ))}
          </span>
          <span>
            0{heroIndex + 1} <span>/ 03</span>
          </span>
        </div>
      </section>
      <div className="page-width home-content">
        <div className="format-shortcuts">
          {[
            [
              FilmSlate,
              "Filmes",
              "/filmes",
              "Histórias que atravessam o tempo",
            ],
            [BookOpen, "Livros", "/livros", "Páginas que abrem caminhos"],
            [Palette, "Arte", "/arte", "Um olhar para a beleza"],
            [MusicNotes, "Música", "/musica", "Sons para estar presente"],
          ].map(([Icon, title, to, subtitle]) => {
            const Component = Icon as typeof FilmSlate;
            return (
              <Link to={to as string} key={title as string}>
                <Component size={27} weight="light" />
                <span>
                  <strong>{title as string}</strong>
                  <small>{subtitle as string}</small>
                </span>
                <ArrowUpRight size={18} />
              </Link>
            );
          })}
        </div>
        <section className="section">
          <SectionHeading
            title="Novidades do acervo"
            subtitle="Escolhidas com cuidado. Para descobrir no seu tempo."
          />
          <Filters value={filter} onChange={setFilter} />
          <div className="work-grid">
            {latest
              .filter((w) => filter === "todos" || w.format === filter)
              .slice(0, filter === "todos" ? 8 : 4)
              .map((w) => (
                <WorkCard work={w} key={w.id} />
              ))}
          </div>
        </section>
        <section className="section">
          <SectionHeading
            title="Escolhas da curadoria"
            subtitle="Obras que merecem um lugar no seu tempo."
          />
          <div className="work-grid">
            {works
              .filter((w) => w.featured)
              .map((w) => (
                <WorkCard key={w.id} work={w} />
              ))}
          </div>
        </section>
        {continued.length > 0 && (
          <section className="section">
            <SectionHeading
              title="Continue de onde parou"
              subtitle="Boas histórias esperam pelo seu tempo."
              to="/colecoes"
            />
            <div className="continue-grid">
              {continued.map((w) => (
                <Link
                  to={"/obra/" + w.id + "?abrir=1"}
                  className="continue-card"
                  key={w.id}
                >
                  <img src={w.image} alt="" />
                  <span className="continue-icon">
                    <Play weight="fill" />
                  </span>
                  <div>
                    <small>{formats[w.format].label}</small>
                    <h3>{w.title}</h3>
                    <p>
                      {w.format === "livro"
                        ? "Retomar leitura"
                        : "Continuar assistindo"}
                    </p>
                  </div>
                  <ArrowRight />
                </Link>
              ))}
            </div>
          </section>
        )}
        <section className="section">
          <SectionHeading
            title="Caminhos para se inspirar"
            subtitle="Diferentes expressões. O mesmo desejo de encontrar sentido."
            to="/inspire-se"
            label="Todas as seleções"
          />
          <div className="collection-grid">
            {collections.slice(0, 3).map((c) => (
              <Link
                to={"/inspire-se?tema=" + encodeURIComponent(c.tag)}
                className="collection-card"
                key={c.id}
              >
                <img src={c.image} alt="" loading="lazy" />
                <div>
                  <small>Seleção Selectus</small>
                  <h3>{c.title}</h3>
                  <p>{c.subtitle}</p>
                </div>
                <ArrowUpRight size={24} />
              </Link>
            ))}
          </div>
        </section>
        <section className="invitation-banner">
          <div className="banner-mark">
            <Sparkle weight="thin" />
          </div>
          <div>
            <span className="eyebrow">
              Cultura é ainda melhor quando compartilhada
            </span>
            <h2>Boas descobertas merecem companhia.</h2>
            <p>
              Convide alguém. Vocês dois ganham 30 dias para explorar o
              Selectus.
            </p>
          </div>
          <Link to="/convites" className="button secondary">
            Convide um amigo <ArrowUpRight size={18} />
          </Link>
        </section>
      </div>
    </div>
  );
}
export function Catalog() {
  const { state } = useDemo();
  const location = useLocation();
  const format =
    (Object.keys(formats) as Format[]).find(
      (k) => formats[k].route === location.pathname,
    ) || "filme";
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("recentes");
  const [category, setCategory] = useState("Todas");
  const descriptions: Record<Format, string> = {
    filme:
      "Grandes histórias nunca perdem seu lugar. Descubra os clássicos do cinema.",
    livro: "Há sempre um novo mundo esperando na próxima página.",
    arte: "Dê tempo ao olhar. A beleza se revela nos detalhes.",
    musica: "Encontre a trilha para estar mais presente.",
    noticia: "Um olhar atento sobre cultura, sociedade e o que nos aproxima.",
    artigo: "Reflexões para levar a cultura para dentro da vida.",
  };
  const works = catalogService
    .published(state)
    .filter(
      (w) =>
        w.format === format &&
        (w.title + w.author).toLowerCase().includes(search.toLowerCase()) &&
        (category === "Todas" || w.category === category),
    );
  works.sort(
    order === "titulo"
      ? (a, b) => a.title.localeCompare(b.title)
      : (a, b) => b.publishedAt.localeCompare(a.publishedAt),
  );
  return (
    <div className="page-width content-page">
      <PageHeading
        eyebrow="Acervo Selectus"
        title={formats[format].plural}
        description={descriptions[format]}
      />
      {format === "noticia" && (
        <div className="editorial-note">
          <span>Olhar editorial</span>
          <p>
            Curadoria conservadora, com fontes claras e espaço para o diálogo.
            As pautas deste protótipo são fictícias e estão identificadas.
          </p>
        </div>
      )}
      <div className="catalog-toolbar">
        <label className="search-field">
          <Magnifier />
          <input
            aria-label="Buscar nesta área"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              "Buscar " + formats[format].plural.toLowerCase() + " ou autoria"
            }
          />
        </label>
        <span>{works.length} conteúdos</span>
        <label className="sort-label">
          Ordenar por
          <select value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="recentes">Mais recentes</option>
            <option value="titulo">Título A–Z</option>
          </select>
        </label>
      </div>
      {format === "noticia" && (
        <div className="filter-row">
          {[
            "Todas",
            "Cultura",
            "Sociedade",
            "Educação",
            "Família",
            "Brasil",
            "Mundo",
            "Política",
            "Economia",
            "Cristianismo",
          ].map((c) => (
            <button
              className={"filter " + (category === c ? "selected" : "")}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <WorkGrid works={works} />
    </div>
  );
}
function Magnifier() {
  return (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </svg>
  );
}
export function Inspire() {
  const { state, user } = useDemo();
  const [params, setParams] = useSearchParams();
  const theme = params.get("tema") || "";
  const selected = collections.find((c) => c.tag === theme);
  const works = catalogService
    .published(state)
    .filter(
      (w) =>
        (!theme || w.tags.includes(theme)) &&
        (user?.formation ||
          theme === "Formação católica" ||
          !w.tags.includes("Formação católica")),
    );
  return (
    <div className="page-width content-page">
      <PageHeading
        eyebrow="Entre ideias e descobertas"
        title="Inspire-se"
        description="Quando diferentes histórias se encontram, novos sentidos aparecem."
      />
      {!theme && (
        <div className="collection-grid inspire-grid">
          {collections.map((c) => (
            <button
              className="collection-card"
              onClick={() => setParams({ tema: c.tag })}
              key={c.id}
            >
              <img src={c.image} alt="" />
              <div>
                <small>
                  {c.tag === "Formação católica"
                    ? "Formação católica · opcional"
                    : "Seleção Selectus"}
                </small>
                <h3>{c.title}</h3>
                <p>{c.subtitle}</p>
              </div>
              <ArrowUpRight size={24} />
            </button>
          ))}
        </div>
      )}
      <div className="section-heading">
        <h2>{selected?.title || "Para descobrir com calma"}</h2>
        {theme && (
          <button className="text-link" onClick={() => setParams({})}>
            Todas as seleções <ArrowRight />
          </button>
        )}
      </div>
      <WorkGrid works={works} />
    </div>
  );
}
export function Search() {
  const { state } = useDemo();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const [filter, setFilter] = useState<Format | "todos">("todos");
  const results = catalogService
    .published(state)
    .filter(
      (w) =>
        (w.title + " " + w.author + " " + w.tags.join(" "))
          .toLocaleLowerCase("pt-BR")
          .includes(query.toLocaleLowerCase("pt-BR")) &&
        (filter === "todos" || w.format === filter),
    );
  return (
    <div className="page-width content-page">
      <PageHeading
        eyebrow="Deixe a curiosidade guiar"
        title="O que você quer descobrir?"
      />
      <label className="search-field large-search">
        <Magnifier />
        <input
          aria-label="Buscar no Selectus"
          value={query}
          onChange={(e) => setParams({ q: e.target.value }, { replace: true })}
          autoFocus
          placeholder="Uma obra, um autor, um tema…"
        />
      </label>
      <Filters value={filter} onChange={setFilter} />
      <p className="muted">
        {results.length} {results.length === 1 ? "encontro" : "encontros"}{" "}
        {query && "para “" + query + "”"}
      </p>
      <WorkGrid works={results} />
    </div>
  );
}
export function MyCollections() {
  const { state, user } = useDemo();
  const [filter, setFilter] = useState<Format | "todos">("todos");
  const works = catalogService
    .published(state)
    .filter(
      (w) =>
        user &&
        state.interactions[interactionKey(user.id, w.id)]?.liked &&
        (filter === "todos" || w.format === filter),
    );
  return (
    <div className="page-width content-page">
      <PageHeading
        eyebrow="Seu espaço, suas descobertas"
        title="Minhas Coleções"
        description="Tudo o que tocou você, guardado em um só lugar. Só você vê esta coleção."
      >
        <span className="collection-count">
          <Heart weight="thin" size={28} />
          {works.length} encontros
        </span>
      </PageHeading>
      {!user ? (
        <Empty
          title="Guarde o que faz sentido para você."
          text="Entre para reunir suas obras favoritas em uma coleção privada."
          to="/entrar"
          action="Entrar na demonstração"
        />
      ) : (
        <>
          <Filters value={filter} onChange={setFilter} />
          {works.length ? (
            <WorkGrid works={works} />
          ) : (
            <Empty
              title="A sua coleção começa com um coração."
              text="Curta uma obra no acervo e ela aparecerá aqui."
            />
          )}
        </>
      )}
    </div>
  );
}
export function Community() {
  const { state } = useDemo();
  const [query, setQuery] = useState("");
  const works = catalogService
    .published(state)
    .filter((w) => w.title.toLowerCase().includes(query.toLowerCase()));
  const recent = state.comments
    .filter((c) => !c.removed && works.some((w) => w.id === c.workId))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);
  return (
    <div className="page-width content-page">
      <PageHeading
        eyebrow="A cultura continua na conversa"
        title="Comunidade"
        description="Um espaço para ouvir, compartilhar perspectivas e encontrar companhia nas boas histórias."
      />
      <div className="community-layout">
        <section>
          <SectionHeading title="Encontre uma conversa" />
          <label className="search-field">
            <Magnifier />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar fóruns"
              placeholder="Buscar por obra ou publicação"
            />
          </label>
          <div className="forum-list">
            {works.map((w) => (
              <Link to={"/obra/" + w.id + "#conversa"} key={w.id}>
                <img src={w.image} alt="" />
                <div>
                  <small>{formats[w.format].label}</small>
                  <h3>{w.title}</h3>
                  <p>{w.author}</p>
                </div>
                <span>
                  <ChatCircle size={18} />
                  {
                    state.comments.filter(
                      (c) => c.workId === w.id && !c.removed,
                    ).length
                  }
                </span>
                <ArrowRight />
              </Link>
            ))}
          </div>
        </section>
        <aside className="community-aside">
          <h2>Conversas recentes</h2>
          {recent.map((c) => (
            <Link
              key={c.id}
              to={"/obra/" + c.workId + "#conversa"}
              className="recent-comment"
            >
              <small>
                {state.users.find((u) => u.id === c.userId)?.name} ·{" "}
                {dateLabel(c.date)}
              </small>
              <p>“{c.text}”</p>
              <span>
                {state.works.find((w) => w.id === c.workId)?.title}
                <ArrowUpRight size={15} />
              </span>
            </Link>
          ))}
          <div className="quiet-panel">
            <Sparkle size={27} />
            <h3>O respeito faz parte.</h3>
            <p>
              Discordar também pode ser uma forma de aprender. Leia nossas
              regras antes de participar.
            </p>
            <Link className="text-link" to="/termos">
              Regras de convivência <ArrowRight />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
export function Relationships() {
  return (
    <div className="page-width content-page">
      <div className="coming-soon">
        <span className="outline-symbol">
          <Heart weight="thin" size={60} />
        </span>
        <span className="eyebrow">Uma nova forma de encontrar companhia</span>
        <h1>
          Alguns encontros
          <br />
          merecem seu próprio tempo.
        </h1>
        <p>
          Estamos preparando um espaço de relacionamentos para quem deseja
          construir conexões com valores em comum.
        </p>
        <div className="coming-details">
          <span>Ativação opcional</span>
          <span>Perfil separado</span>
          <span>Somente maiores de 18 anos</span>
        </div>
        <span className="status-badge">Planejado para uma próxima versão</span>
        <Link className="text-link" to="/">
          Enquanto isso, explore o Selectus <ArrowRight />
        </Link>
      </div>
    </div>
  );
}
