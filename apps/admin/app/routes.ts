import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("routes/_layout.tsx", [
    index("routes/dashboard.tsx"),
    route("usuarios", "routes/usuarios.tsx"),
    route("logs", "routes/logs.tsx"),
    route("configuracoes", "routes/configuracoes.tsx"),
  ])
] satisfies RouteConfig;
