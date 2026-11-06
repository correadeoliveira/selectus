import { useCallback, useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import {
  Books,
  ChartBar,
  Checks,
  Clock,
  CreditCard,
  FileText,
  GearSix,
  ShieldCheck,
  UsersThree,
} from "@phosphor-icons/react";
import {
  ArrowRight,
  ArrowUpRight,
  Badge,
  Check,
  InlineNotice,
  Modal,
  PageHeading,
  Plus,
  dateLabel,
} from "../components";
import { formats } from "../data";
import {
  accountService,
  adminService,
  billingService,
  log,
  uid,
} from "../services";
import { useDemo } from "../store";
import type { Format, Role, Work } from "../types";

const modules = [
  ["", "Visão geral", ChartBar],
  ["conteudo", "Catálogo e editorial", Books],
  ["contas", "Contas e permissões", UsersThree],
  ["moderacao", "Moderação", ShieldCheck],
  ["financeiro", "Financeiro", CreditCard],
  ["convites", "Indicações", Checks],
  ["operacao", "Operação", GearSix],
] as const;
export function Admin() {
  const { module = "" } = useParams();
  const { state, user, update } = useDemo();
  if (!user || user.role === "membro")
    return (
      <div className="page-width content-page">
        <PageHeading
          title="O espaço da equipe"
          description="Este painel exige um perfil de editor, moderador ou administrador."
        />
        <Link className="button primary" to="/perfil?demo=1">
          Escolher o cenário Equipe <ArrowRight />
        </Link>
      </div>
    );
  const allowed =
    user.role === "administrador"
      ? modules
      : modules.filter(
          (m) =>
            m[0] === "" ||
            m[0] === "operacao" ||
            (user.role === "editor" && m[0] === "conteudo") ||
            (user.role === "moderador" && m[0] === "moderacao"),
        );
  if (!allowed.some((m) => m[0] === module))
    return (
      <div className="page-width content-page">
        <h1>Você não tem permissão para este módulo.</h1>
        <Link to="/admin" className="button secondary">
          Voltar ao painel
        </Link>
      </div>
    );
  return (
    <div className="admin-layout page-width">
      <aside className="admin-sidebar">
        <span className="eyebrow">Espaço da equipe</span>
        <div className="admin-identity">
          <ShieldCheck size={24} />
          <span>
            Selectus <small>Administração</small>
          </span>
        </div>
        <nav aria-label="Painel administrativo">
          {allowed.map(([path, label, Icon]) => (
            <NavLink key={path} end to={"/admin" + (path ? "/" + path : "")}>
              <Icon size={20} />
              {label}
              {path === "moderacao" &&
                state.reports.some((r) => r.status === "aberta") && (
                  <span className="count-dot">
                    {state.reports.filter((r) => r.status === "aberta").length}
                  </span>
                )}
            </NavLink>
          ))}
        </nav>
        <p>
          Ambiente demonstrativo
          <br />
          Alterações salvas neste navegador
        </p>
        <Link to="/perfil" className="text-link">
          Trocar cenário <ArrowUpRight />
        </Link>
      </aside>
      <div className="admin-content">
        {module === "conteudo" ? (
          <ContentAdmin />
        ) : module === "contas" ? (
          <UsersAdmin />
        ) : module === "moderacao" ? (
          <ModerationAdmin />
        ) : module === "financeiro" ? (
          <FinanceAdmin />
        ) : module === "convites" ? (
          <ReferralsAdmin />
        ) : module === "operacao" ? (
          <OperationsAdmin />
        ) : (
          <AdminOverview />
        )}
      </div>
    </div>
  );
}
function AdminOverview() {
  const { state } = useDemo();
  const counts = [
    [
      "Conteúdos publicados",
      state.works.filter((w) => w.status === "publicado").length,
      "/admin/conteudo",
    ],
    [
      "Em revisão",
      state.works.filter((w) => w.status === "revisao").length,
      "/admin/conteudo",
    ],
    [
      "Denúncias abertas",
      state.reports.filter((r) => r.status === "aberta").length,
      "/admin/moderacao",
    ],
    ["Contas demonstrativas", state.users.length, "/admin/contas"],
  ];
  return (
    <>
      <PageHeading
        eyebrow="Cuidado em cada detalhe"
        title="Visão geral"
        description="O que está acontecendo no seu Selectus."
      />
      <div className="admin-stats">
        {counts.map(([label, value, to]) => (
          <Link key={label as string} to={to as string}>
            <span>{label}</span>
            <strong>{value}</strong>
            <ArrowUpRight size={18} />
          </Link>
        ))}
      </div>
      <div className="admin-overview-grid">
        <section className="panel">
          <h2>Atividade recente</h2>
          <AuditList limit={7} />
        </section>
        <section className="panel">
          <h2>Próximos cuidados</h2>
          <p className="muted">
            {
              state.works.filter((w) => !w.versions.every((v) => v.reviewed))
                .length
            }{" "}
            fichas aguardam conferência de arquivos e direitos para produção.
          </p>
          <Link className="button secondary" to="/admin/conteudo">
            Revisar catálogo <ArrowRight />
          </Link>
          <p className="muted">
            Nenhuma cobrança ou concessão deste ambiente é real.
          </p>
          <Link className="text-link" to="/admin/operacao">
            Ver solicitações de suporte <ArrowRight />
          </Link>
        </section>
      </div>
    </>
  );
}
function ContentAdmin() {
  const { state, update } = useDemo();
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [edit, setEdit] = useState<Work>();
  const close = useCallback(() => setEdit(undefined), []);
  const works = state.works.filter(
    (w) =>
      (filter === "todos" || w.status === filter) &&
      (w.title + w.author).toLowerCase().includes(search.toLowerCase()),
  );
  function newWork() {
    const id = uid();
    setEdit({
      id,
      title: "",
      author: "",
      format: "artigo",
      year: String(new Date().getFullYear()),
      duration: "4 min de leitura",
      description: "",
      image: "/assets/hero.jpg",
      imageCredit: "Imagem de ambientação · créditos do protótipo",
      tags: ["Cultura"],
      publishedAt: new Date().toISOString(),
      status: "rascunho",
      featured: false,
      versions: [
        {
          id: id + "-v1",
          label: "Versão demonstrativa",
          language: "pt-BR",
          source: "",
          rights: "",
          evidence: "",
          territories: "Brasil",
          reviewer: "",
          reviewed: false,
        },
      ],
      body: [],
      corrections: [],
    });
  }
  return (
    <>
      <PageHeading
        title="Catálogo e editorial"
        description="Da primeira ficha ao encontro com o público."
      >
        <button className="button primary" onClick={newWork}>
          <Plus />
          Novo conteúdo
        </button>
      </PageHeading>
      <div className="catalog-toolbar">
        <input
          className="plain-search"
          aria-label="Buscar conteúdos no painel"
          placeholder="Buscar título ou autoria"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Situação editorial"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="todos">Todas as situações</option>
          <option value="rascunho">Rascunho</option>
          <option value="revisao">Em revisão</option>
          <option value="publicado">Publicado</option>
          <option value="retirado">Retirado</option>
        </select>
      </div>
      <div className="table-scroll">
        <table className="content-table">
          <thead>
            <tr>
              <th>Conteúdo</th>
              <th>Formato</th>
              <th>Direitos</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {works.map((w) => (
              <tr key={w.id}>
                <td>
                  <div className="table-work">
                    <img src={w.image} alt="" />
                    <div>
                      <strong>{w.title}</strong>
                      <small>{w.author}</small>
                    </div>
                  </div>
                </td>
                <td>{formats[w.format].label}</td>
                <td>
                  <Badge good={w.versions.every((v) => v.reviewed)}>
                    {w.versions.every((v) => v.reviewed)
                      ? "Revisados"
                      : "Pendentes"}
                  </Badge>
                </td>
                <td>
                  <Badge good={w.status === "publicado"}>
                    {w.status === "revisao" ? "Em revisão" : w.status}
                  </Badge>
                </td>
                <td>
                  <div className="table-actions">
                    <button onClick={() => setEdit(structuredClone(w))}>
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        update(
                          (s) =>
                            adminService.status(
                              s,
                              w.id,
                              w.status === "publicado"
                                ? "retirado"
                                : "publicado",
                            ),
                          w.status === "publicado"
                            ? "Conteúdo retirado do acervo."
                            : "Conteúdo publicado.",
                        )
                      }
                    >
                      {w.status === "publicado" ? "Retirar" : "Publicar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!works.length && (
          <p className="table-empty">Nenhum conteúdo nesta seleção.</p>
        )}
      </div>
      {edit && (
        <Modal title={edit.title || "Novo conteúdo"} onClose={close} wide>
          <WorkEditor initial={edit} onDone={close} />
        </Modal>
      )}
    </>
  );
}
function WorkEditor({
  initial,
  onDone,
}: {
  initial: Work;
  onDone: () => void;
}) {
  const { update } = useDemo();
  const [work, setWork] = useState(initial);
  const [versionIndex, setVersionIndex] = useState(0);
  const version = work.versions[versionIndex];
  function change<K extends keyof Work>(key: K, value: Work[K]) {
    setWork((w) => ({ ...w, [key]: value }));
  }
  function vchange(key: string, value: string | boolean) {
    setWork((w) => ({
      ...w,
      versions: w.versions.map((v, i) =>
        i === versionIndex ? { ...v, [key]: value } : v,
      ),
    }));
  }
  return (
    <form
      className="editor-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (update((s) => adminService.save(s, work), "Conteúdo salvo."))
          onDone();
      }}
    >
      <div className="form-grid">
        <label>
          Título
          <input
            value={work.title}
            onChange={(e) => change("title", e.target.value)}
            required
            maxLength={140}
          />
        </label>
        <label>
          Autoria / direção / artista
          <input
            value={work.author}
            onChange={(e) => change("author", e.target.value)}
            required
          />
        </label>
        <label>
          Formato
          <select
            value={work.format}
            onChange={(e) => change("format", e.target.value as Format)}
          >
            {Object.entries(formats).map(([key, f]) => (
              <option key={key} value={key}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Situação
          <select
            value={work.status}
            onChange={(e) => change("status", e.target.value as Work["status"])}
          >
            <option value="rascunho">Rascunho</option>
            <option value="revisao">Em revisão</option>
            <option value="publicado">Publicado</option>
            <option value="retirado">Retirado</option>
          </select>
        </label>
        <label>
          Ano / época
          <input
            value={work.year}
            onChange={(e) => change("year", e.target.value)}
          />
        </label>
        <label>
          Duração / técnica / extensão
          <input
            value={work.duration}
            onChange={(e) => change("duration", e.target.value)}
          />
        </label>
      </div>
      <label>
        Apresentação
        <textarea
          value={work.description}
          onChange={(e) => change("description", e.target.value)}
          required
        />
      </label>
      <div className="form-grid">
        <label>
          Imagem (caminho local ou HTTPS)
          <input
            value={work.image}
            onChange={(e) => change("image", e.target.value)}
            required
            pattern="(/[^ ].*|https://[^ ].*)"
          />
        </label>
        <label>
          Créditos da imagem
          <input
            value={work.imageCredit}
            onChange={(e) => change("imageCredit", e.target.value)}
            required
          />
        </label>
        <label>
          Temas separados por vírgula
          <input
            value={work.tags.join(", ")}
            onChange={(e) =>
              change(
                "tags",
                e.target.value.split(",").map((x) => x.trim()),
              )
            }
          />
        </label>
        <label>
          Data de publicação
          <input
            type="date"
            value={work.publishedAt.slice(0, 10)}
            onChange={(e) => {
              const date = new Date(e.target.value + "T12:00:00Z");
              if (Number.isFinite(date.getTime()))
                change("publishedAt", date.toISOString());
            }}
            required
          />
        </label>
      </div>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={work.featured}
          onChange={(e) => change("featured", e.target.checked)}
        />
        Destaque editorial
      </label>
      {(work.format === "artigo" ||
        work.format === "livro" ||
        work.format === "noticia") && (
        <label>
          Texto (parágrafos separados por linha em branco)
          <textarea
            rows={6}
            value={work.body?.join("\n\n") || ""}
            onChange={(e) => change("body", e.target.value.split("\n\n"))}
          />
        </label>
      )}
      {work.format === "noticia" && (
        <div className="form-grid">
          <label>
            Fonte
            <input
              value={work.source || ""}
              onChange={(e) => change("source", e.target.value)}
              required
            />
          </label>
          <label>
            Natureza editorial
            <select
              value={work.editorial || "Notícia"}
              onChange={(e) =>
                change("editorial", e.target.value as Work["editorial"])
              }
            >
              <option>Notícia</option>
              <option>Análise</option>
              <option>Opinião</option>
            </select>
          </label>
          <label>
            Categoria
            <input
              value={work.category || "Cultura"}
              onChange={(e) => change("category", e.target.value)}
            />
          </label>
          <label>
            Registro de correções
            <textarea
              value={work.corrections.join("\n")}
              onChange={(e) =>
                change(
                  "corrections",
                  e.target.value.split("\n").filter(Boolean),
                )
              }
            />
          </label>
        </div>
      )}
      <h3>Versões, arquivos e direitos</h3>
      <div className="list-row">
        <select
          aria-label="Editar versão"
          value={versionIndex}
          onChange={(e) => setVersionIndex(Number(e.target.value))}
        >
          {work.versions.map((v, i) => (
            <option value={i} key={v.id}>
              {v.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="button secondary"
          onClick={() => {
            setWork((w) => ({
              ...w,
              versions: [
                ...w.versions,
                {
                  ...w.versions[0],
                  id: uid(),
                  label: "Nova versão",
                  media: undefined,
                  source: "",
                  evidence: "",
                  reviewer: "",
                  reviewed: false,
                },
              ],
            }));
            setVersionIndex(work.versions.length);
          }}
        >
          <Plus />
          Adicionar versão
        </button>
      </div>
      <div className="form-grid">
        <label>
          Identificação da edição ou gravação
          <input
            value={version.label}
            onChange={(e) => vchange("label", e.target.value)}
            required
          />
        </label>
        <label>
          Idioma
          <input
            value={version.language}
            onChange={(e) => vchange("language", e.target.value)}
          />
        </label>
        <label>
          Origem / URL da fonte
          <input
            value={version.source}
            onChange={(e) => vchange("source", e.target.value)}
          />
        </label>
        <label>
          Arquivo de mídia (local ou HTTPS)
          <input
            value={version.media || ""}
            onChange={(e) => vchange("media", e.target.value)}
            pattern="(/[^ ].*|https://[^ ].*)"
          />
        </label>
        <label>
          Evidência de direitos
          <input
            value={version.evidence}
            onChange={(e) => vchange("evidence", e.target.value)}
          />
        </label>
        <label>
          Responsável pela conferência
          <input
            value={version.reviewer}
            onChange={(e) => vchange("reviewer", e.target.value)}
          />
        </label>
        <label>
          Territórios
          <input
            value={version.territories}
            onChange={(e) => vchange("territories", e.target.value)}
          />
        </label>
        <label>
          Condições de uso
          <textarea
            value={version.rights}
            onChange={(e) => vchange("rights", e.target.value)}
          />
        </label>
      </div>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={version.reviewed}
          onChange={(e) => vchange("reviewed", e.target.checked)}
        />
        Conferência concluída para esta versão
      </label>
      <InlineNotice>
        A publicação exige fonte, evidência e responsável em todas as versões.
        Para produção, a análise dos direitos precisa ser refeita pela equipe
        responsável.
      </InlineNotice>
      <div className="form-actions">
        <button className="button secondary" type="button" onClick={onDone}>
          Cancelar
        </button>
        <button className="button primary" type="submit">
          Salvar conteúdo <Check />
        </button>
      </div>
    </form>
  );
}
function UsersAdmin() {
  const { state, update, user } = useDemo();
  return (
    <>
      <PageHeading
        title="Contas e permissões"
        description="Papéis diferentes para responsabilidades diferentes."
      />
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Pessoa</th>
              <th>Papel</th>
              <th>Acesso</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            {state.users.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong>{u.name}</strong>
                  <small className="table-sub">{u.contact}</small>
                </td>
                <td>
                  <select
                    disabled={u.id === user?.id}
                    aria-label={"Papel de " + u.name}
                    value={u.role}
                    onChange={(e) =>
                      update(
                        (s) =>
                          adminService.user(s, u.id, {
                            role: e.target.value as Role,
                          }),
                        "Papel atualizado.",
                      )
                    }
                  >
                    <option value="membro">Membro</option>
                    <option value="editor">Editor</option>
                    <option value="moderador">Moderador</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </td>
                <td>
                  <Badge good={accountService.active(state, u.id)}>
                    {accountService.active(state, u.id)
                      ? "Ativo"
                      : "Sem acesso"}
                  </Badge>
                </td>
                <td>
                  <button
                    disabled={u.id === user?.id}
                    className="text-link"
                    onClick={() =>
                      update(
                        (s) =>
                          adminService.user(s, u.id, {
                            suspended: !u.suspended,
                          }),
                        u.suspended
                          ? "Conta reativada."
                          : "Conta suspensa na demonstração.",
                      )
                    }
                  >
                    {u.suspended ? "Reativar" : "Suspender"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function ModerationAdmin() {
  const { state, update } = useDemo();
  return (
    <>
      <PageHeading
        title="Moderação"
        description="Escutar, avaliar e registrar cada decisão."
      />
      <div className="admin-stats two-stats">
        <div>
          <span>Denúncias abertas</span>
          <strong>
            {state.reports.filter((r) => r.status === "aberta").length}
          </strong>
        </div>
        <div>
          <span>Decisões registradas</span>
          <strong>
            {state.reports.filter((r) => r.status !== "aberta").length}
          </strong>
        </div>
      </div>
      {state.reports.length ? (
        state.reports.map((r) => {
          const comment = state.comments.find((c) => c.id === r.commentId);
          return (
            <article className="panel moderation-card" key={r.id}>
              <div className="list-row">
                <Badge good={r.status !== "aberta"}>{r.status}</Badge>
                <span className="muted">{r.reason}</span>
              </div>
              <h3>
                {state.works.find((w) => w.id === comment?.workId)?.title}
              </h3>
              <blockquote>
                {comment?.text || "Comentário indisponível"}
              </blockquote>
              <p className="muted">
                Autor:{" "}
                {state.users.find((u) => u.id === comment?.userId)?.name ||
                  "Conta excluída"}
              </p>
              {r.status === "aberta" && (
                <div className="form-actions">
                  <button
                    className="button secondary"
                    onClick={() =>
                      update(
                        (s) => adminService.moderate(s, r.id, "mantido"),
                        "Comentário mantido. Decisão registrada.",
                      )
                    }
                  >
                    Manter comentário
                  </button>
                  <button
                    className="button primary"
                    onClick={() =>
                      update(
                        (s) => adminService.moderate(s, r.id, "removido"),
                        "Comentário removido. Decisão registrada.",
                      )
                    }
                  >
                    Remover comentário
                  </button>
                </div>
              )}
            </article>
          );
        })
      ) : (
        <div className="empty">
          <ShieldCheck size={42} weight="thin" />
          <h2>Nenhuma denúncia na fila.</h2>
          <p>
            As denúncias feitas nos fóruns aparecem aqui, com o comentário e o
            motivo informado.
          </p>
          <Link className="button secondary" to="/comunidade">
            Explorar as conversas <ArrowRight />
          </Link>
        </div>
      )}
    </>
  );
}
function FinanceAdmin() {
  const { state, update } = useDemo();
  const confirmed = state.payments.filter((p) => p.status === "confirmado");
  return (
    <>
      <PageHeading
        title="Financeiro"
        description="Cobranças e acesso com uma trilha de conferência."
      />
      <InlineNotice>
        Valores e pagamentos simulados. Não há conexão com gateway, banco ou
        lojas.
      </InlineNotice>
      <div className="admin-stats">
        <div>
          <span>Recebimentos simulados</span>
          <strong>
            {(
              confirmed.reduce((sum, p) => sum + p.amount, 0) / 100
            ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </strong>
        </div>
        <div>
          <span>Pagamentos confirmados</span>
          <strong>{confirmed.length}</strong>
        </div>
        <div>
          <span>Taxa do provedor</span>
          <strong>—</strong>
          <small>Integração futura</small>
        </div>
        <div>
          <span>Períodos concedidos</span>
          <strong>{state.grants.length}</strong>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Conta / referência</th>
              <th>Valor</th>
              <th>Data</th>
              <th>Situação</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {state.payments.map((p) => (
              <tr key={p.id}>
                <td>
                  {state.users.find((u) => u.id === p.userId)?.name ||
                    "Conta excluída"}
                  <small className="table-sub">{p.id.slice(0, 12)}</small>
                </td>
                <td>R$ 0,99</td>
                <td>{dateLabel(p.createdAt)}</td>
                <td>
                  <Badge good={p.status === "confirmado"}>
                    {p.status === "pendente" &&
                    new Date(p.expiresAt) <= new Date()
                      ? "vencido"
                      : p.status}
                  </Badge>
                </td>
                <td>
                  {p.status === "pendente" &&
                  new Date(p.expiresAt) > new Date() ? (
                    <button
                      className="text-link"
                      onClick={() =>
                        update(
                          (s) => billingService.confirm(s, p.id),
                          "Pagamento confirmado na demonstração.",
                        )
                      }
                    >
                      Simular confirmação
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="section-title">Histórico de concessões</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Conta</th>
              <th>Origem</th>
              <th>Início</th>
              <th>Fim</th>
            </tr>
          </thead>
          <tbody>
            {state.grants.map((g) => (
              <tr key={g.id}>
                <td>
                  {state.users.find((u) => u.id === g.userId)?.name ||
                    "Conta demonstrativa"}
                </td>
                <td>
                  {g.origin === "bonus"
                    ? "Bônus · 30 dias"
                    : "Assinatura mensal"}
                </td>
                <td>{dateLabel(g.start)}</td>
                <td>{dateLabel(g.end)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function ReferralsAdmin() {
  const { state } = useDemo();
  return (
    <>
      <PageHeading
        title="Indicações"
        description="Um convidado, um indicador e duas concessões por qualificação."
      />
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Convidado</th>
              <th>Cadastro</th>
              <th>App</th>
              <th>Benefícios</th>
            </tr>
          </thead>
          <tbody>
            {state.referrals.map((r) => (
              <tr key={r.id}>
                <td>
                  {state.users.find((u) => u.id === r.inviterId)?.name ||
                    "Conta excluída"}
                </td>
                <td>{r.name}</td>
                <td>{r.registered ? "Concluído" : "Pendente"}</td>
                <td>{r.opened ? "Confirmado" : "Pendente"}</td>
                <td>
                  <Badge good={r.granted}>
                    {r.granted ? "2 × 30 dias" : "Aguardando"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="section-title">Auditoria das indicações</h2>
      <div className="panel">
        <AuditList filter="Indicação" />
      </div>
    </>
  );
}
function OperationsAdmin() {
  const { state, notify } = useDemo();
  function download() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "selectus-demonstracao.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Exportação demonstrativa preparada.");
  }
  return (
    <>
      <PageHeading
        title="Operação"
        description="Cuidar da experiência também acontece por aqui."
      >
        <button className="button secondary" onClick={download}>
          Exportar demonstração <ArrowUpRight />
        </button>
      </PageHeading>
      <div className="admin-stats">
        <div>
          <span>Solicitações locais</span>
          <strong>{state.support.length}</strong>
        </div>
        <div>
          <span>Eventos registrados</span>
          <strong>{state.audit.length}</strong>
        </div>
        <div>
          <span>Infraestrutura</span>
          <strong>Local</strong>
        </div>
        <div>
          <span>Backup de produção</span>
          <strong>—</strong>
          <small>Backend futuro</small>
        </div>
      </div>
      <section className="panel">
        <h2>Solicitações de suporte</h2>
        {state.support.length ? (
          state.support.map((t) => (
            <div className="support-item" key={t.id}>
              <strong>
                {state.users.find((u) => u.id === t.userId)?.name ||
                  "Visitante"}
              </strong>
              <small>{dateLabel(t.date)}</small>
              <p>{t.text}</p>
            </div>
          ))
        ) : (
          <p className="muted">
            Nenhuma solicitação registrada neste navegador.
          </p>
        )}
      </section>
      <h2 className="section-title">Histórico das operações</h2>
      <div className="panel">
        <AuditList limit={50} />
      </div>
      <InlineNotice>
        Monitoramento, alertas e restauração de backup de produção dependem do
        backend. A exportação contém apenas o estado desta demonstração.
      </InlineNotice>
    </>
  );
}
function AuditList({
  limit = 20,
  filter = "",
}: {
  limit?: number;
  filter?: string;
}) {
  const { state } = useDemo();
  const audit = state.audit
    .filter((a) => a.action.includes(filter))
    .slice(0, limit);
  return (
    <div className="audit-list">
      {audit.length ? (
        audit.map((a) => (
          <div key={a.id}>
            <Clock size={17} />
            <div>
              <p>{a.action}</p>
              <small>
                {a.actor} · {dateLabel(a.date)}
              </small>
            </div>
          </div>
        ))
      ) : (
        <p className="muted">Nenhum evento registrado.</p>
      )}
    </div>
  );
}
