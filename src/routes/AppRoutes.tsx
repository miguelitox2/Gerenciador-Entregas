import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Login } from "../pages/Login";
import { Buscar } from "../pages/Buscar";
import { Ocorrencias } from "../pages/Ocorrencias";
import { Retencao } from "../pages/Retencao";
import { Importar } from "../pages/Importar";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  // Ajustado para ler a chave "token" salva pelo login do Fastify
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/buscar" element={<Buscar />} />
        <Route path="/ocorrencias" element={<Ocorrencias />} />
        <Route path="/retencao" element={<Retencao />} />
        <Route path="/importar" element={<Importar />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
