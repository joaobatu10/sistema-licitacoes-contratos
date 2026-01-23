import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  
    <BrowserRouter>
      <CssBaseline /> {/* Garante que o Material UI tenha estilos resetados */}
      <App />
    </BrowserRouter>
  
);
