/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useState } from "react";

// Hero Section Component
function HeroSection() {
  return (
    <header className="relative border border-gray-200 rounded-2xl bg-white shadow-lg overflow-hidden p-4 mb-4">
      <div className="absolute left-0 right-0 top-0 h-32 z-0 bg-gradient-to-b from-yellow-400 via-yellow-300 to-yellow-100 opacity-90 border-b border-yellow-300"></div>

      <div className="relative z-10">
        <div className="inline-flex gap-2 items-center bg-white border border-yellow-300 rounded-xl p-2 md:p-4: font-bold text-yellow-900 shadow-md mb-2">
          <span>🚀</span>
          <span className="font-black">Access now</span>
          <span>·</span>
          <span>ready in 1 minute</span>
        </div>

        <h1 className="text-2xl font-black text-yellow-900 mb-2">
          🎯 Unlock now and get
        </h1>

        <p className="text-yellow-800 opacity-90 mb-4">
          Direct HR contact for entry-level roles (warehouse, security, retail).
        </p>

        <div className="space-y-2 mb-4">
          <div className="border border-yellow-300 rounded-xl bg-gradient-to-b from-yellow-50 to-white p-3 font-bold text-yellow-900">
            🔓 Unlock <strong>verified contacts</strong>
          </div>
          <div className="border border-yellow-300 rounded-xl bg-gradient-to-b from-yellow-50 to-white p-3 font-bold text-yellow-900">
            ✍️ We draft a professional message for you —{" "}
            <strong>ready to send</strong>
          </div>
          <div className="border border-yellow-300 rounded-xl bg-gradient-to-b from-yellow-50 to-white p-3 font-bold text-yellow-900">
            📬 Reach the recruiter <strong>directly</strong>
          </div>
          <div className="border border-yellow-300 rounded-xl bg-gradient-to-b from-yellow-50 to-white p-3 font-bold text-yellow-900">
            🚀 <strong>91%</strong> get a reply within{" "}
            <strong>5 business days</strong>
          </div>
          <div className="border border-yellow-300 rounded-xl bg-gradient-to-b from-yellow-50 to-white p-3 font-bold text-yellow-900">
            ✅ Fast access + WhatsApp support
          </div>
          <div className="border border-yellow-300 rounded-xl bg-gradient-to-b from-yellow-50 to-white p-3 font-bold text-yellow-900">
            📍 Your city: <strong>Bogotá</strong> — <strong>247</strong>{" "}
            openings this week
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link
            href="/guia"
            className="flex-1 bg-gradient-to-b from-yellow-300 to-yellow-400 border border-yellow-300 text-yellow-900 font-black px-4 py-3 rounded-xl shadow-lg hover:from-yellow-400 hover:to-yellow-500 transition-all text-center"
          >
            How to get started
          </Link>
          <Link
            href="/empleos"
            className="flex-1 border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-center"
          >
            See nearby jobs
          </Link>
        </div>
      </div>
    </header>
  );
}

// Testimonials Section Component
function TestimonialsSection() {
  return (
    <section className="mb-4">
      <h2 className="text-lg font-bold text-gray-800 mb-2">
        What candidates say
      </h2>
      <div className="border border-gray-200 rounded-xl bg-white p-4 shadow-lg">
        <div className="space-y-3">
          <p className="text-gray-600 italic">
            "Got a reply in 3 days — offering night shifts helped."
          </p>
          <p className="text-gray-600 italic">
            "HR asked for my CV right away. Short email did the trick."
          </p>
          <p className="text-gray-600 italic">
            "Finally found a direct contact instead of those job portals."
          </p>
        </div>
      </div>
    </section>
  );
}

// How It Works Section Component
function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Pick a job",
      description:
        "Select from active listings, insert a job link or use our AI to reach out to the contact.",
    },
    {
      number: "2",
      title: "Unlock verified contact",
      description: "Name + email + phone. Bounced? Free replacement.",
    },
    {
      number: "3",
      title: "Send professional message",
      description:
        "We write a cover letter on your behalf based on your settings. You can edit everything.",
    },
  ];

  return (
    <section className="mb-4">
      <h2 className="text-lg font-bold text-gray-800 mb-2">How it works</h2>
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.number}
            className="border border-gray-200 rounded-xl bg-white p-3 shadow-lg"
          >
            <div className="grid grid-cols-[42px_1fr] gap-3 items-start">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 border border-yellow-300 font-black text-yellow-900 flex items-center justify-center">
                {step.number}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Support Section Component
function SupportSection() {
  return (
    <section className="border border-gray-200 rounded-xl bg-white shadow-lg p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-2">
        ❓ Do you need any help?
      </h2>
      <p className="text-gray-600 mb-4">
        We respond fast — choose the contact method that fits you best:
      </p>

      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <a
          href="mailto:support@apoyoalempleo.com"
          className="flex gap-3 items-center justify-center p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700"
        >
          <span className="text-lg">📧</span>
          <span className="font-semibold">Email support</span>
        </a>
        <a
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-3 items-center justify-center p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700"
        >
          <span className="text-lg">💬</span>
          <span className="font-semibold">Chat on WhatsApp</span>
        </a>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Available all weekdays: 08:00–20:00 (GMT‑5)
      </p>
    </section>
  );
}

// Quick Access Section Component
function QuickAccessSection() {
  const quickLinks = [
    {
      icon: "💼",
      title: "Browse Jobs",
      description: "Find entry-level positions",
      href: "/empleos",
    },
    {
      icon: "🏢",
      title: "Companies",
      description: "Explore hiring companies",
      href: "/empresas",
    },
    {
      icon: "👥",
      title: "HR Contacts",
      description: "Direct contact database",
      href: "/contactos",
    },
    {
      icon: "📚",
      title: "Job Guide",
      description: "Complete application guide",
      href: "/guia",
    },
  ];

  return (
    <section className="mb-4">
      <h2 className="text-lg font-bold text-gray-800 mb-2">Quick access</h2>
      <div className="grid md:grid-cols-2 gap-3">
        {quickLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="border border-gray-200 rounded-xl bg-white p-4 shadow-lg hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{link.icon}</div>
              <div>
                <h3 className="font-bold text-gray-800 group-hover:text-yellow-700 transition-colors">
                  {link.title}
                </h3>
                <p className="text-gray-600 text-sm">{link.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Stats Section Component
function StatsSection() {
  const stats = [
    { number: "2,500+", label: "Active jobs" },
    { number: "500+", label: "Companies" },
    { number: "91%", label: "Reply rate" },
    { number: "24h", label: "Verification time" },
  ];

  return (
    <section className="mb-4">
      <h2 className="text-lg font-bold text-gray-800 mb-2">
        Why candidates choose us
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl bg-white p-3 text-center shadow-lg"
          >
            <div className="text-xl font-black text-yellow-600">
              {stat.number}
            </div>
            <div className="text-xs text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Sticky CTA Footer Component
function StickyCTAFooter() {
  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 bg-white border-t border-gray-200 p-3 shadow-lg">
      <div className="container max-w-screen-md mx-auto">
        <div className="flex flex-col gap-2 mb-2 flex-wrap">
          <div className="flex gap-2 flex-col md:flex-row">
            <Link
              href="/guia"
              className="flex-1 bg-gradient-to-b from-yellow-300 to-yellow-400 border border-yellow-300 text-yellow-900 font-black px-4 py-3 rounded-xl shadow-lg hover:from-yellow-400 hover:to-yellow-500 transition-all text-center min-w-0"
            >
              Unlock 2 verified contacts
            </Link>
            <div className="flex items-center justify-center">
              <label className="flex items-center gap-2 text-xs text-gray-600 px-2">
                <input type="checkbox" disabled className="rounded" />
                Add +1 extra contact in 48h (+3 kr)
              </label>
            </div>
          </div>
          <Link
            href="/guia"
            className="border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-center"
          >
            How it works (60s)
          </Link>
        </div>
        <div className="text-xs text-gray-500 text-center">
          No account required · Verified ≤24h · 1 contact / 5 days · Bounce →
          replacement
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-2 md:px-4 text-gray-600 text-sm pb-26 md:pb-18">
      <div className="container max-w-screen-md mx-auto py-2 md:py-4">
        <div className="bg-white shadow-lg overflow-hidden p-2 md:p-4">
          <HeroSection />

          <TestimonialsSection />

          <HowItWorksSection />

          <QuickAccessSection />

          <StatsSection />

          <SupportSection />
        </div>
      </div>

      <StickyCTAFooter />
    </div>
  );
}
