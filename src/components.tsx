import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChatCircle,
  Check,
  Compass,
  FilmSlate,
  Heart,
  MagnifyingGlass,
  MusicNotes,
  Palette,
  Play,
  Plus,
  SignOut,
  Smiley,
  Sparkle,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import { emotions, formats, navigation } from "./data";
import { accountService, catalogService, interactionKey } from "./services";
import { useDemo } from "./store";
import type { Format, Work } from "./types";

export const formatIcons = {
  filme: FilmSlate,
  livro: BookOpen,
  arte: Palette,
  musica: MusicNotes,
  noticia: ChatCircle,
  artigo: Sparkle,
};
export function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link
      to="/"
      className={"wordmark " + (small ? "small" : "")}
      aria-label="Selectus, início"
    >
      <span>selectus</span>
      <Sparkle weight="fill" aria-hidden="true" />
    </Link>
  );
}
export function Shell({ children }: { children: ReactNode }) {
  const { user, active, toast, storageError, update } = useDemo();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.title = "Selectus — Cultura que permanece";
    window.scrollTo({ top: 0 });
    navRef.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [location.pathname]);
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Logo />
          <span className="brand-description">Cultura que permanece.</span>
          <form
            className="header-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/busca?q=" + encodeURIComponent(search));
            }}
          >
            <MagnifyingGlass size={19} aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="O que você quer descobrir?"
              aria-label="Buscar no acervo"
            />
            <kbd>↵</kbd>
          </form>
          <Link
            className="mobile-search icon-button"
            to="/busca"
            aria-label="Buscar"
          >
            <MagnifyingGlass size={23} />
          </Link>
          <Link to="/convites" className="invite-header">
            Convide e inspire <ArrowUpRight size={15} />
          </Link>
          <Link
            to={user ? "/perfil" : "/entrar"}
            className="profile-button"
            aria-label={user ? "Abrir perfil de " + user.name : "Entrar"}
          >
            <span className="avatar">
              {user ? (
                user.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
              ) : (
                <UserCircle size={24} />
              )}
            </span>
            <span className="profile-copy">
              {user ? user.name.split(" ")[0] : "Entrar"}
              <small>{active ? "Membro Selectus" : "Faça parte"}</small>
            </span>
          </Link>
        </div>
        <div className="nav-wrap">
          <nav className="main-nav" aria-label="Áreas do Selectus" ref={navRef}>
            {navigation.map(([path, label]) => (
              <NavLink key={path} to={path} end={path === "/"}>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      {storageError && (
        <div className="notice warning">
          O navegador não conseguiu salvar. As alterações permanecem apenas
          nesta sessão.
        </div>
      )}
      <main id="conteudo" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <div>
          <Logo small />
          <p>Cultura e comunidade de inspiração cristã.</p>
        </div>
        <div className="footer-links">
          <Link to="/sobre">Sobre o Selectus</Link>
          <Link to="/suporte">Fale com a gente</Link>
          <Link to="/termos">Termos e convivência</Link>
          <Link to="/privacidade">Privacidade</Link>
          <Link to="/creditos">Créditos</Link>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Selectus</span>
          <span className="demo-indicator">
            <i /> Protótipo demonstrativo · dados neste navegador
          </span>
          <Link to="/perfil?demo=1">
            Explorar cenários <ArrowUpRight size={14} />
          </Link>
        </div>
      </footer>
      {toast && (
        <div className="toast" role="status">
          <Sparkle size={19} />
          <span>{toast}</span>
        </div>
      )}
      {user && location.pathname.startsWith("/admin") && (
        <button
          className="admin-exit"
          onClick={() => {
            update((s) => accountService.scenario(s, "bonificado"));
            navigate("/");
          }}
        >
          <SignOut /> Voltar ao membro
        </button>
      )}
    </>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function SectionHeading({
  title,
  subtitle,
  to,
  label = "Ver tudo",
}: {
  title: string;
  subtitle?: string;
  to?: string;
  label?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {to && (
        <Link className="text-link" to={to}>
          {label}
          <ArrowRight size={18} />
        </Link>
      )}
    </div>
  );
}
export function Empty({
  title = "Ainda há muito para descobrir.",
  text = "Explore o acervo e encontre seu próximo encontro com a cultura.",
  to = "/",
  action = "Explorar o acervo",
}: {
  title?: string;
  text?: string;
  to?: string;
  action?: string;
}) {
  return (
    <div className="empty">
      <Compass size={42} weight="thin" />
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="button secondary" to={to}>
        {action}
        <ArrowRight />
      </Link>
    </div>
  );
}
export function Filters({
  value,
  onChange,
}: {
  value: Format | "todos";
  onChange: (value: Format | "todos") => void;
}) {
  return (
    <div className="filter-row" aria-label="Filtrar por formato">
      <button
        className={"filter " + (value === "todos" ? "selected" : "")}
        aria-pressed={value === "todos"}
        onClick={() => onChange("todos")}
      >
        Todos
      </button>
      {Object.entries(formats).map(([key, f]) => (
        <button
          key={key}
          className={"filter " + (value === key ? "selected" : "")}
          aria-pressed={value === key}
          onClick={() => onChange(key as Format)}
        >
          {f.plural}
        </button>
      ))}
    </div>
  );
}
export function ReactionBar({ work }: { work: Work }) {
  const { state, user, update, notify } = useDemo();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const interaction =
    state.interactions[interactionKey(user?.id || "", work.id)];
  const current = emotions.find((e) => e.id === interaction?.emotion);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return (
    <div className="reaction-bar" ref={root}>
      <button
        aria-label={
          (interaction?.liked ? "Descurtir " : "Curtir ") + work.title
        }
        aria-pressed={!!interaction?.liked}
        className={interaction?.liked ? "liked" : ""}
        onClick={() =>
          update((s) => catalogService.like(s, work.id, !interaction?.liked))
        }
      >
        <Heart size={19} weight={interaction?.liked ? "fill" : "regular"} />
        <span>{catalogService.likes(state, work.id)}</span>
      </button>
      <button
        ref={trigger}
        aria-label={
          "Reagir a " + work.title + (current ? ": " + current.label : "")
        }
        aria-expanded={open}
        className={current ? "reacted" : ""}
        onClick={() => {
          if (!user) {
            notify("Entre na demonstração para reagir.");
            return;
          }
          setOpen(!open);
        }}
      >
        {current ? (
          <span className="reaction-emoji">{current.emoji}</span>
        ) : (
          <Smiley size={19} />
        )}
        <span>{catalogService.reactions(state, work.id)}</span>
      </button>
      <Link
        to={"/obra/" + work.id + "#conversa"}
        aria-label={"Abrir conversa sobre " + work.title}
      >
        <ChatCircle size={19} />
        <span>
          {
            state.comments.filter((c) => c.workId === work.id && !c.removed)
              .length
          }
        </span>
      </Link>
      {open && (
        <div
          className="emoji-picker"
          role="group"
          aria-label="Escolha sua reação"
        >
          {emotions.map((e) => (
            <button
              key={e.id}
              title={e.label}
              aria-label={e.label}
              aria-pressed={interaction?.emotion === e.id}
              onClick={() => {
                update((s) =>
                  catalogService.react(
                    s,
                    work.id,
                    interaction?.emotion === e.id ? undefined : e.id,
                  ),
                );
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              {e.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export function WorkCard({
  work,
  compact = false,
}: {
  work: Work;
  compact?: boolean;
}) {
  const Icon = formatIcons[work.format];
  const { state, user } = useDemo();
  const position = user
    ? state.progress[interactionKey(user.id, work.versions[0].id)]
    : undefined;
  return (
    <article
      className={"work-card " + work.format + (compact ? " compact" : "")}
    >
      <div className="card-picture">
        <Link
          className="picture-link"
          to={"/obra/" + work.id}
          tabIndex={-1}
          aria-hidden="true"
        >
          <img
            src={work.image}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/assets/hero.jpg";
            }}
          />
          <span className="picture-shade" />
          {work.format === "livro" && (
            <span className="book-cover">
              <span>{work.author}</span>
              <strong>{work.title}</strong>
              <i>Biblioteca Selectus</i>
            </span>
          )}
          {work.format === "filme" && (
            <span className="film-caption">{work.title}</span>
          )}
          <span className="format-badge">
            <Icon size={13} />
            {formats[work.format].label}
          </span>
          <span className="card-play">
            <Play weight="fill" size={22} />
          </span>
        </Link>
        <ReactionBar work={work} />
        {position !== undefined && (
          <span
            className="progress-line"
            style={{
              width:
                Math.min(
                  100,
                  work.format === "livro"
                    ? (position / 4) * 100
                    : (position / 770) * 100,
                ) + "%",
            }}
          />
        )}
      </div>
      <div className="card-copy">
        <span className="card-kicker">
          {work.format === "noticia" ? work.category : work.tags[0]}{" "}
          <span>· {work.year}</span>
        </span>
        <h3>
          <Link to={"/obra/" + work.id}>{work.title}</Link>
        </h3>
        <p>{work.author.replace(" · demonstração", "")}</p>
        {!compact && <span className="card-duration">{work.duration}</span>}
      </div>
    </article>
  );
}
export function WorkGrid({ works }: { works: Work[] }) {
  return works.length ? (
    <div className="work-grid">
      {works.map((w) => (
        <WorkCard key={w.id} work={w} />
      ))}
    </div>
  ) : (
    <Empty
      title="Nenhum encontro por aqui, ainda."
      text="Tente outro filtro ou descubra os outros formatos."
    />
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    const close = (e: Event) => {
      e.preventDefault();
      closeRef.current();
    };
    const dialog = ref.current;
    dialog?.addEventListener("cancel", close);
    return () => {
      dialog?.removeEventListener("cancel", close);
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={"modal " + (wide ? "wide" : "")}
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <button className="icon-button" aria-label="Fechar" onClick={onClose}>
          <X size={24} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Badge({
  children,
  good = false,
}: {
  children: ReactNode;
  good?: boolean;
}) {
  return (
    <span className={"status-badge " + (good ? "good" : "")}>{children}</span>
  );
}
export function dateLabel(value?: string) {
  return value
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "America/Sao_Paulo",
      }).format(new Date(value))
    : "—";
}
export function InlineNotice({ children }: { children: ReactNode }) {
  return (
    <div className="notice">
      <Sparkle size={20} />
      <div>{children}</div>
    </div>
  );
}
export {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChatCircle,
  Check,
  FilmSlate,
  Heart,
  MagnifyingGlass,
  MusicNotes,
  Palette,
  Play,
  Plus,
  Sparkle,
  X,
};
