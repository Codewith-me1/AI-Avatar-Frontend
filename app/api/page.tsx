"use client";

import Link from "next/link";
import {
  C,
  Callout,
  Code,
  DocsShell,
  Endpoints,
  H3,
  LI,
  P,
  Section,
  Table,
  UL,
  type DocSection,
} from "@/components/docs/DocsShell";

const SECTIONS: DocSection[] = [
  { id: "base", label: "Base URL" },
  { id: "auth", label: "Authentication" },
  { id: "conventions", label: "Conventions" },
  { id: "agents", label: "Agents" },
  { id: "chat", label: "Text chat" },
  { id: "knowledge", label: "Knowledge" },
  { id: "media", label: "Media" },
  { id: "tools", label: "Tools" },
  { id: "crm", label: "CRM & scheduling" },
  { id: "catalogues", label: "Avatars & voices" },
  { id: "sessions", label: "Conversations & analytics" },
  { id: "public", label: "Public endpoints" },
  { id: "settings", label: "Settings & support" },
  { id: "walkthrough", label: "End-to-end example" },
];

export default function ApiPage() {
  return (
    <DocsShell
      page="api"
      title="API reference"
      intro="Everything the dashboard does, it does through this HTTP API — so anything you see in the console you can automate. JSON in, JSON out, session-based auth."
      sections={SECTIONS}
    >
      {/* ── Base ─────────────────────────────────────────────── */}
      <Section id="base" title="Base URL">
        <Code label="base url">{`https://avatarx.net/api`}</Code>
        <P>
          The API and the app are served from the same origin, so requests from
          a signed-in browser session are same-site — there is no CORS
          configuration to maintain. From a server or script, call it directly.
        </P>
        <Callout kind="info" title="Interactive docs">
          A generated OpenAPI browser is available at <C>/docs</C> when the
          server runs with debug enabled. This page is the hand-written summary.
        </Callout>
      </Section>

      {/* ── Auth ─────────────────────────────────────────────── */}
      <Section id="auth" title="Authentication">
        <P>
          Sign in once and you get a server-side session. The response sets an
          HttpOnly <C>session_id</C> cookie <em>and</em> returns the same id in
          the body, so scripts that cannot hold cookies can send it as a bearer
          token instead. Both are accepted.
        </P>
        <Code label="sign in">{`curl -X POST https://avatarx.net/api/auth/login \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"you@example.com","password":"••••••••"}'

# {
#   "session_id": "…",
#   "token_type": "bearer",
#   "expires_at": "2026-10-21T09:12:00",
#   "user": { "id": "…", "email": "you@example.com", "is_superuser": false }
# }`}</Code>
        <Code label="authenticated request">{`curl https://avatarx.net/api/agents/ \\
  -H 'Authorization: Bearer YOUR_SESSION_ID'`}</Code>
        <P>
          Sessions are revocable server-side, so there is no refresh flow: a{" "}
          <C>401</C> means the session is gone and you should sign in again.
        </P>
        <Endpoints
          rows={[
            { m: "POST", path: "/api/auth/register", note: "Create an account" },
            { m: "POST", path: "/api/auth/login", note: "Start a session" },
            { m: "GET", path: "/api/auth/me", note: "Current user" },
            { m: "POST", path: "/api/auth/logout", note: "End this session" },
            { m: "POST", path: "/api/auth/logout-all", note: "End every session" },
            { m: "POST", path: "/api/auth/change-password", note: "Rotate the password" },
            { m: "GET", path: "/api/auth/sessions", note: "List active devices" },
            { m: "DELETE", path: "/api/auth/sessions/{session_id}", note: "Revoke one device" },
            { m: "GET", path: "/api/auth/google/url", note: "Google consent URL" },
            { m: "POST", path: "/api/auth/google/complete", note: "Finish a Google flow" },
          ]}
        />
      </Section>

      {/* ── Conventions ──────────────────────────────────────── */}
      <Section id="conventions" title="Conventions">
        <UL>
          <LI>
            Bodies are JSON unless the endpoint takes a file, in which case it is{" "}
            <C>multipart/form-data</C>.
          </LI>
          <LI>
            Ids are UUID strings. Everything is scoped to the caller: another
            account&apos;s agent returns <C>404</C>, never <C>403</C>.
          </LI>
          <LI>
            Errors carry a <C>detail</C> field. Validation errors return{" "}
            <C>422</C> with an array of field problems.
          </LI>
          <LI>
            Deletes answer <C>204</C> with no body. Long jobs (indexing,
            crawling, avatar prep) answer <C>202</C> and you poll for status.
          </LI>
          <LI>
            On <C>PATCH</C>, an omitted key is left alone and an explicit{" "}
            <C>null</C> clears the column — that is how you remove a word cap or
            a topic list.
          </LI>
        </UL>
        <Code label="error shape">{`{ "detail": "Agent not found" }`}</Code>
      </Section>

      {/* ── Agents ───────────────────────────────────────────── */}
      <Section id="agents" title="Agents">
        <Endpoints
          rows={[
            { m: "GET", path: "/api/agents/", note: "List your agents" },
            { m: "POST", path: "/api/agents/", note: "Create one" },
            { m: "GET", path: "/api/agents/{agent_id}", note: "Fetch one" },
            { m: "PATCH", path: "/api/agents/{agent_id}", note: "Update" },
            { m: "DELETE", path: "/api/agents/{agent_id}", note: "Delete" },
            { m: "GET", path: "/api/agents/templates", note: "Starter templates" },
            { m: "GET", path: "/api/agents/{agent_id}/effective-prompt", note: "Composed prompt + temperature" },
          ]}
        />
        <H3>Creating an agent</H3>
        <P>
          Only <C>name</C> and <C>system_prompt</C> are required. Send behaviour
          as structured fields — role, personality, topics to avoid and the word
          cap are composed into the prompt server-side at call time, so they stay
          readable and editable instead of being baked into prose.
        </P>
        <Code label="POST /api/agents/">{`{
  "name": "Support desk",
  "system_prompt": "You help visitors with billing and account questions.",
  "personality": "Friendly and Professional",
  "agent_role": "Customer support specialist",
  "language": "en",
  "voice_id": "db6b0ed5-d5d3-463d-ae85-518a07d3c2b4",
  "musetalk_avatar_id": "ava",
  "llm_provider": "openai",
  "llm_model": "gpt-4o",
  "creativity": 0.4,
  "knowledge_mode": "strict",
  "greeting": "Hi! How can I help today?",
  "conversation_starters": ["Where is my order?", "How do I cancel?"],
  "topics_to_avoid": ["competitor pricing"],
  "max_response_words": 80,
  "is_public": true
}`}</Code>
        <Table
          head={["Field", "Type", "Notes"]}
          rows={[
            [<C key="c">creativity</C>, "0–1", "Maps to model temperature; effective_temperature is returned."],
            [<C key="km">knowledge_mode</C>, `"strict" | "hybrid"`, "Alias for restrict_to_knowledge."],
            [<C key="ta">topics_to_avoid</C>, "string[] | null", "≤ 20 items, ≤ 80 chars each."],
            [<C key="cs">conversation_starters</C>, "string[] | null", "≤ 4 items, ≤ 120 chars each."],
            [<C key="mw">max_response_words</C>, "int | null", "10–500, or null for no cap."],
            [<C key="pr">pronunciations</C>, "{ word, say_as }[]", "≤ 50 entries."],
            [<C key="ip">is_public</C>, "bool", "Must be true for the embeddable widget to load."],
          ]}
        />
      </Section>

      {/* ── Chat ─────────────────────────────────────────────── */}
      <Section id="chat" title="Text chat">
        <Endpoints
          rows={[
            { m: "POST", path: "/api/agents/preview/chat", note: "Try an unsaved prompt" },
            { m: "POST", path: "/api/agents/{agent_id}/chat", note: "Chat with a real agent" },
          ]}
        />
        <P>
          The agent endpoint composes the prompt, retrieves from the knowledge
          base and matches media, returning the reply plus whatever it decided to
          show. The preview endpoint persists nothing and is rate-limited to 20
          messages a minute per user.
        </P>
        <Code label="POST /api/agents/{agent_id}/chat">{`{ "messages": [{ "role": "user", "content": "do you ship to Spain?" }] }

# {
#   "reply": "Yes — standard delivery to Spain takes 3–5 days.",
#   "media": { "id": "…", "kind": "image", "title": "Shipping rates", "url": "/api/media/…/file" },
#   "used_knowledge": true
# }`}</Code>
      </Section>

      {/* ── Knowledge ────────────────────────────────────────── */}
      <Section id="knowledge" title="Knowledge">
        <Endpoints
          rows={[
            { m: "GET", path: "/api/knowledge/agents/{agent_id}/summary", note: "Counts per source" },
            { m: "POST", path: "/api/knowledge/agents/{agent_id}/bootstrap", note: "Text + URLs in one call" },
            { m: "GET", path: "/api/knowledge/agents/{agent_id}/search?q=&k=", note: "What the agent would retrieve" },
            { m: "GET", path: "/api/knowledge/agents/{agent_id}/kb/", note: "List knowledge bases" },
            { m: "POST", path: "/api/knowledge/agents/{agent_id}/kb/", note: "Create one" },
            { m: "PATCH", path: "/api/knowledge/agents/{agent_id}/kb/{kb_id}", note: "Rename" },
            { m: "DELETE", path: "/api/knowledge/agents/{agent_id}/kb/{kb_id}", note: "Delete" },
            { m: "POST", path: "/api/knowledge/agents/{agent_id}/kb/{kb_id}/documents", note: "Upload a file (multipart)" },
            { m: "POST", path: "/api/knowledge/agents/{agent_id}/kb/{kb_id}/documents/text", note: "Add pasted text" },
            { m: "GET", path: "/api/knowledge/agents/{agent_id}/kb/{kb_id}/documents", note: "List documents" },
            { m: "GET", path: "/api/knowledge/agents/{agent_id}/kb/{kb_id}/documents/{doc_id}/content", note: "Read full text" },
            { m: "PUT", path: "/api/knowledge/agents/{agent_id}/kb/{kb_id}/documents/{doc_id}/content", note: "Edit + re-embed" },
            { m: "PATCH", path: "/api/knowledge/agents/{agent_id}/kb/{kb_id}/documents/{doc_id}", note: "Rename only" },
            { m: "POST", path: "/api/knowledge/agents/{agent_id}/kb/{kb_id}/documents/{doc_id}/reindex", note: "Re-run indexing" },
            { m: "DELETE", path: "/api/knowledge/agents/{agent_id}/kb/{kb_id}/documents/{doc_id}", note: "Delete a document" },
            { m: "POST", path: "/api/knowledge/agents/{agent_id}/kb/from-url", note: "Attach a website" },
            { m: "GET", path: "/api/knowledge/agents/{agent_id}/kb/from-url/status", note: "Crawl status" },
            { m: "POST", path: "/api/knowledge/agents/{agent_id}/kb/{kb_id}/recrawl", note: "Re-crawl" },
          ]}
        />
        <P>
          <C>bootstrap</C> is the one to use when setting an agent up: it creates
          the default knowledge base if absent, stores pasted text, queues a crawl
          per URL, and reports each part separately.
        </P>
        <Code label="POST …/bootstrap">{`{
  "text": "We ship worldwide. Returns accepted within 30 days.",
  "urls": ["https://example.com/faq"],
  "restrict_to_knowledge": true
}

# 202 { "kb_id": "…", "created": { "text": true, "urls": ["https://example.com/faq"] }, "errors": [] }`}</Code>
        <P>
          Uploads accept PDF, TXT, MD and DOCX up to 20 MB. Documents return{" "}
          <C>pending</C> → <C>processing</C> → <C>ready</C>; poll the document
          list while anything is in flight.
        </P>
      </Section>

      {/* ── Media ────────────────────────────────────────────── */}
      <Section id="media" title="Media">
        <Endpoints
          rows={[
            { m: "GET", path: "/api/agents/{agent_id}/media", note: "List items" },
            { m: "POST", path: "/api/agents/{agent_id}/media", note: "Upload a file, or JSON for a link" },
            { m: "PATCH", path: "/api/agents/{agent_id}/media/{media_id}", note: "Edit title, keywords, order" },
            { m: "DELETE", path: "/api/agents/{agent_id}/media/{media_id}", note: "Delete (also unlinks the file)" },
            { m: "GET", path: "/api/media/{media_id}/file", note: "Stream the file — public for a public agent" },
          ]}
        />
        <Code label="POST …/media (multipart)">{`curl -X POST https://avatarx.net/api/agents/AGENT_ID/media \\
  -H 'Authorization: Bearer YOUR_SESSION_ID' \\
  -F 'file=@spring-flyer.png' \\
  -F 'title=Spring flyer' \\
  -F 'trigger_keywords=flyer,offers,discount' \\
  -F 'show_by_default=false'`}</Code>
        <P>
          PNG, JPG, WEBP, GIF, SVG, PDF, MP4 and WEBM are accepted, up to 25 MB
          and 50 items per agent.
        </P>
      </Section>

      {/* ── Tools ────────────────────────────────────────────── */}
      <Section id="tools" title="Tools">
        <Endpoints
          rows={[
            { m: "GET", path: "/api/tools", note: "System + custom tools" },
            { m: "POST", path: "/api/tools", note: "Create a webhook tool" },
            { m: "PATCH", path: "/api/tools/{tool_id}", note: "Update (custom only)" },
            { m: "DELETE", path: "/api/tools/{tool_id}", note: "Delete (custom only)" },
            { m: "POST", path: "/api/tools/{tool_id}/test", note: "Dry-run against the real endpoint" },
            { m: "GET", path: "/api/agents/{agent_id}/tools", note: "What this agent runs with" },
            { m: "PUT", path: "/api/agents/{agent_id}/tools", note: "Replace the attached set" },
          ]}
        />
        <Code label="POST /api/tools">{`{
  "name": "check_order_status",
  "description": "Look up an order by its number. Call this whenever a caller asks where their order is.",
  "method": "POST",
  "url": "https://api.example.com/orders/status",
  "auth_type": "bearer",
  "auth_config": { "token": "•••" },
  "timeout_seconds": 10,
  "parameters": {
    "type": "object",
    "properties": { "order_number": { "type": "string" } },
    "required": ["order_number"]
  }
}`}</Code>
        <P>
          <C>auth_config</C> is write-only: it is stored encrypted and never
          returned. Responses carry <C>auth_type</C> and a{" "}
          <C>has_credentials</C> flag instead. System tools appear with{" "}
          <C>system:</C> ids and cannot be edited or deleted.
        </P>
        <Callout kind="warn" title="Outbound guard">
          Tool URLs must be HTTPS and must not resolve to loopback, private,
          link-local or CGNAT ranges — checked again after redirects, with at
          most two hops, a 32 KB response cap and a 30 second ceiling.
        </Callout>
      </Section>

      {/* ── CRM ──────────────────────────────────────────────── */}
      <Section id="crm" title="CRM & scheduling">
        <Endpoints
          rows={[
            { m: "GET", path: "/api/agents/{agent_id}/crm/settings", note: "Capabilities + scheduling rules" },
            { m: "PUT", path: "/api/agents/{agent_id}/crm/settings", note: "Update them" },
            { m: "GET", path: "/api/agents/{agent_id}/crm/summary", note: "Counters" },
            { m: "GET", path: "/api/agents/{agent_id}/crm/leads", note: "List leads" },
            { m: "POST", path: "/api/agents/{agent_id}/crm/leads", note: "Create manually" },
            { m: "PATCH", path: "/api/agents/{agent_id}/crm/leads/{lead_id}", note: "Edit status or fields" },
            { m: "DELETE", path: "/api/agents/{agent_id}/crm/leads/{lead_id}", note: "Delete" },
            { m: "GET", path: "/api/agents/{agent_id}/crm/leads/export/csv", note: "CSV export" },
            { m: "GET", path: "/api/agents/{agent_id}/crm/appointments", note: "List bookings" },
            { m: "POST", path: "/api/agents/{agent_id}/crm/appointments", note: "Book manually" },
            { m: "PATCH", path: "/api/agents/{agent_id}/crm/appointments/{appt_id}", note: "Cancel / complete / no-show" },
            { m: "GET", path: "/api/agents/{agent_id}/crm/availability", note: "Free slots the agent would offer" },
          ]}
        />
        <Code label="PUT …/crm/settings">{`{
  "enable_lead_capture": true,
  "enable_appointments": true,
  "enable_human_handoff": true,
  "meet_link": "meet.google.com/abc-defg-hij",
  "appointment_config": {
    "timezone": "Europe/Madrid",
    "slot_minutes": 30,
    "buffer_minutes": 10,
    "min_notice_minutes": 60,
    "max_days_ahead": 14,
    "business_hours": {
      "mon": [["09:00", "13:00"], ["14:00", "17:00"]],
      "tue": [["09:00", "17:00"]],
      "sat": [], "sun": []
    }
  }
}`}</Code>
      </Section>

      {/* ── Catalogues ───────────────────────────────────────── */}
      <Section id="catalogues" title="Avatars & voices">
        <Endpoints
          rows={[
            { m: "GET", path: "/api/avatars/catalogue", note: "Every avatar you can pick" },
            { m: "GET", path: "/api/avatars/mine", note: "Your uploads and their status" },
            { m: "POST", path: "/api/avatars/", note: "Upload one (multipart)" },
            { m: "GET", path: "/api/avatars/{avatar_id}/preview", note: "Preview image" },
            { m: "DELETE", path: "/api/avatars/{avatar_id}", note: "Delete" },
            { m: "GET", path: "/api/voices/", note: "Available voices" },
            { m: "GET", path: "/api/voices/preview?url=", note: "Stream a voice sample" },
          ]}
        />
        <Callout kind="info" title="Custom avatars are not finished">
          Uploads are stored and tracked, but there is no preparation pipeline
          yet: photo avatars settle as ready and video uploads come back failed
          with an explanation. The gallery avatars work today.
        </Callout>
      </Section>

      {/* ── Sessions ─────────────────────────────────────────── */}
      <Section id="sessions" title="Conversations & analytics">
        <Endpoints
          rows={[
            { m: "GET", path: "/api/conversations/sessions", note: "List conversations" },
            { m: "GET", path: "/api/conversations/sessions/{session_id}", note: "One conversation + messages" },
            { m: "POST", path: "/api/conversations/sessions", note: "Open a session" },
            { m: "POST", path: "/api/conversations/sessions/{session_id}/messages", note: "Append a message" },
            { m: "POST", path: "/api/conversations/sessions/{session_id}/end", note: "Close it" },
            { m: "GET", path: "/api/analytics/overview", note: "Headline numbers" },
            { m: "GET", path: "/api/analytics/timeseries", note: "Volume over time" },
            { m: "GET", path: "/api/analytics/agents", note: "Per-agent breakdown" },
            { m: "GET", path: "/api/credits/{agent_id}/balance", note: "Remaining minutes" },
            { m: "POST", path: "/api/credits/{agent_id}/topup", note: "Add minutes" },
          ]}
        />
        <P>
          Live calls are brokered by <C>POST /api/livekit/join</C>, which checks
          credits, issues a room token and dispatches the agent worker. It
          answers <C>402</C> with <C>credits_exhausted</C> when the balance is
          gone.
        </P>
      </Section>

      {/* ── Public ───────────────────────────────────────────── */}
      <Section id="public" title="Public endpoints">
        <P>
          These need no session — they are what the embedded widget calls from a
          visitor&apos;s browser.
        </P>
        <Endpoints
          rows={[
            { m: "GET", path: "/api/widget/{agent_id}/config", note: "Name, greeting, starters, media, avatar, voice" },
            { m: "GET", path: "/api/widget/{agent_id}/onboarding", note: "Whether to show the pre-chat form" },
            { m: "POST", path: "/api/widget/{agent_id}/onboarding", note: "Save visitor answers" },
            { m: "GET", path: "/api/media/{media_id}/file", note: "Media file for a public agent" },
            { m: "GET", path: "/health", note: "Service health" },
          ]}
        />
        <P>
          The config endpoint only serves agents that are public and active, and
          never returns the system prompt or any account data.
        </P>
      </Section>

      {/* ── Settings ─────────────────────────────────────────── */}
      <Section id="settings" title="Settings & support">
        <Endpoints
          rows={[
            { m: "GET", path: "/api/settings/smtp", note: "Outbound email config (password never returned)" },
            { m: "PUT", path: "/api/settings/smtp", note: "Update it" },
            { m: "POST", path: "/api/settings/smtp/test", note: "Send a test message" },
            { m: "DELETE", path: "/api/settings/smtp", note: "Remove it" },
            { m: "GET", path: "/api/settings/google", note: "Calendar connection status" },
            { m: "DELETE", path: "/api/settings/google", note: "Disconnect" },
            { m: "GET", path: "/api/tickets", note: "Your support tickets" },
            { m: "POST", path: "/api/tickets", note: "Open one" },
            { m: "POST", path: "/api/tickets/{ticket_id}/reply", note: "Reply" },
            { m: "POST", path: "/api/tickets/{ticket_id}/close", note: "Close" },
          ]}
        />
        <P>
          Administrator accounts have a further <C>/api/admin/*</C> surface
          (accounts, agents, sessions, audit log, health, tickets) which always
          requires a real superuser session.
        </P>
      </Section>

      {/* ── Walkthrough ──────────────────────────────────────── */}
      <Section id="walkthrough" title="End-to-end example">
        <P>Sign in, create an agent, give it knowledge, and check what it retrieves.</P>
        <Code label="bash">{`BASE=https://avatarx.net/api

# 1. sign in
SID=$(curl -s -X POST $BASE/auth/login \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"you@example.com","password":"••••••••"}' | jq -r .session_id)
AUTH="Authorization: Bearer $SID"

# 2. create the agent
AID=$(curl -s -X POST $BASE/agents/ -H "$AUTH" -H 'Content-Type: application/json' \\
  -d '{
        "name":"Support desk",
        "system_prompt":"You help visitors with billing and account questions.",
        "knowledge_mode":"strict",
        "greeting":"Hi! How can I help today?",
        "is_public":true
      }' | jq -r .id)

# 3. give it something to know
curl -s -X POST $BASE/knowledge/agents/$AID/bootstrap -H "$AUTH" \\
  -H 'Content-Type: application/json' \\
  -d '{"text":"Refunds are issued within 30 days of purchase.","urls":[]}'

# 4. see what it would retrieve (indexing takes a moment)
curl -s -G $BASE/knowledge/agents/$AID/search -H "$AUTH" --data-urlencode 'q=refund window'

# 5. talk to it
curl -s -X POST $BASE/agents/$AID/chat -H "$AUTH" -H 'Content-Type: application/json' \\
  -d '{"messages":[{"role":"user","content":"can I get a refund after 3 weeks?"}]}'`}</Code>
        <P>
          Then embed it — see{" "}
          <Link className="underline" href="/doc#embed">
            Embedding the widget
          </Link>
          .
        </P>
      </Section>
    </DocsShell>
  );
}
