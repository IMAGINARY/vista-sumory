import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/base.scss";
import SumoryApp from "./SumoryApp.tsx";
import en from "./assets/locales/en.json";
import de from "./assets/locales/de.json";

const config = {
  languages: { en, de },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SumoryApp config={config} />
  </StrictMode>
);
