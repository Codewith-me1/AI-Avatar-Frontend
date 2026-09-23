"use client";

/**
 * Terms of Service.
 *
 * Drafted against what the platform actually does and enforces. Placeholders in
 * [square brackets] need the operator's details (legal entity, governing law,
 * pricing, notice periods). Have a lawyer review before relying on it.
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
  { id: "agreement", label: "The agreement" },
  { id: "accounts", label: "Accounts" },
  { id: "service", label: "The service" },
  { id: "acceptable", label: "Acceptable use" },
  { id: "content", label: "Your content" },
  { id: "data", label: "Data protection" },
  { id: "visitors", label: "Duties to your visitors" },
  { id: "tools", label: "Custom tools & integrations" },
  { id: "credits", label: "Credits and payment" },
  { id: "availability", label: "Availability" },
  { id: "liability", label: "Warranties & liability" },
  { id: "termination", label: "Suspension & termination" },
  { id: "changes", label: "Changes, law & contact" },
];

export default function TermsPage() {
  return (
    <DocsShell
      page="terms"
      title="Terms of Service"
      intro="The rules for using avatarx: what we provide, what you are responsible for — particularly toward the visitors who talk to your agents — and how the agreement can end."
      updated="23 September 2026"
      sections={SECTIONS}
    >
      <Section id="agreement" title="The agreement">
        <P>
          These terms are between <strong>[Company legal name]</strong>,
          [registered address] (&ldquo;we&rdquo;, &ldquo;us&rdquo;) and the
          person or organisation that opens an avatarx account
          (&ldquo;you&rdquo;). Creating an account means you accept them. If you
          accept on behalf of a company, you confirm you may bind it.
        </P>
        <P>
          They cover the avatarx website, the dashboard, the API and the
          embeddable widget (together, the &ldquo;service&rdquo;). Our{" "}
          <Link className="underline" href="/privacy">
            Privacy Policy
          </Link>{" "}
          forms part of them.
        </P>
      </Section>

      <Section id="accounts" title="Accounts">
        <UL>
          <LI>Give accurate registration details and keep them current.</LI>
          <LI>
            You are responsible for everything done under your account. Keep
            your password safe and do not share logins.
          </LI>
          <LI>
            You must be at least 16, and old enough to enter a contract where you
            live.
          </LI>
          <LI>
            Tell us promptly at <strong>[security@avatarx.net]</strong> if you
            suspect unauthorised access. You can end other sessions yourself from
            Settings, and changing your password ends them all.
          </LI>
        </UL>
      </Section>

      <Section id="service" title="What the service does">
        <P>
          avatarx lets you configure AI agents — a face, a voice, a prompt, your
          own knowledge — and embed them on your site so visitors can talk to
          them by voice or text. Agents may also capture leads, book
          appointments, hand over to a person, show media, and call webhooks you
          define.
        </P>
        <Callout kind="warn" title="Agents generate text — they are not infallible">
          Replies come from a large language model. They can be wrong, incomplete
          or unsuitable even when grounded in your knowledge base. Do not use
          avatarx as the sole source for medical, legal, financial or safety
          advice, and review anything published from it. You decide what your
          agent says by how you configure it.
        </Callout>
        <P>
          Features marked as coming soon or otherwise incomplete — custom avatar
          creation, for example — may change or be withdrawn.
        </P>
      </Section>

      <Section id="acceptable" title="Acceptable use">
        <P>You must not use avatarx to:</P>
        <UL>
          <LI>break the law, or help anyone else to;</LI>
          <LI>
            impersonate a real person or organisation, or present an agent as
            human where the law requires you to disclose it is not;
          </LI>
          <LI>
            produce or distribute content that is harassing, hateful, sexually
            exploitative, or that promotes self-harm or violence;
          </LI>
          <LI>
            deceive, defraud, or collect personal data under false pretences —
            including credentials or payment details;
          </LI>
          <LI>
            infringe intellectual property, or upload content you have no right
            to use;
          </LI>
          <LI>
            probe, scan or overload the service, evade rate limits or credit
            accounting, or use it to attack anyone&apos;s infrastructure;
          </LI>
          <LI>
            upload malware, or route the service at internal or private network
            addresses;
          </LI>
          <LI>
            resell or white-label the service without our written agreement.
          </LI>
        </UL>
      </Section>

      <Section id="content" title="Your content">
        <UL>
          <LI>
            <strong>You own what you bring.</strong> Prompts, documents, media,
            agent settings and conversation records remain yours.
          </LI>
          <LI>
            You grant us a limited, non-exclusive licence to host, copy, process
            and transmit that content strictly to operate the service for you —
            including sending the parts needed to the model, speech and avatar
            providers named in the Privacy Policy.
          </LI>
          <LI>
            <strong>We do not use your content to train models</strong>, and we
            do not sell it.
          </LI>
          <LI>
            You confirm you have the rights to everything you upload, and that
            using it through avatarx breaks no law or agreement.
          </LI>
          <LI>
            Output an agent generates for you is yours to use, subject to these
            terms and the model providers&apos; terms.
          </LI>
        </UL>
      </Section>

      <Section id="data" title="Data protection">
        <P>
          Where your agents process personal data about your visitors, you are
          the controller and we are your processor. We process that data only on
          your documented instructions — which your configuration expresses —
          and we:
        </P>
        <UL>
          <LI>
            apply the technical and organisational measures described in the{" "}
            <Link className="underline" href="/privacy#security">
              Privacy Policy
            </Link>
            ;
          </LI>
          <LI>
            bind our staff and sub-processors to confidentiality, and use only
            the sub-processors listed there;
          </LI>
          <LI>
            help you respond to data subject requests and to security incidents;
          </LI>
          <LI>
            delete the data when you delete the agent or close the account.
          </LI>
        </UL>
        <P>
          For a signed data processing agreement, or a record of the transfer
          safeguards for providers outside the UK/EEA, write to{" "}
          <strong>[privacy@avatarx.net]</strong>.
        </P>
        <Callout kind="warn" title="Everything is stored">
          Conversations are transcribed and stored in our database along with
          your agents, knowledge and any leads or bookings captured. Build that
          into your own privacy notice.
        </Callout>
      </Section>

      <Section id="visitors" title="What you owe your visitors">
        <P>
          You decide who talks to your agent, so these obligations are yours,
          not ours:
        </P>
        <UL>
          <LI>
            Tell visitors, before a conversation starts, that they are talking to
            an AI agent and that the conversation is transcribed and stored.
          </LI>
          <LI>
            Have a lawful basis for what your agent collects, and obtain consent
            where your law requires it — including for recording, and for
            microphone or camera access.
          </LI>
          <LI>
            Publish a privacy notice covering your agent, and name us as a
            processor.
          </LI>
          <LI>
            Do not configure agents to solicit special category data (health,
            biometrics, political or religious views) or payment card details.
          </LI>
          <LI>
            Handle requests from your visitors about their data; we will help
            where we can.
          </LI>
        </UL>
      </Section>

      <Section id="tools" title="Custom tools and integrations">
        <UL>
          <LI>
            A custom tool sends data to an endpoint you choose, triggered by a
            model. You are responsible for that endpoint, what it does, and any
            data it receives.
          </LI>
          <LI>
            Tool URLs must be public HTTPS. We refuse requests to loopback,
            private, link-local and CGNAT addresses, enforce a timeout and cap
            response size — protections you must not try to circumvent.
          </LI>
          <LI>
            If you connect Google Calendar or your own SMTP server, you
            authorise us to create events and send mail on your behalf for the
            features you have enabled.
          </LI>
        </UL>
      </Section>

      <Section id="credits" title="Credits and payment">
        <Table
          head={["Term", "Detail"]}
          rows={[
            ["How usage is measured", "Live conversations consume credit minutes from your account balance."],
            ["Running out", "When the balance is exhausted new calls stop connecting and the API returns a 402. Existing configuration is untouched."],
            ["Prices and billing cycle", "[state your prices, currency, billing cycle and taxes]"],
            ["Refunds", "[state your refund policy]"],
            ["Changes to pricing", "[state your notice period]"],
          ]}
        />
        <P>
          Credits are for use with the service, have no cash value, and are not
          transferable between accounts.
        </P>
      </Section>

      <Section id="availability" title="Availability, support and changes">
        <UL>
          <LI>
            We aim to keep the service available but do not promise uninterrupted
            operation. Maintenance, third-party outages and incidents happen.
          </LI>
          <LI>
            Any service level commitment applies only if stated in a separate
            written agreement — <strong>[reference it here, or delete this line]</strong>.
          </LI>
          <LI>
            We may change features, and will give reasonable notice of changes
            that materially reduce core functionality.
          </LI>
          <LI>
            Support runs through the in-app tickets and{" "}
            <strong>[support@avatarx.net]</strong>.
          </LI>
        </UL>
      </Section>

      <Section id="liability" title="Warranties and liability">
        <P>
          The service is provided <strong>as is</strong>. To the extent the law
          allows, we exclude implied warranties of merchantability, fitness for a
          particular purpose and non-infringement, and we do not warrant that
          agent output will be accurate or suitable for any purpose.
        </P>
        <P>
          We are not liable for indirect or consequential loss, loss of profit,
          revenue, goodwill or data. Our total liability in any twelve-month
          period is limited to the amounts you paid us in that period.
        </P>
        <P>
          Nothing here excludes liability that cannot lawfully be excluded —
          including death or personal injury caused by negligence, fraud, or
          rights you have as a consumer.
        </P>
        <P>
          You will indemnify us against claims arising from your content, your
          agents&apos; conduct, your use of the service in breach of these terms,
          or your failure to meet your obligations to visitors.
        </P>
      </Section>

      <Section id="termination" title="Suspension and termination">
        <H3>By you</H3>
        <P>
          Stop using the service and delete your agents at any time. Ask us to
          close the account and we will delete your data as described in the{" "}
          <Link className="underline" href="/privacy#retention">
            Privacy Policy
          </Link>
          . Prepaid credits are <strong>[refundable / non-refundable]</strong>.
        </P>
        <H3>By us</H3>
        <P>
          We may suspend or close an account that breaches these terms, puts the
          service or other users at risk, or is used unlawfully. Where it is
          reasonable and lawful we will warn you first and give you a chance to
          fix it. Serious cases — illegal content, attacks on the platform —
          may be suspended immediately.
        </P>
        <P>
          On termination your embedded agents stop responding. Export anything
          you need first: leads download as CSV and the{" "}
          <Link className="underline" href="/api">
            API
          </Link>{" "}
          returns your agents, knowledge and conversations as JSON.
        </P>
      </Section>

      <Section id="changes" title="Changes, governing law and contact">
        <UL>
          <LI>
            We may update these terms; the date at the top changes with them, and
            material changes will be announced in the dashboard. Continuing to
            use the service after they take effect means you accept them.
          </LI>
          <LI>
            These terms are governed by the laws of{" "}
            <strong>[jurisdiction]</strong>, and the courts of{" "}
            <strong>[jurisdiction]</strong> have exclusive jurisdiction, without
            affecting mandatory consumer protections where you live.
          </LI>
          <LI>
            If any provision is unenforceable, the rest stands. Not enforcing a
            term is not a waiver of it.
          </LI>
          <LI>
            You may not assign this agreement without our consent; we may assign
            it as part of a merger or sale of the business.
          </LI>
        </UL>
        <P>
          Contact: <strong>[legal@avatarx.net]</strong>. Technical detail lives
          in the <Link className="underline" href="/doc">product guide</Link> and{" "}
          <Link className="underline" href="/api">
            API reference
          </Link>
          ; <C>/health</C> reports service status.
        </P>
      </Section>
    </DocsShell>
  );
}
