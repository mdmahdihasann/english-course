"use client";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type UI = {
  toast: (msg: string) => void;
  navOpen: boolean;
  setNavOpen: (o: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (o: boolean) => void;
};

const Ctx = createContext<UI | null>(null);

export function useUI() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useUI outside UIProvider");
  return v;
}

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);

  const toast = useCallback((m: string) => {
    setMsg(m);
    setShow(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setShow(false), 2400);
  }, []);

  const value = useMemo(
    () => ({ toast, navOpen, setNavOpen, settingsOpen, setSettingsOpen }),
    [toast, navOpen, settingsOpen],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className={"toast" + (show ? " show" : "")} role="status">
        {msg}
      </div>
    </Ctx.Provider>
  );
}
