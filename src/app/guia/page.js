/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import Link from "next/link";

// How it works section
function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Pick a job",
      description:
        "Select from an active listings, insert a job link or use our AI to reach out to the contact.",
    },
    {
      number: "2",
      title: "Unlock a verified contact",
      description: "Name + email + phone. Bounced? Free replacement.",
    },
    {
      number: "3",
      title: "Send a short message",
      description:
        "We write a coverletter on your behalf based on your settings. You can edit everything.",
    },
  ];

  return (
    <section className="mb-6">
      <h2 className="text-[#222] text-[18px] font-bold mb-1">How it works</h2>
      <div className="grid md:grid-cols-3 gap-2">
        {steps.map((step) => (
          <article
            key={step.number}
            className="border border-gray-200 rounded-xl bg-white p-2 shadow-lg"
          >
            <div className="grid grid-cols-[42px_1fr] gap-3 items-start">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 border border-yellow-300 font-black text-yellow-800 flex items-center justify-center">
                {step.number}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// Why This Works Section
function WhyThisWorksSection() {
  return (
    <section className="mb-6">
      <h2 className="text-[#222] text-[18px] font-bold mb-1">
        🔐 Why this works (no fluff. just direct contact.)
      </h2>
      <article className="border border-gray-200 rounded-xl bg-white p-4 shadow-lg">
        <p className="font-medium mb-2 text-gray-800">
          Portals show postings. We show <u>the person who decides</u>.
        </p>
        <p className="text-gray-600 mb-2">
          Most platforms drown you in listings and hide the decision‑maker.{" "}
          <strong>We do the opposite.</strong>
          <br />
          You don't buy a promise of employment — you buy{" "}
          <strong>direct access</strong>.
        </p>

        <ul className="space-y-1 mb-4">
          <li className="flex items-start gap-2">
            <span className="text-green-600">✅</span>
            <span className="text-gray-700">
              HR contact's full name & email (verified ≤24h)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✅</span>
            <span className="text-gray-700">
              Contact them <strong>directly</strong> — no gatekeepers, no
              guessing
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✅</span>
            <span className="text-gray-700">
              Faster replies, less waiting, zero "ghost jobs" drama
            </span>
          </li>
        </ul>

        <h3 className="font-semibold text-gray-800 mb-2">
          💸 Why is there a fee?
        </h3>
        <p className="text-gray-600 mb-2">
          We don't take money from companies. No "sponsored" listings. We work
          only for <strong>you</strong>.
        </p>
        <ul className="space-y-1 mb-2">
          <li className="flex items-start gap-2 text-gray-700">
            <span>🔄</span>
            <span>Always‑fresh, exclusive data</span>
          </li>
          <li className="flex items-start gap-2 text-gray-700">
            <span>🚫</span>
            <span>You're not buried among hundreds of ignored CVs</span>
          </li>
          <li className="flex items-start gap-2 text-gray-700">
            <span>🎯</span>
            <span>
              It works <em>because</em> it isn't free for everyone
            </span>
          </li>
        </ul>

        <div className="border border-yellow-300 rounded-xl bg-gradient-to-b from-yellow-50 to-white p-2 font-bold text-yellow-800">
          💡 <strong>Worth it even once:</strong> if one direct reply leads to
          one paid shift, the contact already paid for itself.
        </div>
      </article>
    </section>
  );
}

// Before/After Proof Section
function ProofSection() {
  return (
    <section className="mb-6">
      <h2 className="text-[#222] text-[18px] font-bold mb-1">
        Before → After (your inbox)
      </h2>
      <p className="text-gray-600 mb-4">
        <strong>No‑risk. No nonsense.</strong> The only thing that changes is{" "}
        <em>who</em> receives your message.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <article className="border border-gray-200 rounded-xl bg-white p-3 shadow-lg">
          <span className="inline-block px-2 py-1 rounded-full bg-red-50 border border-red-200 text-red-800 text-xs mb-2">
            Before — job portal
          </span>
          <div className="font-bold text-gray-800 mb-1">
            Subject: Application – Warehouse Assistant
          </div>
          <div className="text-gray-600">
            To: <strong>no-reply@portal.com</strong> · "We'll get back to you."
          </div>
        </article>

        <article className="border border-gray-200 rounded-xl bg-white p-3 shadow-lg">
          <span className="inline-block px-2 py-1 rounded-full bg-green-50 border border-green-200 text-green-800 text-xs mb-2">
            After — direct HR
          </span>
          <div className="font-bold text-gray-800 mb-1">
            Subject: Candidate — Warehouse Assistant — Bogotá
          </div>
          <div className="text-gray-600">
            To: <strong>JG</strong>{" "}
            <span className="text-gray-500">@prosegur.com</span> · "Night shifts
            • start today"
          </div>
        </article>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="inline-block px-2 py-1 rounded-full border border-gray-300 bg-gray-50 text-xs">
          ✅ Verified ≤24h
        </span>
        <span className="inline-block px-2 py-1 rounded-full border border-gray-300 bg-gray-50 text-xs">
          🔄 Bounce → replacement
        </span>
        <span className="inline-block px-2 py-1 rounded-full border border-gray-300 bg-gray-50 text-xs">
          📬 Direct contact only
        </span>
        <span className="inline-block px-2 py-1 rounded-full border border-gray-300 bg-gray-50 text-xs">
          🧭 Fair use: 1 contact / 5 days pr. company
        </span>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const faqs = [
    {
      question: "Do you guarantee a job?",
      badge: "Transparency",
      answer:
        "No. You're buying access to a verified HR contact and a short, tailored message we draft for you. It increases your chance to be heard, but it's not an employment guarantee.",
    },
    {
      question: "What exactly do I get when I unlock?",
      badge: "What's included",
      answer: (
        <ul className="space-y-1">
          <li>
            <strong>Name + email + phone</strong> (HR/TA) — verified ≤24h
          </li>
          <li>
            <strong>Professional message</strong> (subject + body) — ready to
            send
          </li>
          <li>
            <strong>Bounce → free replacement</strong> of the contact channel
          </li>
          <li>
            Fair use: <strong>1 contact / 5 days</strong> per company
          </li>
        </ul>
      ),
    },
    {
      question: "Where do the contacts come from?",
      badge: "Sources",
      answer:
        "We use official company channels, relay addresses (we forward safely), and named HR/TA inboxes where appropriate. We verify deliverability and freshness (≤24h) before showing them.",
    },
    {
      question: "What if my email bounces or the channel is inactive?",
      badge: "Replacement",
      answer:
        "You get a free replacement (same company/role, or the best available alternative). No extra cost.",
    },
    {
      question: "Why only 1 contact every 5 days (same company)?",
      badge: "Fair use",
      answer:
        "It protects your reputation with HR and keeps reply rates high for everyone. If you need more volume, use different companies or locations.",
    },
    {
      question: "How do you increase my chance of a reply?",
      badge: "Signal",
      answer: (
        <div>
          <p className="mb-2">
            We front-load what HR screens for in entry-level roles:
          </p>
          <ul className="space-y-1 ml-4">
            <li>
              <strong>Shifts</strong> (nights/weekends/rotating)
            </li>
            <li>
              <strong>Start date</strong> (today / this week)
            </li>
            <li>
              <strong>Proximity</strong> (live near site/route)
            </li>
            <li>
              <strong>Simple certificates</strong> (forklift, HSE)
            </li>
          </ul>
          <p className="mt-2">
            You can tick 1–3 "extras" — we add them to your first line.
          </p>
        </div>
      ),
    },
    {
      question: "Can I use WhatsApp?",
      badge: "Channels",
      answer:
        "Yes. We start with a short email (best for tracking & deliverability) and you can add a WhatsApp follow-up after 24–72h if needed.",
    },
    {
      question: 'What does "Verified ≤24h" mean?',
      badge: "Freshness",
      answer:
        "It means we've recently validated the channel's deliverability or activity within the last 24 hours. If it turns out inactive or bounces, we replace it free of charge.",
    },
    {
      question: "How much does it cost?",
      badge: "Pricing",
      answer:
        "It's 5 kr per unlocked contact. You can add more later. Replacement for bounces is included.",
    },
    {
      question: "Do you attach files? Will my email land in spam?",
      badge: "Deliverability",
      answer:
        "We keep the first message lightweight: no heavy attachments, and usually a single link if needed. We also optimize subject/snippet length for mobile previews.",
    },
    {
      question: "What happens after I unlock?",
      badge: "Next steps",
      answer: (
        <ul className="space-y-1">
          <li>You see the full contact details</li>
          <li>Your message is ready to send (you can edit)</li>
          <li>
            Optional: schedule a <strong>follow-up in 3 business days</strong>
          </li>
        </ul>
      ),
    },
    {
      question: "Which roles is this best for?",
      badge: "Scope",
      answer:
        "Entry-level roles with frequent shifts/peaks: warehouse (picking/packing, inventory), security (access/CCTV), retail (cashier/customer care), and last-mile (motorbike deliveries).",
    },
    {
      question: "Privacy & respect for HR",
      badge: "Policy",
      answer:
        "No mass-sending. One respectful 1:1 message. HR can opt out. We protect PII until you unlock, and we rotate channels to avoid over-contacting the same inbox.",
    },
  ];

  return (
    <section className="mb-6">
      <div className="border border-gray-200 rounded-xl bg-white shadow-lg overflow-hidden text-gray-600">
        <h2 className="text-xl text-gray-700 font-semibold p-3 border-b border-gray-200">
          FAQ — Everything you need to know
        </h2>
        <ul className="space-y-0">
          {faqs.map((faq, index) => (
            <li
              key={index}
              className="border-t border-gray-200 first:border-t-0"
            >
              <details className="group">
                <summary className="flex items-center gap-2 p-3 font-bold cursor-pointer hover:bg-gray-50 transition-colors text-gray-700">
                  <span className="flex-1 text-gray-700">{faq.question}</span>
                  <span className="inline-block px-2 py-1 rounded-full border border-gray-300 bg-gray-50 text-xs ml-auto text-gray-700">
                    {faq.badge}
                  </span>
                </summary>
                <div className="px-3 leading-relaxed">
                  {typeof faq.answer === "string" ? (
                    <p>{faq.answer}</p>
                  ) : (
                    faq.answer
                  )}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Sticky CTA Component
function StickyCTA() {
  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 bg-white border-t border-gray-200 p-3">
      <div className="container max-w-screen-md mx-auto">
        <div className="flex flex-col gap-2 mb-2">
          <button className="flex-1 px-4 py-2 rounded-xl font-bold text-yellow-900 bg-gradient-to-b from-yellow-300 to-yellow-400 border border-yellow-500 shadow-md hover:shadow-lg transition-all">
            Unlock 2 verified contacts
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-all">
            How it works (60s)
          </button>
        </div>
        <div className="text-xs text-gray-600 text-center">
          No account required · Short message · Verified ≤24h · Bounce →
          replacement
        </div>
      </div>
    </div>
  );
}

// Main Guide Page Component
export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-2 text-gray-600 text-sm">
      <div className="container max-w-screen-md mx-auto py-2">
        <div className="bg-white shadow-lg p-4">
          <HowItWorksSection />

          <h2 className="text-[#222] text-[18px] font-bold mb-1">
            Selected just for you
          </h2>

          <WhyThisWorksSection />

          <ProofSection />

          <FAQSection />
        </div>
      </div>

      {/* <StickyCTA /> */}
    </div>
  );
}
