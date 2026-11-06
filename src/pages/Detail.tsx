import { useCallback, useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowsOut,
  CaretLeft,
  CaretRight,
  Flag,
  PencilSimple,
  Prohibit,
  Trash,
} from "@phosphor-icons/react";
import {
  ArrowRight,
  Badge,
  ChatCircle,
  InlineNotice,
  Modal,
  Play,
  ReactionBar,
  SectionHeading,
  WorkCard,
  dateLabel,
} from "../components";
import { formats } from "../data";
import {
  accountService,
  catalogService,
  communityService,
  interactionKey,
} from "../services";
import { useDemo } from "../store";
import type { Comment, Work } from "../types";

export function Detail() {
  const { id } = useParams();
  const { state, active, user } = useDemo();
  const [params] = useSearchParams();
  const location = useLocation();
  const work = state.works.find((w) => w.id === id && w.status === "publicado");
  const [versionId, setVersionId] = useState("");
  const [viewer, setViewer] = useState(false);
  const closeViewer = useCallback(() => setViewer(false), []);
  useEffect(() => {
    setVersionId("");
    setViewer(params.get("abrir") === "1");
  }, [id, params]);
  useEffect(() => {
    if (location.hash === "#conversa") {
      const timer = setTimeout(
        () =>
          document
            .getElementById("conversa")
            ?.scrollIntoView({ behavior: "instant", block: "start" }),
        100,
      );
      return () => clearTimeout(timer);
    }
  }, [location.hash, id]);
  if (!work)
    return (
      <div className="page-width content-page">
        <h1>Esta obra não está disponível.</h1>
        <p>Ela pode ter sido retirada do acervo pela equipe.</p>
        <Link className="button primary" to="/">
          Voltar ao acervo <ArrowRight />
        </Link>
      </div>
    );
  const version =
    work.versions.find((v) => v.id === versionId) || work.versions[0];
  const related = state.works
    .filter(
      (w) =>
        w.status === "publicado" && w.id !== id && w.format === work.format,
    )
    .slice(0, 3);
  return (
    <div className="page-width content-page detail-page">
      <Link to={formats[work.format].route} className="back-link">
        <ArrowLeft size={17} />
        {formats[work.format].plural}
      </Link>
      <div className="detail-layout">
        <div className={"detail-art " + work.format}>
          <img
            src={work.image}
            alt={
              work.format === "arte"
                ? work.title + ", de " + work.author
                : "Imagem de ambientação para " + work.title
            }
          />
          {work.format === "livro" && (
            <div className="detail-book-title">
              <span>{work.author}</span>
              <h2>{work.title}</h2>
              <small>Biblioteca Selectus</small>
            </div>
          )}
          <button
            className="image-expand icon-button"
            onClick={() => setViewer(true)}
            aria-label="Ampliar ou abrir conteúdo"
          >
            <ArrowsOut size={24} />
          </button>
          <ReactionBar work={work} />
        </div>
        <div className="detail-copy">
          <span className="eyebrow">
            {formats[work.format].label} <span>·</span> {work.tags[0]}
          </span>
          <h1>{work.title}</h1>
          <p className="detail-author">{work.author}</p>
          <div className="metadata">
            <span>{work.year}</span>
            <i />
            <span>{work.duration}</span>
            {work.tags.includes("Formação católica") && (
              <Badge>Formação católica · opcional</Badge>
            )}
          </div>
          <p className="detail-description">{work.description}</p>
          {work.format === "noticia" && (
            <div className="editorial-metadata">
              <Badge>{work.editorial}</Badge>
              <span>{work.source}</span>
              <span>
                Publicado em {dateLabel(work.publishedAt)} · atualização:{" "}
                {dateLabel(work.publishedAt)}
              </span>
            </div>
          )}
          <label className="version-label">
            Versão disponível
            <select
              value={version.id}
              onChange={(e) => setVersionId(e.target.value)}
            >
              {work.versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
          <div className="detail-actions">
            <button className="button primary" onClick={() => setViewer(true)}>
              {work.format === "arte" ? <ArrowsOut /> : <Play weight="fill" />}
              {work.format === "arte"
                ? "Ampliar a obra"
                : work.body || version.media
                  ? "Abrir amostra"
                  : "Ver disponibilidade"}
            </button>
            <a className="button secondary" href="#conversa">
              <ChatCircle />
              Participar da conversa
            </a>
          </div>
          {!active && (
            <p className="membership-hint">
              Amostras abertas.{" "}
              <Link to={user ? "/assinatura" : "/entrar"}>Faça parte</Link> para
              acessar os conteúdos disponíveis e participar dos fóruns.
            </p>
          )}
          <details className="credits-details">
            <summary>Sobre esta versão e seus direitos</summary>
            <dl>
              <dt>Arquivo ou edição</dt>
              <dd>{version.label}</dd>
              <dt>Idioma</dt>
              <dd>{version.language}</dd>
              <dt>Condições de uso</dt>
              <dd>{version.rights}</dd>
              <dt>Origem</dt>
              <dd>
                {version.source.startsWith("http") ? (
                  <a href={version.source} target="_blank" rel="noreferrer">
                    {version.source}
                    <ArrowRight size={14} />
                  </a>
                ) : (
                  version.source
                )}
              </dd>
              <dt>Conferência</dt>
              <dd>
                {version.reviewer} ·{" "}
                {version.reviewed
                  ? "revisado para demonstração"
                  : "pendente para produção"}
              </dd>
              <dt>Território</dt>
              <dd>{version.territories}</dd>
              <dt>Imagem</dt>
              <dd>
                {work.imageCredit}. <Link to="/creditos">Ver créditos</Link>
              </dd>
            </dl>
          </details>
        </div>
      </div>
      {work.body && work.format !== "livro" && (
        <article className="article-body">
          <span className="eyebrow">Texto demonstrativo</span>
          {work.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="corrections">
            <strong>Histórico de correções</strong>
            {work.corrections.length ? (
              work.corrections.map((c, i) => <p key={i}>{c}</p>)
            ) : (
              <p>Nenhuma correção registrada.</p>
            )}
          </div>
        </article>
      )}
      <Forum work={work} versionId={version.id} />
      <section className="section">
        <SectionHeading
          title="O encontro continua"
          subtitle="Outras descobertas no mesmo caminho."
        />
        <div className="related-grid">
          {related.map((w) => (
            <WorkCard key={w.id} work={w} />
          ))}
        </div>
      </section>
      {viewer && (
        <Modal title={work.title} onClose={closeViewer} wide>
          <ContentViewer work={work} versionId={version.id} />
        </Modal>
      )}
    </div>
  );
}
function ContentViewer({ work, versionId }: { work: Work; versionId: string }) {
  const { state, user, active, update } = useDemo();
  const version =
    work.versions.find((v) => v.id === versionId) || work.versions[0];
  const video = useRef<HTMLVideoElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const played = useRef(false);
  const [error, setError] = useState(false);
  const [font, setFont] = useState(20);
  const saved = state.progress[interactionKey(user?.id || "", version.id)] || 0;
  const [page, setPage] = useState(
    work.format === "livro" ? Math.min(saved, (work.body?.length || 1) - 1) : 0,
  );
  function save(position: number) {
    if (active) update((s) => catalogService.progress(s, version.id, position));
  }
  useEffect(() => {
    const media = video.current || audio.current;
    return () => {
      if (media && active && played.current) {
        media.pause();
        update((s) =>
          catalogService.progress(s, version.id, media.currentTime),
        );
      }
    };
  }, [version.id, active, update]);
  if (!active)
    return (
      <div className="viewer-gate">
        <h3>Uma amostra para despertar a curiosidade.</h3>
        {work.format === "arte" ? (
          <img
            className="art-view"
            src={work.image}
            alt={work.title + ", de " + work.author}
          />
        ) : work.body ? (
          <p>{work.body[0]}</p>
        ) : (
          <img
            className="sample-image"
            src={work.image}
            alt="Imagem de ambientação"
          />
        )}
        <p>
          Assinatura ou bônus ativo libera o conteúdo disponível na
          demonstração.
        </p>
        <Link to={user ? "/assinatura" : "/entrar"} className="button primary">
          Faça parte por R$ 0,99/mês <ArrowRight />
        </Link>
      </div>
    );
  if (work.format === "arte")
    return (
      <>
        <img
          className="art-view"
          src={work.image}
          alt={
            work.title +
            ", de " +
            work.author +
            ". Use o zoom do navegador para observar os detalhes."
          }
        />
        <p className="muted">
          {work.duration} · {work.year}. {work.description}
        </p>
        <a
          className="text-link"
          href={work.image}
          target="_blank"
          rel="noreferrer"
        >
          Abrir imagem em resolução completa <ArrowsOut />
        </a>
      </>
    );
  if (work.format === "livro" && work.body)
    return (
      <>
        <div className="reader-toolbar">
          <span>Capítulo I · Do título</span>
          <div>
            <button
              className="icon-button"
              onClick={() => setFont((f) => Math.max(16, f - 2))}
              aria-label="Diminuir fonte"
            >
              A−
            </button>
            <button
              className="icon-button"
              onClick={() => setFont((f) => Math.min(32, f + 2))}
              aria-label="Aumentar fonte"
            >
              A+
            </button>
          </div>
        </div>
        <article className="reader-page" style={{ fontSize: font }}>
          <span className="eyebrow">Machado de Assis · Dom Casmurro</span>
          <p>{work.body[page]}</p>
        </article>
        <div className="reader-controls">
          <button
            className="button secondary"
            disabled={page === 0}
            onClick={() => {
              setPage(page - 1);
              save(page - 1);
            }}
          >
            <CaretLeft />
            Anterior
          </button>
          <span>
            {page + 1} / {work.body.length}
          </span>
          <button
            className="button secondary"
            disabled={page === work.body.length - 1}
            onClick={() => {
              setPage(page + 1);
              save(page + 1);
            }}
          >
            Próxima
            <CaretRight />
          </button>
        </div>
        <p className="muted">
          Amostra de leitura em quatro trechos. Posição salva neste navegador.
        </p>
      </>
    );
  if (version.media && (work.format === "filme" || work.format === "musica"))
    return (
      <div className="media-view">
        {work.format === "filme" ? (
          <video
            ref={video}
            onPlay={() => {
              played.current = true;
            }}
            controls
            playsInline
            preload="metadata"
            poster={work.image}
            onLoadedMetadata={() => {
              if (video.current)
                video.current.currentTime = Math.min(
                  saved,
                  video.current.duration || saved,
                );
            }}
            onPause={(e) => save(e.currentTarget.currentTime)}
            onEnded={(e) => save(e.currentTarget.currentTime)}
            onTimeUpdate={(e) => {
              const time = Math.floor(e.currentTarget.currentTime);
              if (time > 0 && time % 10 === 0 && Math.abs(time - saved) >= 8)
                save(time);
            }}
            onError={() => setError(true)}
          >
            <source src={version.media} type="video/mp4" />
            <track
              kind="captions"
              src="/assets/moon.vtt"
              srcLang="pt"
              label="Descrições em português"
              default
            />
          </video>
        ) : (
          <>
            <div className="audio-cover">
              <img src={work.image} alt="" />
              <div>
                <span className="eyebrow">Um momento para ouvir</span>
                <h3>{work.title}</h3>
                <p>{work.author}</p>
              </div>
            </div>
            <audio
              ref={audio}
              onPlay={() => {
                played.current = true;
              }}
              controls
              preload="metadata"
              onLoadedMetadata={() => {
                if (audio.current)
                  audio.current.currentTime = Math.min(
                    saved,
                    audio.current.duration || saved,
                  );
              }}
              onPause={(e) => save(e.currentTarget.currentTime)}
              onTimeUpdate={(e) => {
                const time = Math.floor(e.currentTarget.currentTime);
                if (time > 0 && time % 5 === 0 && Math.abs(time - saved) >= 4)
                  save(time);
              }}
              onError={() => setError(true)}
              src={version.media}
            />
          </>
        )}
        {error ? (
          <div role="alert" className="notice warning">
            Não foi possível carregar esta amostra.{" "}
            <Link to="/suporte">Fale com o suporte</Link> ou tente novamente.
          </div>
        ) : (
          <InlineNotice>
            {work.format === "filme"
              ? "Trecho de 65 segundos do filme original, sem trilha sonora adicionada. Legendas com descrições de cena."
              : "Amostra sintetizada originalmente para o Selectus a partir de composição em domínio público."}
          </InlineNotice>
        )}
      </div>
    );
  if (work.body)
    return (
      <article className="article-body in-modal">
        {work.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>
    );
  return (
    <div className="empty">
      <h3>Este arquivo está em preparação.</h3>
      <p>
        A ficha faz parte do acervo demonstrativo. A versão de produção depende
        da conferência dos direitos e do arquivo.
      </p>
      <Link
        to={
          "/obra/" +
          (work.format === "livro"
            ? "dom-casmurro"
            : work.format === "musica"
              ? "bach"
              : "viagem-lua") +
          "?abrir=1"
        }
        className="button primary"
      >
        Conhecer uma amostra funcional <ArrowRight />
      </Link>
    </div>
  );
}
function Forum({ work, versionId }: { work: Work; versionId: string }) {
  const { state, user, active, update } = useDemo();
  const [text, setText] = useState("");
  const [reply, setReply] = useState<string>();
  const [editing, setEditing] = useState<Comment>();
  const [editText, setEditText] = useState("");
  const [report, setReport] = useState<string>();
  const [reason, setReason] = useState("Desrespeito ou ofensa");
  const closeEdit = useCallback(() => setEditing(undefined), []);
  const closeReport = useCallback(() => setReport(undefined), []);
  const blocked = state.blocked[user?.id || ""] || [];
  const comments = state.comments.filter(
    (c) => c.workId === work.id && !blocked.includes(c.userId),
  );
  function renderComment(c: Comment, nested = false) {
    const author = state.users.find((u) => u.id === c.userId);
    return (
      <div className={"comment " + (nested ? "nested" : "")} key={c.id}>
        <span className="avatar comment-avatar">
          {(author?.name || "Conta excluída")
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </span>
        <div className="comment-content">
          <div className="comment-heading">
            <strong>{author?.name || "Conta excluída"}</strong>
            <span>
              {dateLabel(c.date)}
              {c.edited ? " · editado" : ""}
            </span>
          </div>
          <p>{c.removed ? "Comentário removido." : c.text}</p>
          {!c.removed && (
            <div className="comment-actions">
              {active && !nested && (
                <button
                  onClick={() => {
                    setReply(c.id);
                    document.getElementById("comment-text")?.focus();
                  }}
                >
                  Responder
                </button>
              )}
              {user?.id === c.userId ? (
                <>
                  <button
                    onClick={() => {
                      setEditing(c);
                      setEditText(c.text);
                    }}
                  >
                    <PencilSimple />
                    Editar
                  </button>
                  <button
                    onClick={() =>
                      update(
                        (s) => communityService.remove(s, c.id),
                        "Comentário excluído.",
                      )
                    }
                  >
                    <Trash />
                    Excluir
                  </button>
                </>
              ) : (
                user && (
                  <>
                    <button onClick={() => setReport(c.id)}>
                      <Flag />
                      Denunciar
                    </button>
                    <button
                      onClick={() =>
                        update(
                          (s) => communityService.block(s, c.userId),
                          "Pessoa bloqueada. Gerencie bloqueios no seu perfil.",
                        )
                      }
                    >
                      <Prohibit />
                      Bloquear
                    </button>
                  </>
                )
              )}
            </div>
          )}
          {!nested &&
            comments
              .filter((child) => child.parentId === c.id)
              .map((child) => renderComment(child, true))}
        </div>
      </div>
    );
  }
  return (
    <section id="conversa" className="forum-section">
      <SectionHeading
        title="A conversa começa aqui."
        subtitle={"Um fórum para todas as versões de " + work.title + "."}
      />
      <div className="forum-content">
        <div className="forum-comments">
          {comments.filter((c) => !c.parentId).map((c) => renderComment(c))}
          {comments.length === 0 && (
            <p className="muted">
              Esta conversa ainda está esperando seu primeiro olhar.
            </p>
          )}
        </div>
        <div className="comment-compose">
          {active ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  update(
                    (s) =>
                      communityService.comment(
                        s,
                        work.id,
                        text,
                        reply,
                        versionId,
                      ),
                    "Seu comentário foi publicado.",
                  )
                ) {
                  setText("");
                  setReply(undefined);
                }
              }}
            >
              <label htmlFor="comment-text">
                {reply ? "Sua resposta" : "Qual foi o seu olhar?"}
              </label>
              {reply && (
                <button
                  className="text-link"
                  type="button"
                  onClick={() => setReply(undefined)}
                >
                  Cancelar resposta
                </button>
              )}
              <textarea
                id="comment-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                maxLength={3000}
                placeholder="Compartilhe uma ideia, uma pergunta, uma descoberta…"
              />
              <div>
                <small>Respeito também é uma forma de cuidado.</small>
                <button className="button primary" type="submit">
                  Publicar <ArrowRight />
                </button>
              </div>
            </form>
          ) : (
            <InlineNotice>
              <strong>Leia, descubra e faça parte.</strong>
              <p>
                Todos podem acompanhar. Uma assinatura ou bônus ativo permite
                comentar.
              </p>
              <Link className="text-link" to={user ? "/assinatura" : "/entrar"}>
                Participar da comunidade <ArrowRight />
              </Link>
            </InlineNotice>
          )}
        </div>
      </div>
      {editing && (
        <Modal title="Editar comentário" onClose={closeEdit}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                update(
                  (s) => communityService.edit(s, editing.id, editText),
                  "Comentário atualizado.",
                )
              )
                closeEdit();
            }}
          >
            <label>
              Comentário
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                required
                maxLength={3000}
              />
            </label>
            <button className="button primary" type="submit">
              Salvar alteração
            </button>
          </form>
        </Modal>
      )}
      {report && (
        <Modal title="Denunciar comentário" onClose={closeReport}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                update(
                  (s) => communityService.report(s, report, reason),
                  "Denúncia enviada à equipe de moderação.",
                )
              )
                closeReport();
            }}
          >
            <p>A equipe vai analisar o comentário e registrar a decisão.</p>
            <label>
              Motivo
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option>Desrespeito ou ofensa</option>
                <option>Spam ou publicidade</option>
                <option>Conteúdo inadequado</option>
                <option>Outro motivo</option>
              </select>
            </label>
            <button className="button primary" type="submit">
              Enviar denúncia
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
