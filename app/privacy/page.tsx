"use client";

/**
 * Privacy Policy.
 *
 * Drafted against what this system actually does — the tables in
 * backend/models/models.py, the security measures in core/security.py, and the
 * third-party services configured on the server. Placeholders in [square
 * brackets] are the details only the operator can supply (legal entity,
 * address, contact addresses, data-centre region). Have a lawyer review before
 * relying on it.
 */

import Link from "next/link";
import {
  C,
  Callout,
  DocsShell,
  H3,
  LI,
  P,
  Section,
  Table,
  UL,
  type DocSection,
} from "@/components/docs/DocsShell";

const SECTIONS: DocSection[] = [
  { id: "who", label: "Who we are" },
  { id: "roles", label: "Controller or processor" },
  { id: "collect", label: "What we store" },
  { id: "why", label: "Why, and on what basis" },
  { id: "where", label: "Where it is stored" },
  { id: "processors", label: "Who else processes it" },
  { id: "ai", label: "AI processing" },
  { id: "retention", label: "How long we keep it" },
  { id: "gdpr", label: "Your GDPR rights" },
  { id: "security", label: "How we protect it" },
  { id: "cookies", label: "Cookies" },
  { id: "visitors", label: "If you talked to an agent" },
  { id: "children", label: "Children" },
  { id: "changes", label: "Changes & contact" },
];

export default function PrivacyPage() {
  return (
    <DocsShell
      page="privacy"
      title="Privacy Policy"
      intro="What avatarx collects, why, where it is stored, and the rights you have over it. Written to be specific about this system rather than generic — including the fact that everything described here is stored in our database."
      updated="23 September 2026"
      sections={SECTIONS}
    >
      <Section id="who" title="Who we are">
        <P>
          avatarx is a platform for building AI avatar agents that talk with
          visitors on your website. This policy covers the avatarx website, the
          dashboard at <C>avatarx.net</C>, the API, and the embeddable chat
          widget.
        </P>
        <P>
          The data controller for account data is{" "}
          <strong>[Company legal name]</strong>, [registered address], reachable
          at <strong>[privacy@avatarx.net]</strong>. If we have appointed a data
          protection officer or an EU representative, their contact details are{" "}
          <strong>[contact]</strong>.
        </P>
      </Section>

      <Section id="roles" title="Controller or processor — which applies to you">
        <P>
          Two different relationships exist, and your rights differ between
          them:
        </P>
        <Table
          head={["If you are…", "We act as", "What that means"]}
          rows={[
            [
              <strong key="a">an account holder</strong>,
              "Controller",
              "We decide how your account, agents and billing data are handled. Contact us directly to exercise your rights.",
            ],
            [
              <strong key="b">a visitor who spoke to an agent</strong>,
              "Processor",
              "The business that embedded the agent decides what is collected and why. We only process it on their instructions. Contact that business first; we will help them respond.",
            ],
          ]}
        />
      </Section>

      <Section id="collect" title="What we collect and store">
        <Callout kind="warn" title="Everything below is stored in our database">
          Account details, agent configuration, uploaded knowledge and media,
          and full conversation transcripts are written to a PostgreSQL database
          on our servers, with uploaded files on the same server&apos;s disk.
          They are not ephemeral: they persist until you or the account holder
          deletes them, or the account is closed.
        </Callout>

        <H3>Account and security data</H3>
        <Table
          head={["Data", "Notes"]}
          rows={[
            ["Email address, name, password", "The password is stored only as a bcrypt hash — never in readable form."],
            ["Sign-in history", "Last sign-in time and IP address, failed attempt counts and lockout state."],
            ["Sessions", "One row per signed-in device: a hash of the session token, IP address, browser user-agent, creation, last-seen and expiry times."],
            ["Google connection", "If you connect Google Calendar: your Google email and a refresh token, stored encrypted."],
            ["Email (SMTP) settings", "Host, port, username and sender addresses; the password is stored encrypted and never returned by the API."],
            ["Credit balance", "Minutes granted and consumed."],
            ["Audit log", "Security-relevant administrative actions, with actor and IP address."],
          ]}
        />

        <H3>What you build</H3>
        <Table
          head={["Data", "Notes"]}
          rows={[
            ["Agent configuration", "Name, prompt, personality, voice, avatar, language, model choice, greeting, conversation starters, topics to avoid and capability switches."],
            ["Knowledge base content", "The full text of every document you upload, paste or crawl, plus the numeric embeddings generated from it and the original files on disk."],
            ["Media", "Images, PDFs and videos you upload for agents to show, stored as files with their titles and keywords in the database."],
            ["Custom tools", "Webhook URLs, headers and parameter schemas. Credentials are stored encrypted and are never returned by the API."],
          ]}
        />

        <H3>Conversations and the people in them</H3>
        <Table
          head={["Data", "Notes"]}
          rows={[
            ["Conversation sessions", "Which agent, a visitor identifier, room name, start and end time, duration and status."],
            ["Transcripts", "Every message in the conversation — what the visitor said and what the agent replied — with timing information."],
            ["Visitor profiles", "Name and email if the visitor gives them in the pre-chat form, plus whether they skipped it."],
            ["Leads", "Name, email, phone, company, interest and notes that an agent captured during a conversation, with a status and score."],
            ["Appointments", "Visitor name, email, phone, the booked time, timezone, purpose and notes."],
            ["Support tickets", "Messages you send us for help, and our replies."],
          ]}
        />
        <P>
          We do not collect special category data (health, biometrics, political
          opinions and similar) deliberately, and agents should not be
          configured to ask for it. Anything a visitor volunteers in a
          conversation is stored in the transcript as typed or spoken.
        </P>
      </Section>

      <Section id="why" title="Why we process it, and on what legal basis">
        <Table
          head={["Purpose", "Legal basis (UK/EU GDPR)"]}
          rows={[
            ["Creating your account and running the service you asked for", "Performance of a contract (Art. 6(1)(b))"],
            ["Storing agents, knowledge, media and transcripts so the product works", "Performance of a contract"],
            ["Securing accounts: sign-in throttling, session management, audit logging", "Legitimate interests (Art. 6(1)(f)) — keeping accounts safe"],
            ["Answering support requests", "Performance of a contract / legitimate interests"],
            ["Sending service emails such as booking confirmations", "Performance of a contract"],
            ["Meeting legal and accounting obligations", "Legal obligation (Art. 6(1)(c))"],
            ["Processing visitor data inside your agents' conversations", "On the account holder's instructions, as processor (Art. 28)"],
          ]}
        />
        <P>
          We do not sell personal data, and we do not use it for advertising or
          profiling.
        </P>
      </Section>

      <Section id="where" title="Where it is stored">
        <UL>
          <LI>
            Application data lives in a <strong>PostgreSQL</strong> database on a
            dedicated virtual server rented from <strong>Contabo</strong>,
            located in <strong>[data-centre region — confirm before publishing]</strong>.
          </LI>
          <LI>
            Uploaded documents, media and avatar files are stored on that same
            server&apos;s disk.
          </LI>
          <LI>
            <strong>Redis</strong> on the same server holds short-lived job and
            queue state. Both the database and Redis listen only on the
            server&apos;s loopback interface — they are not reachable from the
            internet.
          </LI>
          <LI>
            Some processing necessarily leaves that server: see the
            sub-processors below.
          </LI>
        </UL>
      </Section>

      <Section id="processors" title="Who else processes it">
        <P>
          To answer a visitor in real time, parts of a conversation are sent to
          specialist providers. We use only what the product needs:
        </P>
        <Table
          head={["Provider", "What it receives", "Purpose"]}
          rows={[
            ["OpenAI", "The composed prompt, recent conversation turns and any retrieved knowledge excerpts", "Generating replies"],
            ["Anthropic", "The same, when you select a Claude model", "Generating replies"],
            ["Cartesia", "The text the agent is about to say", "Speech synthesis"],
            ["LiveKit", "Real-time audio and video streams and room metadata", "Carrying the live call"],
            ["HeyGen / LiveAvatar", "The agent's speech and avatar identifier", "Rendering the talking avatar"],
            ["RunPod", "Short audio segments and the avatar identifier", "GPU lip-sync rendering"],
            ["Google", "Your Google account identity, and booking details if you connect Calendar", "Sign-in, Calendar events and Meet links"],
            ["Your own SMTP server", "Booking confirmations and handoff alerts", "Sending email from your domain"],
          ]}
        />
        <P>
          Speech recognition runs on our own server rather than a third-party
          service. Where a provider is outside the UK/EEA, transfers rely on the
          European Commission&apos;s Standard Contractual Clauses or an adequacy
          decision — see <strong>[link to your transfer documentation]</strong>.
        </P>
        <Callout kind="info" title="Your own webhooks">
          If you configure a custom tool, the agent will send the arguments you
          defined to the URL you chose. That endpoint is yours, and what it does
          with the data is your responsibility.
        </Callout>
      </Section>

      <Section id="ai" title="AI processing">
        <UL>
          <LI>
            Replies are generated by the model provider you select per agent.
            Prompts, retrieved knowledge and recent conversation turns are sent
            to them for that purpose.
          </LI>
          <LI>
            Under those providers&apos; API terms, content sent through the API
            is not used to train their models by default. Confirm the current
            terms of the provider you choose.
          </LI>
          <LI>
            Agents can be configured with memory, which lets them recall a
            returning visitor&apos;s earlier conversations with the same agent —
            or, if the account holder enables sharing, with their other agents.
          </LI>
          <LI>
            Automated replies are not used to make decisions with legal or
            similarly significant effects.
          </LI>
        </UL>
      </Section>

      <Section id="retention" title="How long we keep it">
        <Table
          head={["Data", "Kept"]}
          rows={[
            ["Agents, knowledge, media", "Until you delete them. Deleting an agent also deletes its knowledge base, documents, embeddings, media and conversations."],
            ["Conversations and transcripts", "Until deleted with the agent or the account. Conversations that end without a single message are discarded automatically."],
            ["Leads and appointments", "Until you delete them or the agent they belong to."],
            ["Account data", "For the life of the account. Closing the account removes your agents and their data."],
            ["Sessions", "Expire after 7 days, or 3 days without use; you can revoke them sooner."],
            ["Audit logs and security records", "Retained for security and accountability."],
            ["Backups", "[state your backup retention period]"],
          ]}
        />
        <Callout kind="warn" title="Be accurate about this one">
          There is no automatic expiry of transcripts today — they persist until
          something is deleted. If you need a shorter retention period, delete
          the data or ask us and we will remove it.
        </Callout>
      </Section>

      <Section id="gdpr" title="Your rights under the GDPR">
        <P>
          If you are in the UK or the EEA you have the following rights. They
          apply to personal data we hold about you as a controller; for data
          inside an account holder&apos;s agents, ask that business.
        </P>
        <UL>
          <LI>
            <strong>Access</strong> — a copy of the personal data we hold about
            you.
          </LI>
          <LI>
            <strong>Rectification</strong> — correct anything inaccurate. Most
            fields are editable in the dashboard.
          </LI>
          <LI>
            <strong>Erasure</strong> — ask us to delete your data. Deleting an
            agent or closing the account does most of this immediately.
          </LI>
          <LI>
            <strong>Restriction</strong> — ask us to pause processing while a
            dispute is resolved.
          </LI>
          <LI>
            <strong>Portability</strong> — receive your data in a machine-readable
            form. Leads export to CSV in the dashboard, and the API returns
            agents, knowledge and conversations as JSON.
          </LI>
          <LI>
            <strong>Objection</strong> — object to processing based on legitimate
            interests.
          </LI>
          <LI>
            <strong>Withdraw consent</strong> — where processing relies on
            consent, withdraw it at any time without affecting past processing.
          </LI>
          <LI>
            <strong>Complain</strong> — to your local supervisory authority. In
            Germany that is the data protection authority of your state; in the
            UK, the Information Commissioner&apos;s Office.
          </LI>
        </UL>
        <P>
          Write to <strong>[privacy@avatarx.net]</strong> and we will respond
          within one month, as the GDPR requires. We may ask you to confirm your
          identity first.
        </P>
      </Section>

      <Section id="security" title="How we protect it">
        <P>These are the measures actually in place:</P>
        <UL>
          <LI>
            <strong>In transit</strong> — HTTPS everywhere, with HSTS and an
            automatic redirect from plain HTTP. Certificates renew
            automatically.
          </LI>
          <LI>
            <strong>Passwords</strong> — hashed with bcrypt; we cannot read
            them.
          </LI>
          <LI>
            <strong>Sessions</strong> — only a SHA-256 hash of each session token
            is stored, in an HttpOnly, Secure cookie, with a sliding expiry, an
            idle timeout and instant revocation.
          </LI>
          <LI>
            <strong>Brute-force protection</strong> — accounts lock after five
            failed sign-ins, with a backoff that grows on repetition.
          </LI>
          <LI>
            <strong>Secrets at rest</strong> — SMTP passwords, Google refresh
            tokens and custom-tool credentials are encrypted before they are
            stored, and are never returned by the API.
          </LI>
          <LI>
            <strong>Tenant isolation</strong> — every request is scoped to the
            account that made it; another account&apos;s data returns
            &ldquo;not found&rdquo;.
          </LI>
          <LI>
            <strong>Outbound guard</strong> — custom tool URLs must be public
            HTTPS; requests to internal or private network addresses are
            refused, so a tool cannot be used to reach our infrastructure.
          </LI>
          <LI>
            <strong>Hardening</strong> — database and cache bound to loopback
            only, the application running as an unprivileged user, and security
            headers (<C>X-Frame-Options</C>, <C>X-Content-Type-Options</C>,{" "}
            <C>Referrer-Policy</C>, <C>Permissions-Policy</C>) on every response.
          </LI>
          <LI>
            <strong>Audit logging</strong> — administrative actions are recorded
            with actor and IP address.
          </LI>
        </UL>
        <P>
          Being straight about the limits: transcripts and knowledge content are
          stored unencrypted at the field level, so a person with database access
          could read them. Access is limited to those who need it to operate the
          service. No system is perfectly secure; if a breach affects your data
          we will notify you and the relevant supervisory authority as the GDPR
          requires.
        </P>
      </Section>

      <Section id="cookies" title="Cookies and local storage">
        <UL>
          <LI>
            <strong>One strictly necessary cookie</strong> — a session cookie set
            when you sign in. Without it you cannot stay signed in.
          </LI>
          <LI>
            <strong>Browser storage</strong> — the dashboard keeps your session
            token and small preferences (such as the last agent you were
            configuring) in your browser&apos;s session and local storage. They
            never leave your device except as the session token on requests you
            make.
          </LI>
          <LI>
            <strong>No advertising or analytics cookies</strong>, and no
            third-party tracking scripts on this site. Usage statistics in your
            dashboard are computed from your own conversations on our own
            servers.
          </LI>
        </UL>
      </Section>

      <Section id="visitors" title="If you talked to an avatarx agent on someone's website">
        <P>
          The business running that agent decides what it asks for and why —
          they are the controller, and we process it for them. What is typically
          stored: the conversation transcript, any name, email or phone you
          provided, appointment details if you booked one, and technical session
          information.
        </P>
        <P>
          To access or delete that data, contact the business whose site you
          were on. If you cannot reach them, write to{" "}
          <strong>[privacy@avatarx.net]</strong> and we will help identify the
          right controller and support their response.
        </P>
        <Callout kind="info" title="Conversations are recorded as text">
          Speech is transcribed and the transcript is stored. Site owners are
          responsible for telling visitors this before a conversation begins,
          and for obtaining consent where their law requires it.
        </Callout>
      </Section>

      <Section id="children" title="Children">
        <P>
          avatarx is not intended for children under 16 and we do not knowingly
          collect their personal data. If you believe a child has provided data
          through an agent, tell us and we will delete it.
        </P>
      </Section>

      <Section id="changes" title="Changes and contact">
        <P>
          We will update this policy when the product changes, and the date at
          the top will change with it. Material changes will be announced in the
          dashboard.
        </P>
        <P>
          Questions, requests or complaints:{" "}
          <strong>[privacy@avatarx.net]</strong>, or write to{" "}
          <strong>[Company legal name, registered address]</strong>. See also our{" "}
          <Link className="underline" href="/terms">
            Terms of Service
          </Link>
          .
        </P>
      </Section>
    </DocsShell>
  );
}
