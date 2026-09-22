import type { Context, Config } from "@netlify/edge-functions";

const COOKIE_NAME = "tpf_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 días

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie") || "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function loginPage(error?: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Acceso — Panel de Tiendas TPF</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:#F5F6F8;font-family:ui-sans-serif,system-ui,sans-serif;color:#1A2233;}
  .box{background:#fff;border:1px solid #D8DBE2;border-radius:8px;padding:32px 28px;width:100%;max-width:320px;}
  h1{font-size:16px;margin:0 0 6px;}
  p{font-size:13px;color:#5B6472;margin:0 0 20px;}
  input[type=password]{width:100%;box-sizing:border-box;padding:10px 12px;font-size:14px;
    border:1px solid #D8DBE2;border-radius:4px;margin-bottom:14px;}
  button{width:100%;padding:10px;font-size:14px;font-weight:600;color:#fff;background:#23345E;
    border:none;border-radius:4px;cursor:pointer;}
  .err{color:#B23B3B;font-size:12px;margin-bottom:12px;}
</style>
</head>
<body>
  <form class="box" method="POST">
    <h1>Panel de Tiendas TPF</h1>
    <p>Ingresa la clave para continuar.</p>
    ${error ? `<div class="err">Clave incorrecta, intenta de nuevo.</div>` : ""}
    <input type="password" name="password" autofocus required>
    <button type="submit">Entrar</button>
  </form>
</body>
</html>`;
}

export default async (req: Request, context: Context) => {
  const expectedPassword = Netlify.env.get("SITE_PASSWORD") || "";
  const expectedHash = expectedPassword ? await sha256Hex(expectedPassword) : "";

  if (req.method === "POST") {
    const form = await req.formData();
    const attempt = String(form.get("password") || "");
    if (expectedPassword && attempt === expectedPassword) {
      const sessionValue = await sha256Hex(expectedPassword + ":session");
      const headers = new Headers({ Location: "/" });
      headers.append(
        "Set-Cookie",
        `${COOKIE_NAME}=${sessionValue}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE_SECONDS}`
      );
      return new Response(null, { status: 303, headers });
    }
    return new Response(loginPage(true), {
      status: 401,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  const cookieValue = getCookie(req, COOKIE_NAME);
  const validSession = expectedPassword
    ? cookieValue === (await sha256Hex(expectedPassword + ":session"))
    : false;

  if (validSession) {
    return context.next();
  }

  return new Response(loginPage(false), {
    status: 401,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
};

export const config: Config = {
  path: "/*",
};
