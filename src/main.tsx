import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { IconContext } from "@phosphor-icons/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DemoProvider } from "./store";
import { Shell } from "./components";
import {
  Home,
  Catalog,
  Inspire,
  Search,
  MyCollections,
  Community,
  Relationships,
} from "./pages/Explore";
import { Detail } from "./pages/Detail";
import { Auth, Invites, Profile, Subscription, Support } from "./pages/Account";
import { Admin } from "./pages/Admin";
import { Credits, Info, NotFound } from "./pages/Info";
import "./styles.css";
function App() {
  return (
    <DemoProvider>
      <BrowserRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<Home />} />
            {["filmes", "livros", "arte", "musica", "noticias"].map((path) => (
              <Route
                path={"/" + path}
                element={<Catalog key={path} />}
                key={path}
              />
            ))}
            <Route path="/inspire-se" element={<Inspire />} />
            <Route path="/busca" element={<Search />} />
            <Route path="/colecoes" element={<MyCollections />} />
            <Route path="/comunidade" element={<Community />} />
            <Route path="/relacionamentos" element={<Relationships />} />
            <Route path="/obra/:id" element={<Detail />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/entrar" element={<Auth />} />
            <Route path="/cadastro" element={<Auth mode="register" />} />
            <Route path="/recuperar" element={<Auth mode="recover" />} />
            <Route path="/assinatura" element={<Subscription />} />
            <Route path="/convites" element={<Invites />} />
            <Route path="/suporte" element={<Support />} />
            <Route path="/admin/:module?" element={<Admin />} />
            <Route path="/creditos" element={<Credits />} />
            {["sobre", "termos", "privacidade"].map((path) => (
              <Route
                key={path}
                path={"/" + path}
                element={<Info page={path} />}
              />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Shell>
      </BrowserRouter>
    </DemoProvider>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IconContext.Provider
      value={{ "aria-hidden": true, size: 20, weight: "regular" }}
    >
      <App />
    </IconContext.Provider>
  </StrictMode>,
);
