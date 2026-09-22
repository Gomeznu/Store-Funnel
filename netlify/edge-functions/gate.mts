import type { Context, Config } from "@netlify/edge-functions";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function unauthorized(): Response {
  return new Response("Acceso restringido. Ingresa el usuario y la clave.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Panel de Tiendas TPF", charset="UTF-8"' },
  });
}

export default async (req: Request, context: Context) => {
  const expectedUser = Netlify.env.get("VIEW_USERNAME") || "";
  const expectedPass = Netlify.env.get("VIEW_PASSWORD") || "";

  // Si no está configurado, no bloqueamos (evita dejarte fuera por accidente).
  if (!expectedUser || !expectedPass) {
    return context.next();
  }

  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Basic ")) return unauthorized();

  let decoded = "";
  try {
    decoded = atob(auth.slice(6));
  } catch {
    return unauthorized();
  }
  const sep = decoded.indexOf(":");
  if (sep === -1) return unauthorized();
  const user = decoded.slice(0, sep);
  const pass = decoded.slice(sep + 1);

  if (!timingSafeEqual(user, expectedUser) || !timingSafeEqual(pass, expectedPass)) {
    return unauthorized();
  }

  return context.next();
};

export const config: Config = {
  path: "/*",
};
