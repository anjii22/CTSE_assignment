function toHttpsIfHttp(url: string) {
  return url.startsWith("http://") ? `https://${url.slice("http://".length)}` : url;
}

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export default async function handler(_req: any, res: any) {
  const base = process.env.VITE_API_BASE_URL ?? process.env.API_BASE_URL;
  if (!base) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: false, error: "Missing env var VITE_API_BASE_URL (or API_BASE_URL)" }));
    return;
  }

  const tested = toHttpsIfHttp(joinUrl(base, "/"));
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 7000);

  try {
    const r = await fetch(tested, { method: "GET", redirect: "manual", signal: controller.signal });
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.setHeader("cache-control", "no-store");
    res.end(JSON.stringify({ ok: true, base, tested, upstreamStatus: r.status }));
  } catch (e: any) {
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.setHeader("cache-control", "no-store");
    res.end(JSON.stringify({ ok: false, base, tested, error: e?.message ?? String(e) }));
  } finally {
    clearTimeout(t);
  }
}

