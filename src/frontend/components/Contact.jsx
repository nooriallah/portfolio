"use client";
/**
 * src/frontend/components/Contact.jsx — CONTACT SECTION.
 *
 * Left: email / phone / location cards + QR code.
 * Right: the contact form. Submissions are saved to the database through the
 * `sendMessage` server action and appear in /admin → Messages.
 *
 * Details + labels: /admin → Contact (t.contact). Form texts: /admin → Contact form (t.form).
 * QR image: /admin → Site.
 */
import { useActionState, useEffect, useRef } from "react";
import { Mail, Phone, MapPin, ArrowRight, Check } from "lucide-react";
import Section from "./ui/Section.jsx";
import Reveal from "./ui/Reveal.jsx";
import Stagger from "./ui/Stagger.jsx";
import Tilt from "./ui/Tilt.jsx";
import { useLang } from "@frontend/i18n/LanguageProvider.jsx";
import { sendMessage } from "@backend/cms/public-actions.js";

export default function Contact() {
  const { t } = useLang();
  const c = t.contact;
  const f = t.form;

  // Contact cards: icon, label, value, link.
  const items = [
    { Icon: Mail, label: c.emailLabel, value: c.email, href: c.email ? `mailto:${c.email}` : null },
    { Icon: Phone, label: c.phoneLabel, value: c.phone, href: c.phoneLink || null },
    { Icon: MapPin, label: c.locationLabel, value: c.location, href: null },
  ].filter((it) => it.value);

  // Form state (pending / success / error) via the server action.
  const [state, formAction, pending] = useActionState(sendMessage, null);
  const formRef = useRef(null);
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-bg border border-line text-heading placeholder-muted focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent outline-none transition";

  return (
    <Section
      id="contact"
      eyebrow={t.sections.contactEyebrow}
      title={t.sections.contactTitle}
      aura="left"
    >
      <div className="grid md:grid-cols-2 gap-10">
        {/* Contact cards */}
        <Stagger step={90} className="space-y-4">
          {[
            ...items.map(({ Icon, label, value, href }, i) => {
              const Tag = href ? "a" : "div";
              return (
                <Tag
                  key={i}
                  href={href || undefined}
                  target={href && !href.startsWith("mailto:") ? "_blank" : undefined}
                  rel={href ? "noreferrer" : undefined}
                  className="flex items-center gap-4 p-4 rounded-xl border border-line bg-surface hover:border-accent/40 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-all"
                >
                  <span className="grid place-items-center w-11 h-11 rounded-lg bg-accent/10 text-accent">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="text-xs text-faint">{label}</p>
                    <p className="text-heading font-medium text-sm break-all">
                      {value}
                    </p>
                  </div>
                </Tag>
              );
            }),
            t.site.qrImage ? (
              <div
                key="qr"
                className="flex items-center gap-4 p-4 rounded-xl border border-line bg-surface"
              >
                <img
                  src={t.site.qrImage}
                  alt="QR code"
                  className="w-16 h-16 rounded-lg bg-white p-1"
                />
                <p className="text-sm text-muted">{c.qrText}</p>
              </div>
            ) : null,
          ]}
        </Stagger>

        {/* Contact form */}
        <Reveal delay={140} from="tilt">
          <Tilt max={3} scale={1} lift={6} perspective={1400}>
            <form
              ref={formRef}
              action={formAction}
              className="p-6 rounded-2xl border border-line bg-surface [transform-style:preserve-3d]"
            >
              <Stagger step={80} start={120} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    name="name"
                    required
                    autoComplete="name"
                    placeholder={f.name}
                    aria-label={f.name}
                    className={inputClass}
                  />
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder={f.email}
                    aria-label={f.email}
                    className={inputClass}
                  />
                </div>
                <input
                  name="subject"
                  placeholder={f.subject}
                  aria-label={f.subject}
                  className={inputClass}
                />
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder={f.message}
                  aria-label={f.message}
                  className={`${inputClass} resize-none`}
                />
                {/* Honeypot — hidden from people, filled by bots. */}
                <input
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 font-semibold text-white rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-600/20 hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition"
                >
                  {pending ? f.sending : f.send}
                  {!pending && <ArrowRight size={18} />}
                </button>
                {/* Result message */}
                {state?.ok && (
                  <p role="status" className="flex items-center gap-2 text-sm text-accent">
                    <Check size={16} /> {f.sent}
                  </p>
                )}
                {state && !state.ok && (
                  <p role="alert" className="text-sm text-red-500">
                    {f.error}
                  </p>
                )}
              </Stagger>
            </form>
          </Tilt>
        </Reveal>
      </div>
    </Section>
  );
}
