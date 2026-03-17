const express = require('express');
const http = require('http');
const { createProxyServer } = require('http-proxy');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { URL } = require('url');

const app = express();
const server = http.createServer(app);

/* ===== CREATE PROXY (ONLY ONCE) ===== */
const proxy = createProxyServer({
  changeOrigin: true,
  secure: false,
  ws: true
});

/* ===== MIDDLEWARE ===== */
app.use(cors({ origin: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false
})

app.use('/scramjet', limiter)
app.use('/proxy', limiter)

app.use(express.static('public'));

/* ===== SCRAMJET STYLE PROXY ===== */
app.use('/scramjet', (req, res) => {
  try {
    let encoded = req.path;

    if (encoded.startsWith('/'))
      encoded = encoded.slice(1);

    if (!encoded)
      return res.status(400).send('No URL');

    let target = decodeURIComponent(encoded);

    if (!target.startsWith('http'))
      return res.status(400).send('Bad URL');

    let url = new URL(target);

    req.url = url.pathname + url.search;
    req.headers.host = url.host;

    proxy.web(req, res, {
      target: url.origin
    });

  } catch (e) {
    console.log(e);
    res.status(500).send('Proxy crash');
  }
});

/* ===== QUERY PROXY ===== */
app.all('/proxy', (req, res) => {
  const raw = req.query.url;

  if (!raw)
    return res.status(400).send('Missing url');

  try {
    const target = new URL(raw).toString();

    proxy.web(req, res, { target });

  } catch {
    res.status(400).send('Bad URL');
  }
});

/* ===== WEBSOCKET SUPPORT ===== */
server.on('upgrade', (req, socket, head) => {
  try {
    if (req.url.startsWith('/scramjet/')) {
      let encoded = req.url.replace('/scramjet/', '');
      let target = decodeURIComponent(encoded);
      let url = new URL(target);

      req.url = url.pathname + url.search;

      proxy.ws(req, socket, head, {
        target: url.origin
      });

      return;
    }

    const parsed = new URL(req.url, `http://${req.headers.host}`);
    const target = parsed.searchParams.get('url');

    if (!target)
      return socket.destroy();

    proxy.ws(req, socket, head, { target });

  } catch {
    socket.destroy();
  }
});

server.listen(3000, () => {
  console.log("✅ Local proxy running http://localhost:3000");
});