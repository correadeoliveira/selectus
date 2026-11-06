import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createSeed } from "./data";
import { accountService, loadState, STORAGE_KEY } from "./services";
import type { DemoState } from "./types";
type Store = {
  state: DemoState;
  user: ReturnType<typeof accountService.user>;
  active: boolean;
  update: (fn: (s: DemoState) => void, message?: string) => boolean;
  reset: () => void;
  toast: string;
  notify: (text: string) => void;
  storageError: boolean;
};
const Context = createContext<Store | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => {
    try {
      return loadState(localStorage);
    } catch {
      return createSeed();
    }
  });
  const ref = useRef(state);
  const [toast, setToast] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [, tick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  const persist = useCallback((next: DemoState) => {
    ref.current = next;
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, []);
  const update = useCallback(
    (fn: (s: DemoState) => void, message?: string) => {
      try {
        const next = structuredClone(ref.current);
        fn(next);
        persist(next);
        if (message) setToast(message);
        return true;
      } catch (e) {
        setToast(
          e instanceof Error
            ? e.message
            : "Não foi possível concluir. Tente novamente.",
        );
        return false;
      }
    },
    [persist],
  );
  const user = accountService.user(state);
  const active = !!user && accountService.active(state, user.id);
  return (
    <Context.Provider
      value={{
        state,
        user,
        active,
        update,
        reset: () => persist(createSeed()),
        toast,
        notify: setToast,
        storageError,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useDemo() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("DemoProvider ausente");
  return ctx;
}
