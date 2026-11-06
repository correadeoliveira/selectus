export type Format =
  "filme" | "livro" | "arte" | "musica" | "noticia" | "artigo";
export type Role = "membro" | "editor" | "moderador" | "administrador";
export type Scenario =
  "visitante" | "gratuito" | "pagante" | "bonificado" | "vencido" | "equipe";
export type Emotion =
  "inspirador" | "admiravel" | "pensativo" | "comovente" | "surpreendente";
export interface Version {
  id: string;
  label: string;
  language: string;
  media?: string;
  source: string;
  rights: string;
  evidence: string;
  territories: string;
  reviewer: string;
  reviewed: boolean;
}
export interface Work {
  id: string;
  title: string;
  format: Format;
  author: string;
  year: string;
  duration: string;
  description: string;
  image: string;
  imageCredit: string;
  tags: string[];
  publishedAt: string;
  status: "rascunho" | "revisao" | "publicado" | "retirado";
  featured: boolean;
  versions: Version[];
  body?: string[];
  category?: string;
  editorial?: "Notícia" | "Análise" | "Opinião";
  source?: string;
  corrections: string[];
}
export interface User {
  id: string;
  name: string;
  contact: string;
  role: Role;
  suspended: boolean;
  formation: boolean;
}
export interface Interaction {
  liked: boolean;
  emotion?: Emotion;
}
export interface Comment {
  id: string;
  workId: string;
  userId: string;
  text: string;
  date: string;
  parentId?: string;
  versionId?: string;
  removed: boolean;
  edited?: boolean;
}
export interface AccessGrant {
  anchorDay?: number;
  id: string;
  userId: string;
  origin: "pago" | "bonus";
  reference: string;
  start: string;
  end: string;
}
export interface Payment {
  id: string;
  userId: string;
  amount: number;
  status: "pendente" | "confirmado" | "vencido";
  createdAt: string;
  expiresAt: string;
}
export interface Referral {
  id: string;
  inviterId: string;
  inviteeId: string;
  name: string;
  code: string;
  registered: boolean;
  opened: boolean;
  granted: boolean;
}
export interface Report {
  id: string;
  commentId: string;
  reason: string;
  status: "aberta" | "removido" | "mantido";
}
export interface Audit {
  id: string;
  action: string;
  date: string;
  actor: string;
}
export interface DemoState {
  version: 1;
  scenario: Scenario;
  currentUserId: string;
  users: User[];
  works: Work[];
  interactions: Record<string, Interaction>;
  progress: Record<string, number>;
  comments: Comment[];
  grants: AccessGrant[];
  payments: Payment[];
  referrals: Referral[];
  reports: Report[];
  blocked: Record<string, string[]>;
  audit: Audit[];
  support: { id: string; userId: string; text: string; date: string }[];
}
