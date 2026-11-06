import { addMonth, calendarParts } from "./calendar";
export { addMonth } from "./calendar";
import { createSeed } from "./data";
import type {
  AccessGrant,
  DemoState,
  Emotion,
  Role,
  Scenario,
  Work,
} from "./types";
export const STORAGE_KEY = "selectus:demo:v1";
export const uid = () => globalThis.crypto.randomUUID();
export const interactionKey = (user: string, work: string) => user + ":" + work;
export const accountService = {
  user: (s: DemoState) =>
    s.scenario === "visitante"
      ? undefined
      : s.users.find((u) => u.id === s.currentUserId),
  active: (s: DemoState, id: string, now = new Date()) =>
    !!s.users.find((u) => u.id === id && !u.suspended) &&
    s.grants.some(
      (g) =>
        g.userId === id && new Date(g.start) <= now && new Date(g.end) > now,
    ),
  end: (s: DemoState, id: string) =>
    s.grants
      .filter((g) => g.userId === id)
      .map((g) => g.end)
      .sort()
      .at(-1),
  scenario(s: DemoState, scenario: Scenario) {
    s.scenario = scenario;
    if (scenario !== "visitante") s.currentUserId = scenario;
  },
};
export function log(s: DemoState, action: string, now = new Date()) {
  s.audit.unshift({
    id: uid(),
    action,
    date: now.toISOString(),
    actor: accountService.user(s)?.name || "Visitante",
  });
}
function requireUser(s: DemoState) {
  const user = accountService.user(s);
  if (!user) throw new Error("Entre na demonstração para continuar.");
  if (user.suspended)
    throw new Error("Esta conta está suspensa na demonstração.");
  return user;
}
function requireRole(s: DemoState, roles: Role[]) {
  const u = requireUser(s);
  if (!roles.includes(u.role))
    throw new Error("Seu perfil não tem permissão para esta ação.");
}
export const catalogService = {
  published: (s: DemoState) => s.works.filter((w) => w.status === "publicado"),
  likes: (s: DemoState, workId: string) =>
    Object.entries(s.interactions).filter(
      ([k, v]) => k.endsWith(":" + workId) && v.liked,
    ).length,
  reactions: (s: DemoState, workId: string) =>
    Object.entries(s.interactions).filter(
      ([k, v]) => k.endsWith(":" + workId) && v.emotion,
    ).length,
  like(s: DemoState, workId: string, liked: boolean) {
    const u = requireUser(s);
    const key = interactionKey(u.id, workId);
    s.interactions[key] = { ...s.interactions[key], liked };
  },
  react(s: DemoState, workId: string, emotion?: Emotion) {
    const u = requireUser(s);
    const key = interactionKey(u.id, workId);
    s.interactions[key] = {
      ...(s.interactions[key] || { liked: false }),
      emotion,
    };
  },
  progress(s: DemoState, versionId: string, position: number) {
    const u = requireUser(s);
    if (!accountService.active(s, u.id)) return;
    s.progress[interactionKey(u.id, versionId)] = Math.max(0, position);
  },
};
export function addGrant(
  s: DemoState,
  userId: string,
  origin: AccessGrant["origin"],
  reference: string,
  now = new Date(),
) {
  if (s.grants.some((g) => g.userId === userId && g.reference === reference))
    return;
  const end = accountService.end(s, userId);
  const start = end && new Date(end) > now ? new Date(end) : now;
  const previous = s.grants
    .filter((g) => g.userId === userId && g.end === start.toISOString())
    .at(-1);
  const anchor =
    origin === "pago" && previous?.origin === "pago"
      ? previous.anchorDay
      : undefined;
  const anchorDay = anchor || calendarParts(start).day;
  const finish =
    origin === "bonus"
      ? new Date(start.getTime() + 30 * 86400000)
      : addMonth(start, anchorDay);
  s.grants.push({
    id: uid(),
    userId,
    origin,
    reference,
    start: start.toISOString(),
    end: finish.toISOString(),
    ...(origin === "pago" ? { anchorDay } : {}),
  });
}
export const billingService = {
  create(s: DemoState, now = new Date()) {
    const u = requireUser(s);
    const pending = s.payments.find(
      (p) =>
        p.userId === u.id &&
        p.status === "pendente" &&
        new Date(p.expiresAt) > now,
    );
    if (pending) return;
    s.payments.push({
      id: uid(),
      userId: u.id,
      amount: 99,
      status: "pendente",
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 15 * 60000).toISOString(),
    });
    log(s, "Cobrança demonstrativa criada", now);
  },
  confirm(s: DemoState, id: string, now = new Date()) {
    const u = requireUser(s);
    const p = s.payments.find((p) => p.id === id);
    if (!p || (p.userId !== u.id && u.role !== "administrador"))
      throw new Error("Cobrança não encontrada.");
    if (p.status === "confirmado") return;
    if (p.status === "vencido" || new Date(p.expiresAt) <= now)
      throw new Error(
        "Esta cobrança venceu. Gere uma nova cobrança demonstrativa.",
      );
    p.status = "confirmado";
    addGrant(s, p.userId, "pago", p.id, now);
    log(s, "Pagamento demonstrativo confirmado", now);
  },
};
export const referralService = {
  qualify(
    s: DemoState,
    id: string,
    condition: "registered" | "opened",
    now = new Date(),
  ) {
    const r = s.referrals.find((r) => r.id === id);
    if (!r || r.inviteeId === r.inviterId)
      throw new Error("Indicação inválida.");
    r[condition] = true;
    if (r.granted || !r.registered || !r.opened) return;
    if (
      s.referrals.some(
        (other) =>
          other.id !== id && other.inviteeId === r.inviteeId && other.granted,
      )
    )
      throw new Error("Este convidado já recebeu o benefício.");
    addGrant(s, r.inviterId, "bonus", "convite:" + id + ":indicador", now);
    addGrant(s, r.inviteeId, "bonus", "convite:" + id + ":convidado", now);
    r.granted = true;
    log(s, "Indicação qualificada: dois benefícios de 30 dias", now);
  },
  create(s: DemoState, name: string) {
    const u = requireUser(s);
    const inviteeId = uid();
    s.users.push({
      id: inviteeId,
      name,
      contact: "convidado-" + inviteeId.slice(0, 5) + "@exemplo.test",
      role: "membro",
      suspended: false,
      formation: false,
    });
    s.referrals.push({
      id: uid(),
      inviterId: u.id,
      inviteeId,
      name,
      code: "SELECT-" + u.id.toUpperCase(),
      registered: false,
      opened: false,
      granted: false,
    });
  },
  attach(s: DemoState, code: string, inviteeId: string) {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    const inviter = s.users.find(
      (u) => "SELECT-" + u.id.toUpperCase() === normalized,
    );
    if (!inviter || inviter.id === inviteeId)
      throw new Error("Código de convite inválido ou autoindicação.");
    const existing = s.referrals.find((r) => r.inviteeId === inviteeId);
    if (existing) {
      if (existing.inviterId !== inviter.id)
        throw new Error("Esta conta já está vinculada a um indicador.");
      existing.registered = true;
      return;
    }
    s.referrals.push({
      id: uid(),
      inviterId: inviter.id,
      inviteeId,
      name: s.users.find((u) => u.id === inviteeId)?.name || "Convidado",
      code: normalized,
      registered: true,
      opened: false,
      granted: false,
    });
  },
};
export const communityService = {
  comment(
    s: DemoState,
    workId: string,
    text: string,
    parentId?: string,
    versionId?: string,
  ) {
    const u = requireUser(s);
    if (!accountService.active(s, u.id))
      throw new Error(
        "Uma assinatura ou bônus ativo permite participar da conversa.",
      );
    if (!text.trim()) throw new Error("Escreva seu comentário.");
    s.comments.push({
      id: uid(),
      workId,
      userId: u.id,
      text: text.trim(),
      parentId,
      versionId,
      date: new Date().toISOString(),
      removed: false,
    });
  },
  edit(s: DemoState, id: string, text: string) {
    const u = requireUser(s);
    const c = s.comments.find((c) => c.id === id);
    if (!c || c.userId !== u.id || c.removed)
      throw new Error("Comentário indisponível.");
    if (!text.trim()) throw new Error("O comentário não pode ficar vazio.");
    c.text = text.trim();
    c.edited = true;
  },
  remove(s: DemoState, id: string) {
    const u = requireUser(s);
    const c = s.comments.find((c) => c.id === id);
    if (!c || c.userId !== u.id)
      throw new Error("Você só pode excluir seus comentários.");
    c.removed = true;
    log(s, "Comentário excluído pelo autor");
  },
  report(s: DemoState, id: string, reason: string) {
    requireUser(s);
    if (s.reports.some((r) => r.commentId === id && r.status === "aberta"))
      return;
    s.reports.push({ id: uid(), commentId: id, reason, status: "aberta" });
    log(s, "Denúncia recebida");
  },
  block(s: DemoState, userId: string) {
    const u = requireUser(s);
    s.blocked[u.id] = [...new Set([...(s.blocked[u.id] || []), userId])];
  },
};
export const adminService = {
  save(s: DemoState, work: Work) {
    requireRole(s, ["administrador", "editor"]);
    if (!work.title.trim() || !work.author.trim())
      throw new Error("Preencha título e autoria.");
    if (
      work.status === "publicado" &&
      !work.versions.every(
        (v) =>
          v.reviewed &&
          v.evidence.trim() &&
          v.source.trim() &&
          v.reviewer.trim(),
      )
    )
      throw new Error(
        "Revise os direitos e registre fonte, evidência e responsável antes de publicar.",
      );
    const index = s.works.findIndex((w) => w.id === work.id);
    if (index < 0) s.works.unshift(work);
    else s.works[index] = work;
    log(s, "Conteúdo salvo: " + work.title + " · " + work.status);
  },
  status(s: DemoState, id: string, status: Work["status"]) {
    const w = s.works.find((w) => w.id === id);
    if (!w) return;
    adminService.save(s, { ...w, status });
  },
  moderate(s: DemoState, id: string, decision: "removido" | "mantido") {
    requireRole(s, ["administrador", "moderador"]);
    const r = s.reports.find((r) => r.id === id);
    if (!r) return;
    r.status = decision;
    const c = s.comments.find((c) => c.id === r.commentId);
    if (c && decision === "removido") c.removed = true;
    log(s, "Denúncia analisada: comentário " + decision);
  },
  user(
    s: DemoState,
    id: string,
    changes: { role?: Role; suspended?: boolean },
  ) {
    requireRole(s, ["administrador"]);
    if (id === s.currentUserId)
      throw new Error("Não altere as permissões da sua própria sessão.");
    const u = s.users.find((u) => u.id === id);
    if (u) Object.assign(u, changes);
    log(s, "Permissões de conta atualizadas");
  },
};
export function loadState(storage: Pick<Storage, "getItem">): DemoState {
  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEY) || "null");
    if (
      value?.version === 1 &&
      Array.isArray(value.works) &&
      Array.isArray(value.users) &&
      Array.isArray(value.grants) &&
      value.interactions &&
      value.progress &&
      Array.isArray(value.audit) &&
      Array.isArray(value.comments) &&
      Array.isArray(value.referrals) &&
      Array.isArray(value.payments) &&
      Array.isArray(value.reports) &&
      value.blocked &&
      Array.isArray(value.support)
    )
      return value;
  } catch {
    /* A damaged demo can always be restored. */
  }
  return createSeed();
}
