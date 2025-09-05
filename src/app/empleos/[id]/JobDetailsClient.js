/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";

// Job Hero Section Component
function JobHeroSection({ job, contacts, liveJobs }) {
  return (
    <header className="relative border border-yellow-300 rounded-2xl bg-white shadow-lg overflow-hidden p-4 mb-4">
      <div className="absolute left-0 right-0 top-0 h-24 z-0 bg-gradient-to-r from-yellow-400 to-yellow-300 opacity-60"></div>
      <div className="relative z-10 grid grid-cols-[64px_1fr] gap-3 items-center">
        <div className="w-16 h-16 rounded-xl bg-yellow-400 border border-yellow-300 flex items-center justify-center shadow-lg font-black text-yellow-900">
          {job?.company?.name?.substring(0, 2)?.toUpperCase() || "CO"}
        </div>
        <div>
          <h1 className="text-xl font-black text-yellow-900 mb-1">
            {job?.title || "Job Title"}
          </h1>
          <p className="text-yellow-800 opacity-90 mb-2">
            {job?.location?.join(", ") || "Location"} ·{" "}
            {job?.experience_level || "Entry-level"} ·{" "}
            {job?.employment_type || "Full-time"}
          </p>
          <div className="flex gap-2 flex-wrap">
            <div className="min-w-24 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
              <div className="text-xs text-gray-500 font-bold">Contacts</div>
              <div className="font-black text-sm text-gray-800">
                {contacts.length} verified
              </div>
            </div>
            <div className="min-w-24 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
              <div className="text-xs text-gray-500 font-bold">
                Live listings
              </div>
              <div className="font-black text-sm text-gray-800">
                {liveJobs.length}
              </div>
            </div>
            <div className="min-w-20 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
              <div className="text-xs text-gray-500 font-bold">Status</div>
              <div className="font-black text-sm text-gray-800">Open</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// HR Contacts Section Component
function ContactsSection({ contacts, selectedContactId, onContactSelect }) {
  const [showMoreContacts, setShowMoreContacts] = useState(false);
  const [showGuideHR, setShowGuideHR] = useState(false);

  return (
    <section className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-bold text-gray-800">Verified HR contact</h2>
        <button
          onClick={() => setShowGuideHR(!showGuideHR)}
          className="border border-gray-200 bg-gray-50 px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-gray-100 transition-colors"
          aria-pressed={showGuideHR}
        >
          ? Tips
        </button>
      </div>

      {showGuideHR && (
        <div className="border border-gray-200 rounded-xl bg-gray-50 p-3 mb-2">
          <div className="font-bold mb-1">How to pick the best contact</div>
          <ul className="space-y-1 ml-4 text-sm">
            <li>Prefer the most active contact with higher reply %.</li>
            <li>
              Fair-use: <strong>1 contact / 5 days</strong> per company keeps
              reply rates high.
            </li>
            <li>
              Bounced message? You get a <strong>free replacement</strong>.
            </li>
          </ul>
        </div>
      )}

      <div
        className={`border border-gray-200 rounded-xl bg-white p-3 shadow-lg cursor-pointer ${
          selectedContactId === "p1" ? "ring-2 ring-yellow-400 shadow-xl" : ""
        } mb-2`}
        onClick={() => onContactSelect("p1")}
      >
        <div className="grid grid-cols-[56px_1fr_auto] gap-3 items-center">
          <div className="w-14 h-14 rounded-xl bg-yellow-100 border border-gray-200 flex items-center justify-center font-black text-yellow-900">
            {contacts[0].initials}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">
              👤 Name: 🔒 · {contacts[0].role} — {contacts[0].company}
            </h3>
            <div className="text-xs text-gray-600 mb-1">
              {contacts[0].city} ·{" "}
              <span className="border border-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
                Verified ≤24h
              </span>{" "}
              <span className="border border-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
                Reply {contacts[0].reply}%
              </span>{" "}
              <span className="border border-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
                Active: {contacts[0].active}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              Email: {contacts[0].domain} 🔒 · Phone: 🔒
            </div>
          </div>
          <span className="border border-gray-300 bg-gray-50 px-2 py-1 rounded-full text-xs">
            {selectedContactId === "p1" ? "Selected" : "Tap to select"}
          </span>
        </div>
      </div>

      <button
        onClick={() => setShowMoreContacts(!showMoreContacts)}
        className="border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl w-full hover:bg-gray-100 transition-colors"
      >
        {showMoreContacts ? "Hide contacts" : "Show more contacts"}
      </button>

      {showMoreContacts && (
        <div className="space-y-2 mt-2">
          {contacts.slice(1).map((contact) => (
            <div
              key={contact.id}
              className={`border border-gray-200 rounded-xl bg-white p-3 shadow-lg cursor-pointer ${
                selectedContactId === contact.id
                  ? "ring-2 ring-yellow-400 shadow-xl"
                  : ""
              }`}
              onClick={() => onContactSelect(contact.id)}
            >
              <div className="grid grid-cols-[56px_1fr_auto] gap-3 items-center">
                <div className="w-14 h-14 rounded-xl bg-yellow-100 border border-gray-200 flex items-center justify-center font-black text-yellow-900">
                  {contact.initials}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">
                    👤 Name: 🔒 · {contact.role} — {contact.company}
                  </h3>
                  <div className="text-xs text-gray-600 mb-1">
                    {contact.city} ·{" "}
                    <span className="border border-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
                      Verified ≤24h
                    </span>{" "}
                    <span className="border border-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
                      Reply {contact.reply}%
                    </span>{" "}
                    <span className="border border-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
                      Active: {contact.active}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Email: {contact.domain} 🔒 · Phone: 🔒
                  </div>
                </div>
                <span className="border border-gray-300 bg-gray-50 px-2 py-1 rounded-full text-xs">
                  {selectedContactId === contact.id
                    ? "Selected"
                    : "Tap to select"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        Fair use keeps reply rates high:{" "}
        <strong>1 contact per company every 5 days.</strong> Bounce? You get a
        replacement.
      </p>
    </section>
  );
}

// Live Listings Section Component
function LiveListingsSection({ liveJobs, extJob, onReferenceSelect }) {
  const [showMoreLive, setShowMoreLive] = useState(false);

  const freshness = (hours) => {
    if (hours <= 24) return "Updated: Today";
    if (hours <= 48) return "Updated: Yesterday";
    const days = Math.ceil(hours / 24);
    return `Updated: ${days}d`;
  };

  return (
    <section className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">Live listings</h2>
          <span className="border border-gray-300 bg-gray-50 px-2 py-0.5 rounded-full text-xs">
            {liveJobs.length}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {extJob
            ? `Using: ${extJob.source} — ${extJob.title}`
            : "Using: AI snapshot"}
        </span>
      </div>

      <div className="space-y-2">
        {liveJobs.slice(0, 2).map((liveJob) => (
          <div
            key={liveJob.id}
            className={`border border-gray-200 rounded-xl bg-white p-3 shadow-lg cursor-pointer ${
              extJob?.id === liveJob.id
                ? "ring-2 ring-yellow-400 shadow-xl"
                : ""
            }`}
            onClick={() => onReferenceSelect("live", liveJob)}
          >
            <div className="grid grid-cols-[56px_1fr_auto] gap-3 items-center">
              <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-gray-700">
                {liveJob.source[0]}
              </div>
              <div className="flex flex-col space-y-1">
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">
                    {liveJob.title}
                  </h3>
                </div>
                <div className="text-xs text-gray-600">
                  <span className="border border-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
                    {liveJob.source}
                  </span>{" "}
                  · {liveJob.city} ·{" "}
                  <span className="border border-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
                    {freshness(liveJob.ageHours)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <a
                    href={liveJob.url}
                    target="_blank"
                    rel="noopener"
                    className="border border-gray-200 bg-gray-50 px-3 py-1 rounded-xl text-xs hover:bg-gray-100 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open ↗
                  </a>
                </div>
                <button
                  className="border border-gray-200 bg-gray-50 px-3 py-1 rounded-xl text-xs w-full hover:bg-gray-100 transition-colors"
                  onClick={() => onReferenceSelect("live", liveJob)}
                >
                  Use as reference
                </button>
              </div>
            </div>
          </div>
        ))}

        {showMoreLive && liveJobs.length > 2 && (
          <div className="space-y-2">
            {liveJobs.slice(2).map((liveJob) => (
              <div
                key={liveJob.id}
                className={`border border-gray-200 rounded-xl bg-white p-3 shadow-lg cursor-pointer ${
                  extJob?.id === liveJob.id
                    ? "ring-2 ring-yellow-400 shadow-xl"
                    : ""
                }`}
                onClick={() => onReferenceSelect("live", liveJob)}
              >
                <div className="grid grid-cols-[56px_1fr_auto] gap-3 items-center">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-gray-700">
                    {liveJob.source[0]}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">
                        {liveJob.title}
                      </h3>
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="border border-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
                        {liveJob.source}
                      </span>{" "}
                      · {liveJob.city} ·{" "}
                      <span className="border border-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
                        {freshness(liveJob.ageHours)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <a
                        href={liveJob.url}
                        target="_blank"
                        rel="noopener"
                        className="border border-gray-200 bg-gray-50 px-3 py-1 rounded-xl text-xs hover:bg-gray-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open ↗
                      </a>
                    </div>
                    <button
                      className="border border-gray-200 bg-gray-50 px-3 py-1 rounded-xl text-xs w-full hover:bg-gray-100 transition-colors"
                      onClick={() => onReferenceSelect("live", liveJob)}
                    >
                      Use as reference
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {liveJobs.length > 2 && (
          <button
            onClick={() => setShowMoreLive(!showMoreLive)}
            className="border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl w-full hover:bg-gray-100 transition-colors"
          >
            {showMoreLive ? "Hide live jobs" : "Show more live jobs"}
          </button>
        )}
      </div>
    </section>
  );
}

// AI Job Snapshot Section Component
function AISnapshotSection({ job, extJob, onReferenceSelect }) {
  const [showGuideSnap, setShowGuideSnap] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [linkFeedback, setLinkFeedback] = useState({
    show: false,
    type: "",
    message: "",
  });

  const handleSaveLink = () => {
    const val = linkValue.trim();
    if (!val) {
      setLinkFeedback({
        show: true,
        type: "err",
        message: "Please paste a valid URL.",
      });
      return;
    }

    let host = "link";
    try {
      host = new URL(val).hostname;
    } catch {
      setLinkFeedback({
        show: true,
        type: "err",
        message: "Please paste a valid URL.",
      });
      return;
    }

    onReferenceSelect("user", { url: val, host });
    setLinkFeedback({
      show: true,
      type: "ok",
      message: `Saved ✓ Using ${host} as reference.`,
    });
    setLinkValue("");
  };

  return (
    <section className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-bold text-gray-800">AI job snapshot</h2>
        <button
          onClick={() => setShowGuideSnap(!showGuideSnap)}
          className="border border-gray-200 bg-gray-50 px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-gray-100 transition-colors"
          aria-pressed={showGuideSnap}
        >
          ? Tips
        </button>
      </div>

      {showGuideSnap && (
        <div className="border border-gray-200 rounded-xl bg-gray-50 p-3 mb-2">
          <div className="font-bold mb-1">When we use the snapshot</div>
          <ul className="space-y-1 ml-4 text-sm">
            <li>
              If no live listing is selected, we'll use this snapshot as
              reference.
            </li>
            <li>You can paste a link below to override it any time.</li>
            <li>
              We keep your first line short: role + city + concrete detail.
            </li>
          </ul>
        </div>
      )}

      <div
        className={`border border-gray-200 rounded-xl bg-white p-4 shadow-lg cursor-pointer ${
          !extJob ? "ring-2 ring-yellow-400 shadow-xl" : ""
        }`}
        onClick={() => onReferenceSelect("snapshot")}
      >
        <p className="text-xs text-gray-500 mb-4">
          Based on past postings (Computrabajo, LinkedIn, official pages). Paste
          a link if you want us to cite a current listing in your first line.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="font-bold mb-2">Requirements</div>
            <ul className="text-sm space-y-1">
              {(
                job?.requirements || [
                  "Certificado de vigilancia (vigente)",
                  "Turnos rotativos / noche",
                  "Antecedentes limpios",
                  "Buena comunicación al cliente",
                ]
              ).map((req, i) => (
                <li key={i}>• {req}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-bold mb-2">Nice to have</div>
            <ul className="text-sm space-y-1">
              {(
                job?.nice_to_have || [
                  "Experiencia en CCTV / monitoreo",
                  "Licencia de moto A2",
                  "Curso primeros auxilios",
                ]
              ).map((nice, i) => (
                <li key={i}>• {nice}</li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className={`flex gap-2 border rounded-xl p-2 ${
            linkFeedback.show && linkFeedback.type === "ok"
              ? "border-green-200 bg-green-50"
              : linkFeedback.show && linkFeedback.type === "err"
              ? "border-red-200 bg-red-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <span className="text-lg opacity-80">🔗</span>
          <input
            type="url"
            placeholder="Paste a job link (optional) — we'll cite it in your first line"
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm"
          />
          <button
            onClick={handleSaveLink}
            className="border border-gray-200 bg-gray-50 px-3 py-2 rounded-xl text-sm hover:bg-gray-100 transition-colors"
          >
            Save
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Tip: use a clean URL (no tracking params). One link is enough.
        </p>

        {linkFeedback.show && (
          <p
            className={`text-xs mt-1 ${
              linkFeedback.type === "ok" ? "text-green-600" : "text-red-600"
            }`}
          >
            {linkFeedback.message}
          </p>
        )}

        <div className="flex justify-end mt-3">
          <button
            onClick={() => onReferenceSelect("snapshot")}
            className="border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Use snapshot as reference
          </button>
        </div>
      </div>
    </section>
  );
}

// What Can You Offer Section Component
function OfferSection({ extras, extrasLabels, onExtraToggle, quality }) {
  const [showGuideOffer, setShowGuideOffer] = useState(false);

  return (
    <section className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-bold text-gray-800">What can you offer?</h2>
        <button
          onClick={() => setShowGuideOffer(!showGuideOffer)}
          className="border border-gray-200 bg-gray-50 px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-gray-100 transition-colors"
          aria-pressed={showGuideOffer}
        >
          ? Tips
        </button>
      </div>

      {showGuideOffer && (
        <div className="border border-gray-200 rounded-xl bg-gray-50 p-3 mb-2">
          <div className="font-bold mb-1">What HR reacts to</div>
          <ul className="space-y-1 ml-4 text-sm">
            <li>Night shifts or immediate start (specific availability).</li>
            <li>Relevant certifications (license, first aid).</li>
            <li>Proximity ("live nearby"). Pick 1–3 for best results.</li>
          </ul>
        </div>
      )}

      <div className="border border-gray-200 rounded-xl bg-white p-4 shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-gray-500">
            Pick 1–3 extras — HR replies faster when you're specific.
          </p>
          <span
            className={`text-xs border rounded-full px-2 py-1 ${
              quality.class === "q-ready"
                ? "bg-green-50 border-green-200 text-green-700"
                : quality.class === "q-ok"
                ? "bg-orange-50 border-orange-200 text-orange-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {quality.text}
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {Object.entries(extrasLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => onExtraToggle(key)}
              className={`border rounded-full px-3 py-2 text-xs cursor-pointer transition-colors ${
                extras.has(key)
                  ? "border-yellow-300 bg-gradient-to-b from-yellow-100 to-white font-semibold"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              {label.charAt(0).toUpperCase() + label.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// Ready Summary Section Component
function ReadySummarySection({
  selectedContact,
  extJob,
  extras,
  extrasLabels,
  quality,
}) {
  return (
    <section>
      <h2 className="text-lg font-bold text-gray-800 mb-2">Ready to send</h2>
      <div className="border border-gray-200 rounded-xl bg-white p-4 shadow-lg space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-bold">Contact</span>
          <span className="text-sm">
            {selectedContact.initials} · {selectedContact.role} —{" "}
            {selectedContact.city}{" "}
            <span className="ml-1 border border-gray-300 bg-gray-50 px-2 py-0.5 rounded-full text-xs">
              Reply {selectedContact.reply}%
            </span>{" "}
            <span className="ml-1 border border-gray-300 bg-gray-50 px-2 py-0.5 rounded-full text-xs">
              Active: {selectedContact.active}
            </span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-bold">Reference</span>
          <span className="text-sm">
            {extJob ? `${extJob.source} — ${extJob.title}` : "AI snapshot"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-bold">Best time</span>
          <span className="text-sm">Monday 09:15 ({selectedContact.city})</span>
        </div>
        <div className="flex justify-between items-center gap-1">
          <div>
            <span className="font-bold">Extras</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {extras.size > 0 ? (
              Array.from(extras)
                .map((key) => extrasLabels[key])
                .map((label) => (
                  <span
                    key={label}
                    className="border border-gray-300 bg-gray-50 px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
                  >
                    {label}
                  </span>
                ))
            ) : (
              <span className="border border-gray-300 bg-gray-50 px-2 py-0.5 rounded-full text-xs">
                —
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-bold">Quality</span>
          <span
            className={`text-sm border rounded-full px-2 py-0.5 text-xs ${
              quality.class === "q-ready"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-gray-50 border-gray-300"
            }`}
          >
            {quality.text}
          </span>
        </div>
      </div>
    </section>
  );
}

// Sticky Apply Footer Component
function StickyApplyFooter({ selectedContact }) {
  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 bg-white border-t border-gray-200 p-3 shadow-lg">
      <div className="container max-w-screen-md mx-auto">
        <div className="flex gap-2 mb-2">
          <button className="flex-1 bg-gradient-to-b from-yellow-300 to-yellow-400 border border-yellow-300 text-yellow-900 font-black px-4 py-3 rounded-xl shadow-lg hover:from-yellow-400 hover:to-yellow-500 transition-all">
            Apply now
          </button>
          <span className="border border-gray-300 bg-gray-50 px-3 py-3 rounded-full text-xs">
            Selected: {selectedContact.initials} · {selectedContact.role} (
            {selectedContact.city})
          </span>
        </div>
        <div className="text-xs text-gray-500 text-center">
          Next: checkout to unlock {selectedContact.initials} (
          {selectedContact.role}) at {selectedContact.company}. We'll open your
          message, pre-filled with subject + first line.
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
const JobDetailsClient = ({ job }) => {
  const [selectedContactId, setSelectedContactId] = useState("p1");
  const [extJob, setExtJob] = useState(null);
  const [extras, setExtras] = useState(new Set(["nights", "start"]));

  // Mock data - in real app this would come from API
  const contacts = [
    {
      id: "p1",
      initials: "JG",
      role: "HR",
      company: job?.company?.name || "Company",
      city: "Bogotá",
      reply: 78,
      active: "today",
      domain: `@${job?.company?.name?.toLowerCase()}.com`,
    },
    {
      id: "p2",
      initials: "MA",
      role: "TA",
      company: job?.company?.name || "Company",
      city: "Medellín",
      reply: 82,
      active: "yesterday",
      domain: `@${job?.company?.name?.toLowerCase()}.com`,
    },
    {
      id: "p3",
      initials: "LC",
      role: "HR",
      company: job?.company?.name || "Company",
      city: "Bogotá",
      reply: 74,
      active: "≤7d",
      domain: `@${job?.company?.name?.toLowerCase()}.com`,
    },
  ];

  const liveJobs = [
    {
      id: "ct_901",
      title: job?.title || "Job Title",
      source: "Computrabajo",
      url: "https://example.com/ct_901",
      city: "Bogotá",
      ageHours: 6,
    },
    {
      id: "li_554",
      title: job?.title || "Job Title",
      source: "LinkedIn",
      url: "https://example.com/li_554",
      city: "Bogotá",
      ageHours: 28,
    },
    {
      id: "of_220",
      title: job?.title || "Job Title",
      source: "Official careers",
      url: "https://example.com/of_220",
      city: "Bogotá",
      ageHours: 46,
    },
  ];

  const extrasLabels = {
    nights: "night shifts",
    start: "start immediately",
    cctv: "CCTV monitoring",
    license: "security license (valid)",
    motorcycle: "motorcycle (A2)",
    customer: "customer service",
    nearby: "live nearby",
    firstaid: "first aid course",
  };

  // Helper functions
  const getQuality = () => {
    const n = extras.size;
    if (n >= 2) return { text: "Ready", class: "q-ready" };
    if (n === 1) return { text: "OK", class: "q-ok" };
    return { text: "Weak", class: "q-weak" };
  };

  const handleContactSelect = (contactId) => {
    setSelectedContactId(contactId);
  };

  const handleExtraToggle = (extraKey) => {
    const newExtras = new Set(extras);
    if (newExtras.has(extraKey)) {
      newExtras.delete(extraKey);
    } else {
      newExtras.add(extraKey);
    }
    setExtras(newExtras);
  };

  const handleReferenceSelect = (type, jobData = null) => {
    if (type === "live") {
      setExtJob(jobData);
    } else if (type === "user") {
      setExtJob({
        id: "own_" + Date.now(),
        title: "Referenced posting",
        source: jobData.host,
        url: jobData.url,
        city: job?.location?.[0] || "Bogotá",
      });
    } else {
      setExtJob(null);
    }
  };

  const selectedContact =
    contacts.find((c) => c.id === selectedContactId) || contacts[0];
  const quality = getQuality();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-2 text-gray-600 text-sm pb-8">
      <div className="container max-w-screen-md mx-auto">
        <div className="bg-white shadow-lg overflow-hidden py-4 px-4">
          <JobHeroSection job={job} contacts={contacts} liveJobs={liveJobs} />

          <ContactsSection
            contacts={contacts}
            selectedContactId={selectedContactId}
            onContactSelect={handleContactSelect}
          />

          <LiveListingsSection
            liveJobs={liveJobs}
            extJob={extJob}
            onReferenceSelect={handleReferenceSelect}
          />

          <AISnapshotSection
            job={job}
            extJob={extJob}
            onReferenceSelect={handleReferenceSelect}
          />

          <OfferSection
            extras={extras}
            extrasLabels={extrasLabels}
            onExtraToggle={handleExtraToggle}
            quality={quality}
          />

          <ReadySummarySection
            selectedContact={selectedContact}
            extJob={extJob}
            extras={extras}
            extrasLabels={extrasLabels}
            quality={quality}
          />
        </div>
      </div>

      <StickyApplyFooter selectedContact={selectedContact} />
    </div>
  );
};

export default JobDetailsClient;
