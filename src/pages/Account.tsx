import { useCallback, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowCounterClockwise,
  CheckCircle,
  Copy,
  DeviceMobile,
  EnvelopeSimple,
  Gift,
  Globe,
  LockSimple,
  ShieldCheck,
  SignOut,
  UserCircle,
  UsersThree,
  Warning,
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
  Sparkle,
  dateLabel,
} from "../components";
import {
  accountService,
  billingService,
  interactionKey,
  log,
  referralService,
  uid,
} from "../services";
import { useDemo } from "../store";
import type { Scenario } from "../types";
import { platform } from "../platform";

const scenarios: { id: Scenario; title: string; description: string }[] = [
  {
    id: "visitante",
    title: "Visitante",
    description: "Catálogo, amostras e leitura dos fóruns.",
  },
  {
    id: "gratuito",
    title: "Conta gratuita",
    description: "Curtidas, reações e coleção pessoal.",
  },
  {
    id: "pagante",
    title: "Membro pagante",
    description: "Conteúdos disponíveis e participação.",
  },
  {
    id: "bonificado",
    title: "Membro bonificado",
    description: "Mesmos recursos, acesso por bônus.",
  },
  {
    id: "vencido",
    title: "Acesso vencido",
    description: "Conta e histórico preservados.",
  },
  {
    id: "equipe",
    title: "Equipe Selectus",
    description: "Administração local demonstrativa.",
  },
];
export function Profile() {
  const { state, user, active, update, reset, notify } = useDemo();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [contact, setContact] = useState(user?.contact || "");
  const [deleting, setDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [restoring, setRestoring] = useState(false);
  const closeDelete = useCallback(() => setDeleting(false), []);
  const closeRestore = useCallback(() => setRestoring(false), []);
  return (
    <div className="page-width content-page account-page">
      <PageHeading
        eyebrow="Seu espaço no Selectus"
        title={user ? "Meu perfil" : "Conheça a experiência"}
        description="Suas preferências, seus encontros, seu tempo."
      />
      {user ? (
        <>
          <div className="profile-summary">
            <span className="avatar large-avatar">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div>
              <h2>{user.name}</h2>
              <p>{user.contact}</p>
              <Badge good={active}>
                {active
                  ? "Acesso ativo até " +
                    dateLabel(accountService.end(state, user.id))
                  : user.suspended
                    ? "Conta suspensa"
                    : "Conta sem acesso ativo"}
              </Badge>
            </div>
            <button
              className="button secondary"
              onClick={() => {
                update(
                  (s) => accountService.scenario(s, "visitante"),
                  "Você saiu da demonstração.",
                );
                navigate("/");
              }}
            >
              <SignOut />
              Sair
            </button>
          </div>
          <div className="account-links">
            {[
              [
                Gift,
                "Minha assinatura",
                "/assinatura",
                "Acesso, pagamentos e benefícios",
              ],
              [
                UsersThree,
                "Meus convites",
                "/convites",
                "Compartilhe boas descobertas",
              ],
              [
                EnvelopeSimple,
                "Suporte",
                "/suporte",
                "Estamos por aqui para ajudar",
              ],
            ].map(([Icon, title, to, desc]) => {
              const C = Icon as typeof Gift;
              return (
                <Link key={title as string} to={to as string}>
                  <C size={24} />
                  <div>
                    <strong>{title as string}</strong>
                    <small>{desc as string}</small>
                  </div>
                  <ArrowUpRight />
                </Link>
              );
            })}
          </div>
          <div className="settings-row">
            <div>
              <h2>Um pouco sobre você</h2>
              <p>Como você aparece nas conversas da comunidade.</p>
            </div>
            <form
              className="panel"
              onSubmit={(e) => {
                e.preventDefault();
                update((s) => {
                  const u = s.users.find((u) => u.id === user.id)!;
                  if (
                    s.users.some(
                      (other) =>
                        other.id !== u.id &&
                        other.contact.toLowerCase() === contact.toLowerCase(),
                    )
                  )
                    throw new Error(
                      "Este contato já pertence a uma conta demonstrativa.",
                    );
                  u.name = name.trim();
                  u.contact = contact.trim().toLowerCase();
                }, "Seu perfil foi atualizado.");
              }}
            >
              <label>
                Nome de exibição
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={80}
                />
              </label>
              <label>
                E-mail demonstrativo
                <input
                  type="email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                />
              </label>
              <p className="muted">
                Use dados fictícios. Não há envio de e-mail ou confirmação de
                identidade nesta etapa.
              </p>
              <button className="button primary" type="submit">
                Salvar alterações <Check />
              </button>
            </form>
          </div>
          <div className="settings-row">
            <div>
              <h2>Suas preferências</h2>
              <p>Escolha como deseja explorar o acervo.</p>
            </div>
            <div className="panel">
              <label className="toggle-row">
                <div>
                  <strong>Formação católica</strong>
                  <p>
                    Incluir seleções identificadas de doutrina, liturgia e arte
                    sacra.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={user.formation}
                  onChange={(e) =>
                    update((s) => {
                      s.users.find((u) => u.id === user.id)!.formation =
                        e.target.checked;
                    }, "Preferência salva.")
                  }
                />
              </label>
              <p className="muted">
                A participação é aberta. Nenhuma declaração religiosa é
                solicitada.
              </p>
            </div>
          </div>
          <div className="settings-row">
            <div>
              <h2>Privacidade e bloqueios</h2>
              <p>Sua coleção é privada. Você controla suas conexões.</p>
            </div>
            <div className="panel">
              {(state.blocked[user.id] || []).length ? (
                (state.blocked[user.id] || []).map((id) => (
                  <div className="list-row" key={id}>
                    <span>
                      {state.users.find((u) => u.id === id)?.name ||
                        "Conta excluída"}
                    </span>
                    <button
                      className="text-link"
                      onClick={() =>
                        update((s) => {
                          s.blocked[user.id] = s.blocked[user.id].filter(
                            (x) => x !== id,
                          );
                        }, "Pessoa desbloqueada.")
                      }
                    >
                      Desbloquear
                    </button>
                  </div>
                ))
              ) : (
                <p className="muted">Você não tem pessoas bloqueadas.</p>
              )}
              <button
                className="text-link danger"
                onClick={() => setDeleting(true)}
              >
                Solicitar exclusão da conta
              </button>
            </div>
          </div>
        </>
      ) : (
        <InlineNotice>
          Você está explorando como visitante.{" "}
          <Link to="/entrar">Entre na demonstração</Link> ou escolha um cenário
          abaixo.
        </InlineNotice>
      )}
      <section className="demo-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Conheça todos os caminhos</span>
            <h2>Cenários da demonstração</h2>
            <p>
              Troque o perfil para experimentar permissões e estados. Os dados
              ficam neste navegador.
            </p>
          </div>
          <Sparkle size={30} />
        </div>
        <div className="scenario-grid">
          {scenarios.map((item) => (
            <button
              key={item.id}
              className={
                "scenario-card " +
                (state.scenario === item.id ? "selected" : "")
              }
              aria-pressed={state.scenario === item.id}
              onClick={() => {
                update(
                  (s) => accountService.scenario(s, item.id),
                  "Cenário: " + item.title,
                );
                setName(
                  item.id === "equipe" ? "Equipe Selectus" : "Mariana Oliveira",
                );
                setContact(item.id + "@exemplo.test");
                if (item.id === "equipe") navigate("/admin");
              }}
            >
              <span>
                {item.title}
                {state.scenario === item.id && <CheckCircle weight="fill" />}
              </span>
              <small>{item.description}</small>
            </button>
          ))}
        </div>
        <button className="text-link" onClick={() => setRestoring(true)}>
          <ArrowCounterClockwise size={18} />
          Restaurar dados demonstrativos
        </button>
      </section>
      {deleting && (
        <Modal title="Excluir conta demonstrativa" onClose={closeDelete}>
          <p>
            Esta ação remove os dados locais desta conta, incluindo interações,
            progresso e solicitações. O conteúdo dos comentários será removido.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (confirmation !== "EXCLUIR") return;
              update((s) => {
                const id = user!.id;
                s.users = s.users.filter((u) => u.id !== id);
                s.interactions = Object.fromEntries(
                  Object.entries(s.interactions).filter(
                    ([k]) => !k.startsWith(id + ":"),
                  ),
                );
                s.progress = Object.fromEntries(
                  Object.entries(s.progress).filter(
                    ([k]) => !k.startsWith(id + ":"),
                  ),
                );
                s.comments = s.comments.map((c) =>
                  c.userId === id ? { ...c, text: "", removed: true } : c,
                );
                s.grants = s.grants.filter((g) => g.userId !== id);
                s.payments = s.payments.filter((p) => p.userId !== id);
                s.referrals = s.referrals.filter(
                  (r) => r.inviteeId !== id && r.inviterId !== id,
                );
                s.support = s.support.filter((x) => x.userId !== id);
                delete s.blocked[id];
                s.scenario = "visitante";
              }, "Conta demonstrativa excluída.");
              navigate("/");
            }}
          >
            <label>
              Digite EXCLUIR para confirmar
              <input
                required
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                pattern="EXCLUIR"
              />
            </label>
            <button
              className="button danger-button"
              disabled={confirmation !== "EXCLUIR"}
              type="submit"
            >
              Excluir dados desta conta
            </button>
          </form>
        </Modal>
      )}
      {restoring && (
        <Modal title="Restaurar demonstração" onClose={closeRestore}>
          <p>
            As alterações locais serão substituídas pelo acervo e pelas contas
            iniciais.
          </p>
          <button
            className="button primary"
            onClick={() => {
              reset();
              setRestoring(false);
              notify("Demonstração restaurada.");
              navigate("/");
            }}
          >
            Restaurar e voltar ao início
          </button>
        </Modal>
      )}
    </div>
  );
}
export function Auth({
  mode = "login",
}: {
  mode?: "login" | "register" | "recover";
}) {
  const { state, update, notify } = useDemo();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(
    mode === "register" ? "" : "bonificado@exemplo.test",
  );
  const [code, setCode] = useState(params.get("convite") || "");
  const [done, setDone] = useState(false);
  return (
    <div className="auth-layout page-width">
      <div className="auth-story">
        <img src="/assets/forest.jpg" alt="Luz atravessando uma floresta" />
        <div>
          <Sparkle size={38} weight="thin" />
          <h2>
            Há tanto para
            <br />
            descobrir juntos.
          </h2>
          <p>
            Um encontro com a cultura.
            <br />
            Um lugar para fazer parte.
          </p>
        </div>
      </div>
      <div className="auth-form">
        <span className="eyebrow">Bem-vindo ao Selectus</span>
        <h1>
          {mode === "register"
            ? "Seu próximo encontro começa aqui."
            : mode === "recover"
              ? "Vamos encontrar seu caminho de volta."
              : "Que bom encontrar você."}
        </h1>
        <p className="muted">
          Ambiente demonstrativo. Use apenas dados fictícios. Nenhuma senha é
          solicitada ou armazenada.
        </p>
        {done ? (
          <InlineNotice>
            <strong>Solicitação demonstrativa registrada.</strong>
            <p>
              Na versão com backend, a recuperação será enviada ao contato
              verificado. Este protótipo não envia mensagens.
            </p>
            <Link className="text-link" to="/entrar">
              Voltar para a entrada <ArrowRight />
            </Link>
          </InlineNotice>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (mode === "recover") {
                setDone(true);
                return;
              }
              if (mode === "register") {
                let newId = "";
                const ok = update((s) => {
                  if (
                    s.users.some(
                      (u) => u.contact.toLowerCase() === email.toLowerCase(),
                    )
                  )
                    throw new Error(
                      "Este e-mail já está na demonstração. Use outro contato fictício.",
                    );
                  newId = uid();
                  s.users.push({
                    id: newId,
                    name: name.trim(),
                    contact: email.trim().toLowerCase(),
                    role: "membro",
                    suspended: false,
                    formation: false,
                  });
                  s.currentUserId = newId;
                  s.scenario = "gratuito";
                  referralService.attach(s, code, newId);
                  log(s, "Cadastro demonstrativo concluído");
                }, "Conta demonstrativa criada.");
                if (ok) navigate(code ? "/convites" : "/perfil");
              } else {
                const target = state.users.find(
                  (u) => u.contact.toLowerCase() === email.trim().toLowerCase(),
                );
                if (!target) {
                  notify(
                    "Conta não encontrada. Cadastre um contato fictício ou use bonificado@exemplo.test.",
                  );
                  return;
                }
                if (target.suspended) {
                  notify("Conta suspensa na demonstração.");
                  return;
                }
                update((s) => {
                  s.currentUserId = target.id;
                  s.scenario = target.id === "equipe" ? "equipe" : "gratuito";
                }, "Bem-vindo de volta.");
                navigate(target.role === "administrador" ? "/admin" : "/");
              }
            }}
          >
            {mode === "register" && (
              <label>
                Como podemos chamar você?
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={80}
                />
              </label>
            )}
            <label>
              E-mail demonstrativo
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            {mode === "register" && (
              <label>
                Código de convite <small>(opcional)</small>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="SELECT-…"
                />
              </label>
            )}
            <button className="button primary" type="submit">
              {mode === "register"
                ? "Criar conta demonstrativa"
                : mode === "recover"
                  ? "Testar recuperação"
                  : "Entrar na demonstração"}
              <ArrowRight />
            </button>
          </form>
        )}
        <div className="auth-options">
          {mode === "login" ? (
            <>
              <Link to="/cadastro">Ainda não tem conta? Faça parte.</Link>
              <Link to="/recuperar">Recuperar acesso</Link>
            </>
          ) : (
            <Link to="/entrar">Já tem uma conta? Entrar.</Link>
          )}
        </div>
        <Link className="text-link" to="/">
          Continuar explorando <ArrowRight />
        </Link>
      </div>
    </div>
  );
}
export function Subscription() {
  const { state, user, active, update } = useDemo();
  if (!user) return <Auth />;
  const payments = state.payments
    .filter((p) => p.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const pending = payments.find(
    (p) => p.status === "pendente" && new Date(p.expiresAt) > new Date(),
  );
  const grants = state.grants
    .filter((g) => g.userId === user.id)
    .sort((a, b) => b.start.localeCompare(a.start));
  return (
    <div className="page-width content-page account-page">
      <PageHeading
        eyebrow="Um pequeno valor. Muitas descobertas."
        title="Minha assinatura"
        description="Cultura e comunidade para fazer parte do seu dia."
      />
      <div className="subscription-grid">
        <div className="membership-card">
          <Sparkle size={34} weight="thin" />
          <span className="eyebrow">Membro Selectus</span>
          <h2>
            Seu lugar entre
            <br />
            boas histórias.
          </h2>
          <div className="price">
            R$ 0,99<span>/mês</span>
          </div>
          <p>Pagamento Pix mensal, com renovação manual.</p>
          <ul>
            {[
              "Filmes, livros, arte e música disponíveis",
              "Conversa em cada obra e publicação",
              "Curtidas, coleções e progresso preservados",
              "Mesmo acesso para membros com bônus",
            ].map((x) => (
              <li key={x}>
                <Check size={17} />
                {x}
              </li>
            ))}
          </ul>
          <button
            className="button primary"
            onClick={() =>
              update(
                (s) => billingService.create(s),
                "Cobrança demonstrativa preparada.",
              )
            }
          >
            {pending
              ? "Ver cobrança pendente"
              : active
                ? "Adicionar um mês de acesso"
                : "Inscreva-se por R$ 0,99 por mês"}
            <ArrowRight />
          </button>
        </div>
        <div>
          <div className="panel">
            <span className="eyebrow">Seu acesso</span>
            <h2>
              {active
                ? "Boas descobertas pela frente."
                : "Seu próximo capítulo espera."}
            </h2>
            <Badge good={active}>{active ? "Ativo" : "Sem acesso ativo"}</Badge>
            <dl className="summary-dl">
              <div>
                <dt>Validade do acesso</dt>
                <dd>{dateLabel(accountService.end(state, user.id))}</dd>
              </div>
              <div>
                <dt>Próxima renovação</dt>
                <dd>
                  {active
                    ? dateLabel(accountService.end(state, user.id))
                    : "Quando você quiser"}
                </dd>
              </div>
              <div>
                <dt>Renovação</dt>
                <dd>Manual · sem cobrança automática</dd>
              </div>
            </dl>
            <Link to="/convites" className="text-link">
              Convide e ganhe 30 dias <ArrowRight />
            </Link>
          </div>
          {pending && (
            <div className="panel payment-panel">
              <Badge>Pagamento pendente</Badge>
              <h3>Pix de demonstração</h3>
              <div
                className="demo-qr"
                aria-label="Imagem demonstrativa, não é um QR Code pagável"
              >
                <span>DEMO</span>
                <small>NÃO PAGÁVEL</small>
              </div>
              <p>
                <strong>R$ 0,99</strong> · válido até{" "}
                {new Date(pending.expiresAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="muted">
                Nenhum pagamento será realizado. Use os controles para conhecer
                os estados da cobrança.
              </p>
              <button
                className="button primary"
                onClick={() =>
                  update(
                    (s) => billingService.confirm(s, pending.id),
                    "Confirmação simulada. Um mês foi acrescentado após seu acesso existente.",
                  )
                }
              >
                Simular confirmação <Check />
              </button>
              <button
                className="text-link"
                onClick={() =>
                  update((s) => {
                    const p = s.payments.find((x) => x.id === pending.id)!;
                    p.status = "vencido";
                    log(s, "Cobrança demonstrativa expirada");
                  }, "Cobrança expirada, sem conceder acesso.")
                }
              >
                Simular vencimento
              </button>
            </div>
          )}
          <InlineNotice>
            Bônus duram 30 dias. Assinaturas acrescentam um mês de calendário.
            Um benefício nunca reduz o período já concedido.
          </InlineNotice>
        </div>
      </div>
      <section className="section">
        <h2>Histórico de acesso</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Origem</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Referência</th>
              </tr>
            </thead>
            <tbody>
              {grants.map((g) => (
                <tr key={g.id}>
                  <td>
                    <Badge good>
                      {g.origin === "bonus"
                        ? "Bônus · 30 dias"
                        : "Assinatura mensal"}
                    </Badge>
                  </td>
                  <td>{dateLabel(g.start)}</td>
                  <td>{dateLabel(g.end)}</td>
                  <td>{g.reference.slice(0, 22)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!grants.length && (
            <p className="table-empty">Nenhum período concedido.</p>
          )}
        </div>
      </section>
      <section className="section">
        <h2>Pagamentos</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Valor</th>
                <th>Situação</th>
                <th>Identificação</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{dateLabel(p.createdAt)}</td>
                  <td>R$ 0,99</td>
                  <td>
                    <Badge good={p.status === "confirmado"}>
                      {p.status === "pendente" &&
                      new Date(p.expiresAt) <= new Date()
                        ? "vencido"
                        : p.status}
                    </Badge>
                  </td>
                  <td>{p.id.slice(0, 12)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!payments.length && (
            <p className="table-empty">Nenhuma cobrança gerada.</p>
          )}
        </div>
      </section>
    </div>
  );
}
export function Invites() {
  const { state, user, update, notify } = useDemo();
  const [params] = useSearchParams();
  const [name, setName] = useState("");
  const received = state.referrals.filter((r) => r.inviteeId === user?.id);
  const referrals = state.referrals.filter((r) => r.inviterId === user?.id);
  const code = user
    ? "SELECT-" + user.id.toUpperCase()
    : params.get("codigo") || "";
  const link = platform.invitationUrl(code);
  async function copy(value: string) {
    try {
      await platform.copyText(value);
      notify("Copiado para compartilhar.");
    } catch {
      notify(
        "Não foi possível copiar automaticamente. Selecione o link ou código exibido.",
      );
    }
  }
  return (
    <div className="page-width content-page account-page">
      <PageHeading
        eyebrow="A melhor descoberta é a que a gente compartilha"
        title="Convide e inspire."
        description="Um convite seu pode ser o começo de uma boa história para alguém."
      />
      {params.get("codigo") && user && (
        <InlineNotice>
          Você abriu um convite. Para experimentar o cadastro de um novo
          convidado, use uma conta fictícia diferente.{" "}
          <Link
            to={
              "/cadastro?convite=" + encodeURIComponent(params.get("codigo")!)
            }
          >
            Criar conta com este convite
          </Link>
        </InlineNotice>
      )}
      <div className="invite-intro">
        <div>
          <Gift size={45} weight="thin" />
          <h2>
            30 dias para você.
            <br />
            30 dias para quem chegar.
          </h2>
          <p>
            Seu amigo conclui o cadastro vinculado ao convite e abre o
            aplicativo autenticado pela primeira vez. Pronto: vocês dois ganham
            30 dias de acesso.
          </p>
          <div className="invite-steps">
            <span>
              <UserCircle />
              Cadastro vinculado
            </span>
            <Plus />
            <span>
              <DeviceMobile />
              Primeira abertura no app
            </span>
            <span>
              <Check />
              Bônus para os dois
            </span>
          </div>
          <p className="muted">
            Sem pagamento ou cartão. A ordem das etapas não importa.
          </p>
        </div>
        <div className="panel">
          {user ? (
            <>
              <span className="eyebrow">Seu convite pessoal</span>
              <label>
                Link para compartilhar
                <div className="copy-field">
                  <input
                    readOnly
                    value={link}
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    className="icon-button"
                    onClick={() => copy(link)}
                    aria-label="Copiar link"
                  >
                    <Copy size={21} />
                  </button>
                </div>
              </label>
              <label>
                Código de convite
                <div className="copy-field">
                  <input
                    readOnly
                    value={code}
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    className="icon-button"
                    onClick={() => copy(code)}
                    aria-label="Copiar código"
                  >
                    <Copy size={21} />
                  </button>
                </div>
              </label>
              <p className="muted">
                Se a passagem pela loja perder o vínculo, o código poderá ser
                informado no cadastro.
              </p>
              <span className="status-badge">
                Apps planejados · ainda não publicados
              </span>
            </>
          ) : (
            <>
              <h3>Um convite para fazer parte.</h3>
              <p>
                {code
                  ? "Você recebeu o código " + code + "."
                  : "Entre para criar seu link pessoal."}
              </p>
              <Link
                className="button primary"
                to={
                  "/cadastro" +
                  (code ? "?convite=" + encodeURIComponent(code) : "")
                }
              >
                Aceitar convite <ArrowRight />
              </Link>
              <Link className="text-link" to="/entrar">
                Já tenho uma conta
              </Link>
            </>
          )}
        </div>
      </div>
      {user && (
        <>
          <div className="invite-totals">
            <div>
              <strong>{referrals.filter((r) => r.granted).length}</strong>
              <span>convites concluídos</span>
            </div>
            <div>
              <strong>{referrals.filter((r) => r.granted).length * 30}</strong>
              <span>dias concedidos a você</span>
            </div>
            <div>
              <strong>{dateLabel(accountService.end(state, user.id))}</strong>
              <span>validade resultante</span>
            </div>
          </div>
          {received.length > 0 && (
            <section className="section">
              <h2>Convites que você recebeu</h2>
              {received.map((r) => (
                <div className="referral-card panel" key={r.id}>
                  <h3>
                    Convite de{" "}
                    {state.users.find((u) => u.id === r.inviterId)?.name}
                  </h3>
                  <ReferralSteps id={r.id} />
                </div>
              ))}
            </section>
          )}
          <section className="section">
            <div className="section-heading">
              <h2>Seus convites</h2>
              <Badge>Demonstração local</Badge>
            </div>
            <p className="muted">
              Os controles abaixo simulam cadastro e instalação. Nenhum evento
              real de aplicativo é coletado.
            </p>
            {referrals.map((r) => (
              <div className="referral-card panel" key={r.id}>
                <div className="list-row">
                  <h3>{r.name}</h3>
                  <Badge good={r.granted}>
                    {r.granted ? "Concluído · +30 dias" : "Etapas pendentes"}
                  </Badge>
                </div>
                <ReferralSteps id={r.id} />
              </div>
            ))}
            <form
              className="invite-test-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  update(
                    (s) => referralService.create(s, name.trim()),
                    "Convidado de teste adicionado.",
                  )
                )
                  setName("");
              }}
            >
              <label>
                Nome fictício do próximo convidado
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  placeholder="Ex.: Rafael Costa"
                />
              </label>
              <button type="submit" className="button secondary">
                <Plus />
                Adicionar convite de teste
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
function ReferralSteps({ id }: { id: string }) {
  const { state, update } = useDemo();
  const r = state.referrals.find((x) => x.id === id)!;
  return (
    <div className="referral-steps">
      <button
        disabled={r.registered}
        className={"step-button " + (r.registered ? "complete" : "")}
        onClick={() =>
          update(
            (s) => referralService.qualify(s, id, "registered"),
            "Cadastro demonstrativo confirmado.",
          )
        }
      >
        <span>{r.registered ? <Check /> : "1"}</span>
        <div>
          <strong>
            {r.registered ? "Cadastro concluído" : "Simular cadastro"}
          </strong>
          <small>Vinculado ao convite</small>
        </div>
      </button>
      <button
        disabled={r.opened}
        className={"step-button " + (r.opened ? "complete" : "")}
        onClick={() =>
          update(
            (s) => referralService.qualify(s, id, "opened"),
            "Primeira abertura autenticada simulada.",
          )
        }
      >
        <span>{r.opened ? <Check /> : "2"}</span>
        <div>
          <strong>
            {r.opened ? "App confirmado" : "Simular abertura do app"}
          </strong>
          <small>Na mesma conta</small>
        </div>
      </button>
      <div className={"step-button " + (r.granted ? "complete" : "")}>
        <span>{r.granted ? <Check /> : "3"}</span>
        <div>
          <strong>
            {r.granted ? "Dois bônus concedidos" : "Bônus aguardando"}
          </strong>
          <small>30 dias para cada pessoa</small>
        </div>
      </div>
    </div>
  );
}
export function Support() {
  const { user, update } = useDemo();
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="page-width content-page narrow-page">
      <PageHeading
        eyebrow="Conversa também é cuidado"
        title="Como podemos ajudar?"
        description="Conte o que aconteceu. Seu relato ajuda a melhorar a experiência."
      />
      {sent ? (
        <InlineNotice>
          Solicitação salva na fila local de operação. Não houve envio de
          mensagem externa.
        </InlineNotice>
      ) : (
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              update((s) => {
                s.support.unshift({
                  id: uid(),
                  userId: user?.id || "visitante",
                  text,
                  date: new Date().toISOString(),
                });
                log(s, "Solicitação local de suporte recebida");
              }, "Solicitação demonstrativa registrada.")
            )
              setSent(true);
          }}
        >
          <label>
            Assunto
            <select>
              <option>Dúvida sobre o Selectus</option>
              <option>Problema em uma mídia</option>
              <option>Assinatura ou convite</option>
              <option>Privacidade e conta</option>
            </select>
          </label>
          <label>
            Mensagem
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              minLength={10}
              maxLength={3000}
              placeholder="Descreva sua dúvida usando apenas dados fictícios."
            />
          </label>
          <button className="button primary" type="submit">
            Registrar solicitação <ArrowRight />
          </button>
          <p className="muted">
            Demonstração: a solicitação aparece apenas neste navegador, no
            painel de operação.
          </p>
        </form>
      )}
      <div className="section">
        <h2>Perguntas que podem ajudar</h2>
        {[
          [
            "Preciso pagar para explorar?",
            "O catálogo, as amostras e a leitura dos fóruns são abertos. Contas gratuitas podem curtir e reagir. Uma assinatura ou bônus ativo libera os conteúdos disponíveis e a participação nas conversas.",
          ],
          [
            "O que acontece quando o acesso vence?",
            "Sua conta, curtidas, reações e progresso são preservados para quando você voltar.",
          ],
          [
            "Como funcionam os convites?",
            "Cadastro vinculado e primeira abertura autenticada do app, em qualquer ordem, concedem 30 dias a cada pessoa. Aqui esses eventos são simulados.",
          ],
        ].map(([q, a]) => (
          <details key={q} className="faq">
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
