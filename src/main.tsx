import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/base.scss";
import SumoryApp from "./SumoryApp.tsx";

const config = {};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SumoryApp config={config} />
  </StrictMode>
);
