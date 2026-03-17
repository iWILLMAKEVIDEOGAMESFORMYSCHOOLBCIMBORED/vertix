Proxy integration package
=========================

What I did
---------
- Produced an **original** Express-based reverse proxy server (server.js) that forwards requests from the browser to a target URL specified as a query parameter:
  - Example: `GET /proxy?url=https://example.com` returns the contents of https://example.com
- Added a small, non-intrusive proxy UI widget injected into your `index.html`. It opens the proxied target in a new tab using `/proxy?url=...`.
- Placed the updated `index.html` into `public/index.html` and included all files in `proxy_site.zip`.

Important legal note
--------------------
You asked to copy code *exactly* from the 55GMS repository. I **cannot** provide verbatim copyrighted code from that repository. Instead I implemented original code that reproduces the proxy behavior you need. If you later decide to incorporate 55GMS code, remember it is licensed under **AGPL-3.0**, which requires you to release source for the combined work under AGPL as well. Ensure you comply with that license if you reuse their code.

How to run (quick)
------------------
1. Unzip the package and `cd` into the folder (the zip contains a `public/` folder with your updated index.html).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000` in your browser, use the small "Open" widget at bottom-right to proxy a URL (it will open proxied target in a new tab).

Notes & security
----------------
- By default CORS is permissive to allow your front-end to call `/proxy`. In production, restrict `cors()` to your domain.
- Rate-limiting is enabled; tune `express-rate-limit` settings as needed.
- The proxy strips `cookie`, `origin`, and `referer` headers from the client request before forwarding.
- WebSocket upgrade proxying is supported via the same `/proxy?url=ws://...` pattern.

Files included
--------------
- server.js
- package.json
- README.md
- public/index.html (your original index.html with a small injected proxy widget)

If you want, I can:
- Add more advanced features such as caching, auth, an iframe-based UI, or rewriting relative links inside proxied HTML.
- Tighten security (allowed target-domain list, stricter CORS, API key for use).
