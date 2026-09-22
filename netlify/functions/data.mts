import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

const STORE_NAME = "panel-tiendas-tpf";
const KEY = "state";

type SharedState = {
  funnelWeeks: Record<string, { byId: Record<string, any>; uploadedAt: number }>;
  riesgoWeeks: Record<string, { byId: Record<string, any>; uploadedAt: number }>;
  weeklyDetailById: Record<string, any>;
  weeklyStamp: number | null;
  universe: any[] | null;
  universeLabel: string | null;
};

function defaultState(): SharedState {
  return {
    funnelWeeks: {},
    riesgoWeeks: {},
    weeklyDetailById: {},
    weeklyStamp: null,
    universe: null,
    universeLabel: null,
  };
}

async function loadState(store: ReturnType<typeof getStore>): Promise<SharedState> {
  const data = await store.get(KEY, { type: "json" });
  return (data as SharedState) || defaultState();
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export default async (req: Request, context: Context) => {
  const store = getStore(STORE_NAME);

  if (req.method === "GET") {
    const state = await loadState(store);
    return json(state);
  }

  if (req.method === "POST") {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ error: "JSON inválido" }, 400);
    }

    const expected = process.env.UPLOAD_PASSWORD || "";
    if (!expected || typeof body.password !== "string" || body.password !== expected) {
      return json({ error: "Clave incorrecta" }, 401);
    }

    const state = await loadState(store);

    switch (body.action) {
      case "weekly": {
        if (!body.asOfDate || typeof body.asOfDate !== "string") {
          return json({ error: "Falta asOfDate" }, 400);
        }
        state.funnelWeeks[body.asOfDate] = { byId: body.funnelById || {}, uploadedAt: Date.now() };
        state.riesgoWeeks[body.asOfDate] = { byId: body.riesgoById || {}, uploadedAt: Date.now() };
        state.weeklyDetailById = body.detailById || {};
        state.weeklyStamp = Date.now();
        break;
      }
      case "matrix": {
        if (!Array.isArray(body.universe)) {
          return json({ error: "Falta universe" }, 400);
        }
        state.universe = body.universe;
        state.universeLabel = typeof body.universeLabel === "string" ? body.universeLabel : "Matriz personalizada";
        break;
      }
      case "reset-funnel": {
        state.funnelWeeks = {};
        break;
      }
      case "reset-riesgo": {
        state.riesgoWeeks = {};
        break;
      }
      default:
        return json({ error: "Acción no reconocida" }, 400);
    }

    await store.setJSON(KEY, state);
    return json(state);
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/store-data",
};
