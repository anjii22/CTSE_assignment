const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
]);

function getRawBody(req: any): Promise<Buffer | undefined> {
  const method = (req.method || "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return Promise.resolve(undefined);

  // If the platform already parsed body, serialize it back.
  if (req.body != null) {
    if (Buffer.isBuffer(req.body)) return Promise.resolve(req.body);
    if (typeof req.body === "string") return Promise.resolve(Buffer.from(req.body));
    return Promise.resolve(Buffer.from(JSON.stringify(req.body)));
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => resolve(chunks.length ? Buffer.concat(chunks) : undefined));
    req.on("error", reject);
  });
}

function joinUrl(base: string, pathWithQuery: string) {
  const b = base.replace(/\/+$/, "");
  const p = pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
  return `${b}${p}`;
}

export default async function handler(req: any, res: any) {
  const base = process.env.VITE_API_BASE_URL;
  if (!base) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "Missing env var VITE_API_BASE_URL" }));
    return;
  }

  const segments = Array.isArray(req.query?.path)
    ? req.query.path
    : typeof req.query?.path === "string"
      ? [req.query.path]
      : [];

  const qsIndex = (req.url || "").indexOf("?");
  const queryString = qsIndex >= 0 ? (req.url || "").slice(qsIndex) : "";
  const upstreamPath = `/${segments.map(encodeURIComponent).join("/")}${queryString}`;

  const upstreamUrl = joinUrl(base, upstreamPath);
  const body = await getRawBody(req);

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers || {})) {
    if (!k) continue;
    const key = k.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(key)) continue;
    if (typeof v === "string") headers.set(key, v);
    else if (Array.isArray(v)) headers.set(key, v.join(","));
  }

  const upstreamResp = await fetch(upstreamUrl, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
  });

  res.statusCode = upstreamResp.status;
  upstreamResp.headers.forEach((value, key) => {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return;
    res.setHeader(key, value);
  });

  const buf = Buffer.from(await upstreamResp.arrayBuffer());
  res.end(buf);
}

