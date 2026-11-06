import { describe, expect, it } from "vitest";
import { createSeed } from "./data";
import {
  accountService,
  addGrant,
  addMonth,
  adminService,
  billingService,
  catalogService,
  communityService,
  interactionKey,
  loadState,
  referralService,
} from "./services";
const now = new Date("2026-11-06T15:00:00Z");
describe("interações compartilhadas", () => {
  it("mantém curtida independente de reação e não duplica contagens", () => {
    const s = createSeed(now);
    const key = interactionKey("bonificado", "viagem-lua");
    catalogService.like(s, "viagem-lua", true);
    catalogService.like(s, "viagem-lua", true);
    expect(catalogService.likes(s, "viagem-lua")).toBe(2);
    catalogService.react(s, "viagem-lua", "inspirador");
    catalogService.react(s, "viagem-lua", "admiravel");
    expect(s.interactions[key]).toEqual({ liked: true, emotion: "admiravel" });
    expect(catalogService.reactions(s, "viagem-lua")).toBe(2);
    catalogService.like(s, "viagem-lua", false);
    expect(s.interactions[key].emotion).toBe("admiravel");
    catalogService.react(s, "viagem-lua");
    expect(s.interactions[key]).toEqual({ liked: false, emotion: undefined });
  });
  it("preserva progresso e coleção quando o acesso expira", () => {
    const s = createSeed(now);
    const before = structuredClone(s.interactions);
    expect(
      accountService.active(s, "bonificado", new Date("2026-12-20T00:00:00Z")),
    ).toBe(false);
    expect(s.interactions).toEqual(before);
    expect(s.progress["bonificado:dom-casmurro-v1"]).toBe(2);
  });
  it("impede interação anônima e comentários sem acesso", () => {
    const s = createSeed();
    accountService.scenario(s, "visitante");
    expect(() => catalogService.like(s, "viagem-lua", true)).toThrow();
    accountService.scenario(s, "gratuito");
    catalogService.react(s, "viagem-lua", "pensativo");
    expect(() =>
      communityService.comment(s, "viagem-lua", "Uma descoberta."),
    ).toThrow();
  });
});
describe("assinatura mensal e pagamentos", () => {
  it("calcula mês civil, incluindo ano bissexto e horário de São Paulo", () => {
    expect(addMonth(new Date("2026-01-31T15:00:00Z")).toISOString()).toBe(
      "2026-02-28T15:00:00.000Z",
    );
    expect(addMonth(new Date("2028-01-31T15:00:00Z")).toISOString()).toBe(
      "2028-02-29T15:00:00.000Z",
    );
    expect(addMonth(new Date("2026-02-01T01:00:00Z")).toISOString()).toBe(
      "2026-03-01T01:00:00.000Z",
    );
  });
  it("preserva âncora 31 nas renovações seguintes", () => {
    const s = createSeed(now);
    s.grants = [];
    addGrant(s, "gratuito", "pago", "jan", new Date("2026-01-31T15:00:00Z"));
    addGrant(s, "gratuito", "pago", "fev", new Date("2026-02-15T15:00:00Z"));
    expect(s.grants[1].end).toBe("2026-03-31T15:00:00.000Z");
  });
  it("pagamento pendente não concede acesso, confirmação concede uma vez", () => {
    const s = createSeed(now);
    accountService.scenario(s, "gratuito");
    const n = s.grants.length;
    billingService.create(s, now);
    billingService.create(s, now);
    expect(s.payments.filter((p) => p.userId === "gratuito")).toHaveLength(1);
    expect(s.grants).toHaveLength(n);
    const p = s.payments.at(-1)!;
    billingService.confirm(s, p.id, now);
    billingService.confirm(s, p.id, now);
    expect(s.grants).toHaveLength(n + 1);
    expect(s.grants.at(-1)?.end).toBe("2026-12-06T15:00:00.000Z");
  });
  it("não confirma cobranças vencidas ou de outra conta", () => {
    const s = createSeed(now);
    accountService.scenario(s, "gratuito");
    billingService.create(s, now);
    const p = s.payments.at(-1)!;
    expect(() =>
      billingService.confirm(s, p.id, new Date(now.getTime() + 16 * 60000)),
    ).toThrow(/venceu/);
    accountService.scenario(s, "bonificado");
    expect(() => billingService.confirm(s, p.id, now)).toThrow(
      /não encontrada/,
    );
  });
  it("acrescenta pagamento depois de todo o acesso existente", () => {
    const s = createSeed(now);
    const end = accountService.end(s, "bonificado")!;
    billingService.create(s, now);
    billingService.confirm(s, s.payments.at(-1)!.id, now);
    expect(s.grants.at(-1)?.start).toBe(end);
  });
});
describe("convites", () => {
  for (const first of ["registered", "opened"] as const)
    it("qualifica em qualquer ordem: " + first, () => {
      const s = createSeed(now);
      const n = s.grants.length;
      const end = accountService.end(s, "bonificado")!;
      referralService.qualify(s, "r1", first, now);
      expect(s.grants).toHaveLength(n);
      referralService.qualify(
        s,
        "r1",
        first === "registered" ? "opened" : "registered",
        now,
      );
      expect(s.grants).toHaveLength(n + 2);
      const inviter = s.grants.find(
        (g) => g.reference === "convite:r1:indicador",
      )!;
      const invited = s.grants.find(
        (g) => g.reference === "convite:r1:convidado",
      )!;
      expect(inviter.start).toBe(end);
      expect(invited.start).toBe(now.toISOString());
      expect(
        new Date(inviter.end).getTime() - new Date(inviter.start).getTime(),
      ).toBe(30 * 86400000);
      referralService.qualify(s, "r1", "opened", now);
      referralService.qualify(s, "r1", "registered", now);
      expect(s.grants).toHaveLength(n + 2);
    });
  it("inicia bônus de indicador sem acesso e acumula novas indicações", () => {
    const s = createSeed(now);
    accountService.scenario(s, "gratuito");
    referralService.create(s, "Rafael");
    const a = s.referrals.at(-1)!;
    referralService.qualify(s, a.id, "registered", now);
    referralService.qualify(s, a.id, "opened", now);
    expect(accountService.end(s, "gratuito")).toBe(
      new Date(now.getTime() + 30 * 86400000).toISOString(),
    );
    referralService.create(s, "Sofia");
    const b = s.referrals.at(-1)!;
    referralService.qualify(s, b.id, "opened", now);
    referralService.qualify(s, b.id, "registered", now);
    expect(accountService.end(s, "gratuito")).toBe(
      new Date(now.getTime() + 60 * 86400000).toISOString(),
    );
  });
  it("impede autoindicação e reatribuição para outro indicador", () => {
    const s = createSeed(now);
    expect(() =>
      referralService.attach(s, "SELECT-BONIFICADO", "bonificado"),
    ).toThrow();
    referralService.attach(s, "SELECT-BONIFICADO", "gratuito");
    expect(() =>
      referralService.attach(s, "SELECT-PAGANTE", "gratuito"),
    ).toThrow();
  });
  it("uma conta convidada não recebe novo par de bônus", () => {
    const s = createSeed(now);
    referralService.qualify(s, "r1", "opened", now);
    referralService.qualify(s, "r1", "registered", now);
    s.referrals.push({ ...s.referrals[0], id: "duplicado", granted: false });
    const n = s.grants.length;
    expect(() =>
      referralService.qualify(s, "duplicado", "opened", now),
    ).toThrow();
    expect(s.grants).toHaveLength(n);
  });
});
describe("editorial e comunidade", () => {
  it("publicação exige conferência em todas as versões", () => {
    const s = createSeed(now);
    accountService.scenario(s, "equipe");
    const work = structuredClone(s.works.find((w) => w.id === "general")!);
    expect(() => adminService.save(s, work)).toThrow(/direitos/);
    work.versions[0] = {
      ...work.versions[0],
      reviewed: true,
      source: "https://example.org/acervo",
      evidence: "Registro de teste",
      reviewer: "Editor",
    };
    adminService.save(s, work);
    adminService.status(s, work.id, "retirado");
    expect(catalogService.published(s).some((w) => w.id === work.id)).toBe(
      false,
    );
    expect(s.audit[0].action).toContain("retirado");
  });
  it("denúncia, decisão e remoção compartilham o mesmo comentário", () => {
    const s = createSeed(now);
    communityService.report(s, "c1", "Spam");
    communityService.report(s, "c1", "Spam");
    expect(s.reports).toHaveLength(1);
    expect(() => adminService.moderate(s, s.reports[0].id, "removido")).toThrow(
      /permissão/,
    );
    accountService.scenario(s, "equipe");
    adminService.moderate(s, s.reports[0].id, "removido");
    expect(s.comments.find((c) => c.id === "c1")?.removed).toBe(true);
  });
  it("só o autor edita ou exclui; suspensão impede publicar", () => {
    const s = createSeed();
    expect(() => communityService.edit(s, "c1", "Alteração")).toThrow();
    communityService.comment(s, "viagem-lua", "Gostei desta descoberta.");
    const c = s.comments.at(-1)!;
    communityService.edit(s, c.id, "Um novo olhar.");
    expect(c.edited).toBe(true);
    s.users.find((u) => u.id === s.currentUserId)!.suspended = true;
    expect(() => communityService.comment(s, "viagem-lua", "Teste")).toThrow(
      /suspensa/,
    );
  });
  it("recupera armazenamento inválido sem quebrar a aplicação", () => {
    expect(loadState({ getItem: () => "{invalido" }).works).toHaveLength(24);
    expect(
      loadState({ getItem: () => '{"version":1}' }).users.length,
    ).toBeGreaterThan(0);
  });
});
