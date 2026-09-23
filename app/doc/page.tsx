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
  Steps,
  Table,
  UL,
  type DocSection,
} from "@/components/docs/DocsShell";

const SECTIONS: DocSection[] = [
  { id: "overview", label: "Overview" },
  { id: "quick-start", label: "Quick start" },
  { id: "wizard", label: "Building an agent" },
  { id: "knowledge", label: "Knowledge base" },
  { id: "tools", label: "Tools & capabilities" },
  { id: "media", label: "Media in chat" },
  { id: "embed", label: "Embedding the widget" },
  { id: "conversations", label: "Conversations & CRM" },
  { id: "account", label: "Account settings" },
  { id: "credits", label: "Credits" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

export default function DocPage() {
  return (
    <DocsShell
      page="doc"
      title="How avatarx works"
      intro="avatarx turns a prompt, a face and your own documents into a realtime avatar that talks with visitors on your site — by voice or by typing. This guide covers everything from the first agent to the embed snippet."
      sections={SECTIONS}
    >
      {/* ── Overview ─────────────────────────────────────────── */}
      <Section id="overview" title="Overview">
        <P>
          An <strong>agent</strong> is the unit you build and deploy. It carries a
          face, a voice, a personality and a prompt, optionally a knowledge base
          of your own content, and a set of tools it may use mid-conversation.
          Once it is published you drop one script tag on any page and visitors
          can talk to it.
        </P>
        <Table
          head={["Piece", "What it does"]}
          rows={[
            [<strong key="a">Agent</strong>, "Face, voice, language, prompt, model and behaviour rules."],
            [<strong key="k">Knowledge base</strong>, "Documents, pasted text and crawled pages the agent can quote from."],
            [<strong key="t">Tools</strong>, "Actions it can take: capture a lead, book a meeting, hand over to a person, call your webhook."],
            [<strong key="m">Media</strong>, "Flyers, cards or price lists it can put on screen during a conversation."],
            [<strong key="w">Widget</strong>, "The embeddable launcher, avatar view and chat panel your visitors use."],
          ]}
        />
        <Callout kind="info" title="Two ways to talk to an agent">
          Visitors can speak to it (microphone in, voice and lip-synced video
          out) or type in the chat panel. Both run against the same prompt,
          knowledge base and tools.
        </Callout>
      </Section>

      {/* ── Quick start ──────────────────────────────────────── */}
      <Section id="quick-start" title="Quick start">
        <Steps
          items={[
            {
              title: "Create an agent",
              body: (
                <>
                  Go to <Link className="underline" href="/dashboard/agents">Agents</Link>{" "}
                  and press <strong>New agent</strong>, or start from one of the
                  templates (Lila, Alex, Emma, Jack) to pre-fill the wizard.
                </>
              ),
            },
            {
              title: "Work through the five tabs",
              body: "Avatar, Voice, Behavior, Knowledge and Conversation. Only a name and a prompt are required; everything else has a sensible default and stays editable later.",
            },
            {
              title: "Try it in the preview",
              body: "The right-hand panel talks to the real model with the prompt you are writing, so you can feel the tone before you create anything.",
            },
            {
              title: "Create, then copy the embed snippet",
              body: "Creating the agent indexes any knowledge you staged and hands you the script tag.",
            },
            {
              title: "Test it in the sandbox",
              body: (
                <>
                  <strong>Launch sandbox</strong> on the agent card runs the real
                  widget against your agent, so you see exactly what a visitor
                  will get.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ── Wizard ───────────────────────────────────────────── */}
      <Section id="wizard" title="Building an agent">
        <P>
          The wizard and the agent settings page hold the same fields, so
          anything you set while creating can be changed afterwards.
        </P>

        <H3>Avatar</H3>
        <P>
          Name, a short description, and the face. The gallery lists the
          built-in video avatars; the one you pick streams live and lip-syncs to
          the agent&apos;s speech.
        </P>

        <H3>Voice</H3>
        <UL>
          <LI>
            <strong>Language</strong> — the language the agent speaks.
          </LI>
          <LI>
            <strong>Voice</strong> — pick one and press preview to hear it.
          </LI>
          <LI>
            <strong>Pronunciation dictionary</strong> — for names, brands and
            acronyms it gets wrong. Give the word and how to say it
            (<C>AVAT</C> → <C>ay-vat</C>).
          </LI>
        </UL>

        <H3>Behavior</H3>
        <UL>
          <LI>
            <strong>Agent role</strong> and <strong>personality</strong> — a
            sentence of context and a tone.
          </LI>
          <LI>
            <strong>Agent prompt</strong> — the instructions. Write only the
            instructions here: role, personality, topics to avoid and the
            response-length cap are folded in automatically at call time. Use{" "}
            <em>View the composed prompt</em> on the settings page to see the
            exact text the live agent receives.
          </LI>
          <LI>
            <strong>Creativity</strong> — from more predictable to more diverse.
            It sets the model temperature; the settings page shows the resulting
            value.
          </LI>
          <LI>
            <strong>Model</strong> — GPT-4o, GPT-4o mini, Claude 3.5 Sonnet or
            Haiku.
          </LI>
        </UL>

        <H3>Conversation</H3>
        <Table
          head={["Setting", "Effect", "Limits"]}
          rows={[
            ["Greeting", "The first thing the agent says, spoken and in chat.", "≤ 500 characters"],
            ["Conversation starters", "Suggested questions shown as chips when the chat opens.", "up to 4, ≤ 120 chars each"],
            ["Topics to avoid", "The agent declines these and steers back.", "up to 20, ≤ 80 chars each"],
            ["Limit response length", "Caps words per reply — useful for spoken answers.", "10–500 words"],
            ["Enable camera", "Allows live video input in the widget.", "—"],
            ["End-of-call feedback", "Shows a rating screen when the call ends.", "—"],
            ["Agent memory", "Recalls a returning visitor's earlier conversations.", "last ~10 turns"],
            ["Share memory across agents", "Widens that recall to every agent you own.", "—"],
          ]}
        />
        <Callout kind="warn" title="Changes apply to the next conversation">
          Tools and prompts are bound when a session starts, so a call already in
          progress keeps the settings it began with.
        </Callout>
      </Section>

      {/* ── Knowledge ────────────────────────────────────────── */}
      <Section id="knowledge" title="Knowledge base">
        <P>
          Give the agent your own content and it answers from that instead of
          guessing. Everything you add is chunked, embedded and searchable — and
          stays editable.
        </P>

        <H3>Sources</H3>
        <UL>
          <LI>
            <strong>Files</strong> — PDF, TXT, MD or DOCX, up to 20 MB each.
          </LI>
          <LI>
            <strong>Pasted text</strong> — FAQs, policies, price lists. Saved as
            its own document so you can edit it later.
          </LI>
          <LI>
            <strong>A website</strong> — index a single page, or follow links to
            crawl up to 50 pages, 2 levels deep. Re-crawl any time.
          </LI>
        </UL>

        <H3>Strict or hybrid</H3>
        <P>
          <strong>Strict</strong> means the agent answers only from the knowledge
          base and politely declines anything it does not cover — the right
          setting for support and compliance. <strong>Hybrid</strong> lets it
          interpret around the facts conversationally.
        </P>

        <H3>Editing what it knows</H3>
        <P>
          Open <Link className="underline" href="/dashboard/knowledge">Knowledge</Link>,
          pick an agent, and you can edit any document&apos;s text, rename it,
          re-index it, or delete it. Saving re-chunks and re-embeds that document
          and removes the old vectors, so a fact you delete stops being
          retrievable rather than lingering in the index.
        </P>
        <Callout kind="tip" title="Test retrieval before blaming the prompt">
          The <strong>Test retrieval</strong> button shows the exact excerpts the
          agent would receive for a question. If the answer is not in there, the
          agent never had it — add or edit a document rather than rewriting the
          prompt.
        </Callout>
      </Section>

      {/* ── Tools ────────────────────────────────────────────── */}
      <Section id="tools" title="Tools & capabilities">
        <P>
          Tools are real functions, not prompt suggestions. A disabled capability
          is not merely discouraged — the model has no way to call it.
        </P>

        <H3>Always on</H3>
        <Table
          head={["Tool", "What it does"]}
          rows={[
            [<C key="e">end_call</C>, "Ends the conversation politely and closes the session when the visitor says goodbye."],
            [<C key="s">skip_turn</C>, "Stays silent for a turn when the visitor is still speaking or needs a moment."],
          ]}
        />

        <H3>Capabilities you switch on per agent</H3>
        <Table
          head={["Capability", "Functions", "Notes"]}
          rows={[
            [
              <strong key="l">Lead capture</strong>,
              <C key="lf">save_lead_details</C>,
              "Records name, email, phone, company and interest as they come up, merging across the conversation. Leads land in the CRM.",
            ],
            [
              <strong key="a">Appointments</strong>,
              <span key="af" className="text-[12.5px]">
                check_appointment_availability, book_appointment,
                check_existing_appointment, cancel_appointment
              </span>,
              "Offers free slots from your business hours, books them, and emails a confirmation.",
            ],
            [
              <strong key="h">Human handoff</strong>,
              <C key="hf">request_human_handoff</C>,
              "Records a reason, promotes the lead to qualified and emails you. Needs outbound email configured to actually notify.",
            ],
          ]}
        />

        <H3>Scheduling rules</H3>
        <P>
          When appointments are on you set the timezone, appointment length, gap
          between bookings, earliest bookable time, how far ahead visitors may
          book, and business hours — including a second window per day for a
          lunch break. The preview under the form shows the exact slots visitors
          will be offered, which is the fastest way to catch hours that are too
          tight.
        </P>
        <P>
          Connect <strong>Google Calendar</strong> and every booking gets its own
          calendar event and a unique Meet link. Without it, bookings reuse the
          static Meet room you set on the agent.
        </P>

        <H3>Custom webhook tools</H3>
        <P>
          Under <Link className="underline" href="/dashboard/tools">Tools</Link> →{" "}
          <strong>Custom tools</strong> you can define an HTTPS endpoint the model
          may call: give it a snake_case name, a description (this is what the
          model reads to decide when to call it), the URL and method, an optional
          JSON Schema for its arguments, and credentials if it needs them. Then
          attach it to an agent from that agent&apos;s Tools tab.
        </P>
        <Callout kind="warn" title="What a custom tool may reach">
          A tool URL invoked by a model is a server-side request with
          model-supplied arguments, so it must be public HTTPS. Requests to
          loopback, private, link-local and CGNAT addresses are refused — in a
          test run and in a live call alike. Credentials are stored encrypted and
          never returned by the API, responses are capped, and the timeout is at
          most 30 seconds.
        </Callout>
      </Section>

      {/* ── Media ────────────────────────────────────────────── */}
      <Section id="media" title="Media in chat">
        <P>
          Agents can show things, not just talk about them. Add a flyer, business
          card, menu or price list on the agent&apos;s <strong>Media</strong> tab
          and it appears as a card in the chat panel when it is relevant.
        </P>
        <UL>
          <LI>
            Images, PDFs, MP4/WEBM or an external link — up to 25 MB each, 50 per
            agent.
          </LI>
          <LI>
            The <strong>title</strong> and <strong>trigger keywords</strong> are
            how the agent decides an item is the right one, so name things the way
            visitors ask for them.
          </LI>
          <LI>
            <strong>Show at the start</strong> puts an item on screen right after
            the greeting — good for a business card.
          </LI>
        </UL>
      </Section>

      {/* ── Embed ────────────────────────────────────────────── */}
      <Section id="embed" title="Embedding the widget">
        <P>
          Copy the snippet from the agent&apos;s <strong>Embed</strong> tab and
          paste it just before the closing <C>&lt;/body&gt;</C> tag.
        </P>
        <Code label="index.html">{`<!-- avatarx embeddable widget -->
<script src="https://avatarx.net/components/widget/widget.js" async></script>
<script>
  window.VoiceAgentConfig = {
    agentId: "YOUR_AGENT_ID",
    apiUrl: "https://avatarx.net"
  };
</script>`}</Code>

        <H3>Options</H3>
        <Table
          head={["Key", "Required", "Default"]}
          rows={[
            [<C key="a">agentId</C>, "yes", "—"],
            [<C key="u">apiUrl</C>, "yes", "—"],
            [<C key="bt">bannerTitle</C>, "no", <C key="bt2">Hello there! Need Help?</C>],
            [<C key="bc">bannerCaption</C>, "no", <C key="bc2">Hi! I&apos;m here to assist you.</C>],
            [<C key="iv">idleVideoUrl</C>, "no", "built-in idle loop"],
          ]}
        />

        <H3>What the visitor gets</H3>
        <UL>
          <LI>A launcher in the bottom-right that expands into the avatar.</LI>
          <LI>Mic and speaker toggles, a chat tab, and an end-call button.</LI>
          <LI>
            A chat panel with live transcripts, your conversation starters, and
            media cards.
          </LI>
          <LI>
            A clean end screen when the agent closes the call — plus a star
            rating when you enable the feedback screen.
          </LI>
        </UL>

        <H3>Reading the feedback rating</H3>
        <P>
          When the feedback screen is on, the widget dispatches a DOM event on
          the host page. Nothing is stored server-side yet, so capture it
          yourself if you want to keep it:
        </P>
        <Code label="host page">{`window.addEventListener("voiceagent:feedback", (e) => {
  // { agentId, score: 1..5 | null, comment: string | null }
  console.log(e.detail);
});`}</Code>

        <Callout kind="warn" title="The agent must be publicly embeddable">
          The widget reads a public config endpoint that only serves published
          agents. If the widget says the assistant is unavailable, turn on{" "}
          <strong>Publicly embeddable</strong> on the agent&apos;s Avatar tab —
          the sandbox offers a one-click fix for this too.
        </Callout>
      </Section>

      {/* ── Conversations ────────────────────────────────────── */}
      <Section id="conversations" title="Conversations & CRM">
        <UL>
          <LI>
            <strong>Conversations</strong> — every session with its transcript.
          </LI>
          <LI>
            <strong>CRM</strong> — leads the agent captured and appointments it
            booked, both editable, with CSV export for leads.
          </LI>
          <LI>
            <strong>Insights</strong> — volume, duration and engagement over
            time.
          </LI>
        </UL>
      </Section>

      {/* ── Account ──────────────────────────────────────────── */}
      <Section id="account" title="Account settings">
        <H3>Outbound email</H3>
        <P>
          Appointment confirmations and handoff alerts are sent from your own
          SMTP server, so they come from your domain. Add the host, port and
          credentials under Settings and send a test — until that test passes,
          handoffs are recorded but nobody is emailed.
        </P>

        <H3>Google Calendar</H3>
        <P>
          Connect once for the whole account. Every booking then gets its own
          calendar event and Meet link.
        </P>

        <H3>Security</H3>
        <P>
          Sign-in creates a server-side session you can revoke. Under Settings
          you can see active sessions, sign out other devices, and change your
          password — which revokes every other session.
        </P>
      </Section>

      {/* ── Credits ──────────────────────────────────────────── */}
      <Section id="credits" title="Credits">
        <P>
          Live conversations consume credit minutes from your account balance.
          The sidebar shows what is left. When the balance runs out the widget
          stops connecting new calls and the API answers{" "}
          <C>402 credits_exhausted</C>, so top up before a launch.
        </P>
      </Section>

      {/* ── Troubleshooting ──────────────────────────────────── */}
      <Section id="troubleshooting" title="Troubleshooting">
        <Table
          head={["Symptom", "Most likely cause"]}
          rows={[
            [
              "Widget shows “Assistant unavailable”",
              "The agent is not publicly embeddable, or the id in the snippet is wrong.",
            ],
            [
              "The launcher opens but nothing connects",
              "Microphone permission was blocked, or the account is out of credits (402).",
            ],
            [
              "The agent refuses to answer things it should know",
              "Strict mode with nothing indexed for that question — check Test retrieval, then add or edit a document.",
            ],
            [
              "It answers from old, deleted text",
              "The document was edited but re-indexing is still running; the status pill shows Indexing until it settles.",
            ],
            [
              "Handoff or booking emails never arrive",
              "Outbound email is not configured or its test has not passed.",
            ],
            [
              "Sign in with Google bounces somewhere unexpected",
              "The OAuth redirect URI on the server still points at an older deployment.",
            ],
            [
              "A custom tool always fails",
              "Non-HTTPS URL, or a host that resolves to a private address — both are refused by design.",
            ],
          ]}
        />
        <P>
          Building against the API instead? The{" "}
          <Link className="underline" href="/api">
            API reference
          </Link>{" "}
          covers authentication and every endpoint.
        </P>
        <Endpoints
          rows={[
            { m: "GET", path: "/health", note: "Service health check" },
          ]}
        />
      </Section>
    </DocsShell>
  );
}
