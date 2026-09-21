# Frontend deployment — avatarx.net

Live runbook for the Next.js console on the VPS that already runs the API.
Everything below is what is actually deployed, not a plan.

- **Server**: `169.58.199.142` (Ubuntu 24.04, 12 GB RAM, 193 GB disk)
- **Domain**: `https://avatarx.net` (+ `www`)
- **Repo**: <https://github.com/Codewith-me1/AI-Avatar-Frontend> (`main`)
- **App path**: `/home/aiavatar/frontend` (owned by `aiavatar`, the same user the API runs as)
- **Service**: `avatar-frontend.service` → `next start -p 3000 -H 127.0.0.1`
- **Deployed commit**: `5ecdb01`

---

## 1. Architecture: one origin, no backend changes

The API is **not** called cross-site. nginx serves the app and the API from the
same host, so the browser never makes a cross-origin request:

```
avatarx.net/            → 127.0.0.1:3000   (Next.js, this repo)
avatarx.net/api/*       → 127.0.0.1:8000   (existing FastAPI, untouched)
avatarx.net/ws/*        → 127.0.0.1:8000   (realtime gateway, WebSocket upgrade)
avatarx.net/health      → 127.0.0.1:8000
avatarx.net/docs,/openapi.json,/redoc → 127.0.0.1:8000
```

`.env.production` is therefore just:

```
NEXT_PUBLIC_API_URL=https://avatarx.net
```

Why this shape matters:

- **No CORS edit, no API restart.** `core/config.py` ships
  `ALLOWED_ORIGINS = [localhost:3000, …vercel.app]`, which does **not** include
  `avatarx.net`. Pointing the app at `https://avat.gigatechservices.org`
  instead would have meant editing the backend's allow-list and restarting
  `aichatbot.service`. Same-origin sidesteps it entirely — CORS does not apply.
- **The session cookie becomes first-party.** The API sets an HttpOnly
  `session_id` cookie; served from a second domain it was third-party and
  blocked by many browsers, which is why `lib/api/client.ts` mirrors the token
  into `sessionStorage` as a fallback. On one origin the cookie just works.
- `avat.gigatechservices.org` keeps working exactly as before — its server
  block and the `444` catch-all were not modified. Only a new block was added,
  and nginx was **reloaded**, never restarted.

---

## 2. What was installed

| Change | Detail |
|---|---|
| Node.js 22 LTS | NodeSource; `node v22.23.2`, `npm 10.9.8`. Nothing else on the box uses Node. |
| `/home/aiavatar/frontend` | `git clone` of this repo, `npm ci`, `npm run build` — all as `aiavatar` |
| `/etc/systemd/system/avatar-frontend.service` | enabled + started (survives reboot), bound to loopback only |
| `/etc/nginx/sites-available/avatarx` (+ `sites-enabled` symlink) | the server block above |
| `/usr/local/bin/avatar-frontend-update` | pull → build → restart → smoke-test |

Untouched: `aichatbot.service`, `agent-worker.service`, `celery-worker.service`,
postgres, redis, the backend's `.env`, and the existing nginx site.

---

## 3. Remaining steps (need access I don't have)

### 3a. Point DNS at the server — **required**

`avatarx.net` currently resolves to `15.197.148.33` / `3.33.130.190` (registrar
parking), not to the VPS. At the registrar, set:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | `169.58.199.142` | 300 |
| A | `www` | `169.58.199.142` | 300 |

Remove any conflicting A/AAAA/ALIAS records for those names. Check with:

```bash
dig +short avatarx.net    # expect 169.58.199.142
```

### 3b. Issue the TLS certificate — after 3a resolves

```bash
ssh root@169.58.199.142
certbot --nginx -d avatarx.net -d www.avatarx.net --redirect \
        --agree-tos -m you@yourdomain.com --no-eff-email
nginx -t && systemctl reload nginx
curl -sI https://avatarx.net/login | head -1
```

Certbot adds the `443` block and an HTTP→HTTPS redirect to
`/etc/nginx/sites-available/avatarx`. Renewal is already automatic
(`certbot.timer`) — the same timer that renews the API's certificate.

Until the certificate exists, the site answers on plain HTTP only, and login
will not persist across reloads (the API sets `Secure` cookies because
`COOKIE_SECURE=1`; the `sessionStorage` fallback still carries the session
within a tab).

### 3c. Google sign-in redirect — needs a backend touch

The backend's `.env` has:

```
GOOGLE_REDIRECT_URI=https://ai-avatar-frontend-xi.vercel.app/auth/google/callback
```

Google login and "Connect Google Calendar" will bounce back to the old Vercel
deployment until this points at the new domain. Two coordinated changes:

1. In the Google Cloud console → OAuth client → Authorised redirect URIs, add
   `https://avatarx.net/auth/google/callback`.
2. On the server:
   ```bash
   sed -i 's#^GOOGLE_REDIRECT_URI=.*#GOOGLE_REDIRECT_URI=https://avatarx.net/auth/google/callback#' \
       /home/aiavatar/aichatbot/.env
   systemctl restart aichatbot.service     # ~2s of API downtime
   ```

This is the one item that requires restarting the API, so it was left alone.
Email/password login is unaffected.

---

## 4. Day-to-day

```bash
# Deploy whatever is on main
avatar-frontend-update

# Status / logs
systemctl status avatar-frontend.service
journalctl -u avatar-frontend.service -f
journalctl -u avatar-frontend.service --since '15 min ago' | tail -50

# Restart just the UI (never needed for API changes)
systemctl restart avatar-frontend.service

# Roll back to a known commit
runuser -u aiavatar -- env HOME=/home/aiavatar git -C /home/aiavatar/frontend checkout <sha>
cd /home/aiavatar/frontend && runuser -u aiavatar -- env HOME=/home/aiavatar npm ci && \
  runuser -u aiavatar -- env HOME=/home/aiavatar npm run build && \
  systemctl restart avatar-frontend.service
```

### Verifying without DNS

Every check below passes on the server today:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: avatarx.net' http://127.0.0.1/login
curl -s -H 'Host: avatarx.net' http://127.0.0.1/api/agents/templates | head -c 80
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: avatarx.net' http://127.0.0.1/api/tools
```

Locally you can preview the real domain before DNS moves:

```bash
curl --resolve avatarx.net:80:169.58.199.142 http://avatarx.net/login
```

or add `169.58.199.142 avatarx.net` to your hosts file.

---

## 5. Verified on deploy (2026-09-21)

| Check | Result |
|---|---|
| `/`, `/login`, `/dashboard`, `/dashboard/tools`, `/dashboard/avatars`, `/widget/test` | `200` |
| `/components/widget/widget.js` (embed script) | `200`, 140 KB |
| `/health`, `/api/agents/templates`, `/api/settings/google` | `200` via the same origin |
| `/api/tools`, `/api/avatars/catalogue`, `/api/agents/` | `200` — the new routes answer |
| `https://avat.gigatechservices.org/health` + `/api/agents/templates` | `200` — unchanged |
| Bare IP `http://169.58.199.142/` | closed (`444`), as before |
| `aichatbot`, `agent-worker`, `celery-worker`, `nginx`, `avatar-frontend` | all `active` |

---

## 6. Housekeeping

- **Rotate the root password.** It was shared in plain text; change it
  (`passwd`) and preferably move to key-only auth:
  `PasswordAuthentication no` in `/etc/ssh/sshd_config.d/`, then
  `systemctl restart ssh`.
- The end-of-call **feedback screen** in the widget collects a rating and
  dispatches a `voiceagent:feedback` DOM event on the host page; nothing stores
  it yet. Needs an endpoint (e.g. `POST /api/conversations/sessions/{id}/feedback`).
- Custom **avatar creation** is deliberately labelled "coming soon"
  (`CREATE_ENABLED = false` in `app/dashboard/avatars/page.tsx`) because the
  server has no avatar-preparation pipeline; flip that constant when it does.
- MuseTalk preview filenames from `GET /api/avatars/catalogue` are derived from
  display names (`/avatars/Sidhart.png`) and don't always match the bundled
  assets (`sidharth.png`). The frontend resolves known ids locally, but the
  server-side list is worth correcting.
