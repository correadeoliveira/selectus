/** Device boundary. A future Capacitor adapter can replace this without changing screens. */
export interface PlatformAdapter {
  copyText(text: string): Promise<void>;
  invitationUrl(code: string): string;
}
export const platform: PlatformAdapter = {
  copyText: (text) => navigator.clipboard.writeText(text),
  invitationUrl: (code) =>
    (import.meta.env.VITE_PUBLIC_ORIGIN || window.location.origin) +
    "/convites?codigo=" +
    encodeURIComponent(code),
};
