import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/base.scss";
import SumoryApp from "./SumoryApp.tsx";

const strings: Record<string, any> = {};
for (const code of ["en", "de"]) {
  const response = await fetch(`/locales/${code}.json`, {
    cache: "no-cache",
  });
  strings[code] = await response.json();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SumoryApp config={{ languages: strings }} />
  </StrictMode>
);
