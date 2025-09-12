/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import ApplyNowModal from "../../../components/ApplyNowModal";

// Job Hero Section Component
function JobHeroSection({ job, company, contactsLength, childJobsLength }) {
  return (
    <header
      className="mb-4 min-h-32 border-b p-2 md:p-4"
      style={{
        borderBottomColor: company.color || "#e7e7e7",
        background: `
          linear-gradient(180deg, ${
            company.color || "#e7e7e7"
          } 0 20%, transparent 20% 100%),
          radial-gradient(1000px 320px at 90% -80px, rgba(255,255,255,.14), rgba(255,255,255,0) 60%),
          linear-gradient(180deg, ${company.color || "#e7e7e7"} 0 20%, #fff 85%)
        `,
      }}
    >
      <div className="flex items-center gap-2 md:gap-4 pt-4">
        {/* Company Logo */}
        <div
          className="bg-white rounded-lg shadow-md border-1 border-[#e7e7e7] shadow-[0 8px 24px rgba(0, 0, 0, .06)] w-20 h-20 flex-shrink-0 flex justify-center items-center"
          style={{
            backgroundColor: company.color || "#e7e7e7",
          }}
        >
          <img
            src={company.logo_url || "/company-logo.png"}
            alt={`${company.name} logo`}
            className="h-full w-full object-contain rounded-lg"
          />
        </div>

        {/* Job Information */}
        <div className="flex flex-col w-full px-2 md:px-4 py-2 gap-1 justify-between">
          <h1 className="text-xl font-bold text-white drop-shadow-lg">
            {job.title}
          </h1>

          <div className="text-white text-sm font-semibold drop-shadow">
            🏢 {company.name}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4 text-white/80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-white text-sm drop-shadow">
              {job.location?.join(", ") || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Job Stats */}
      <div className="flex gap-1 mt-4 justify-center">
        <div className="flex items-center p-2 md:p-4 rounded-lg bg-white border border-gray-300 w-22">
          <div className="flex flex-col text-xs">
            <span>Contacts</span>
            <span className="font-bold">{contactsLength || 0} verified</span>
          </div>
        </div>
        <div className="flex items-center p-2 md:p-4 rounded-lg bg-white border border-gray-300 w-22">
          <div className="flex flex-col text-xs">
            <span>Live Listings</span>
            <span className="font-bold">{childJobsLength || 0}</span>
          </div>
        </div>
        <div className="flex items-center p-2 md:p-4 rounded-lg bg-white border border-gray-300 w-22">
          <div className="flex flex-col text-xs">
            <span>Status</span>
            <span className="font-bold">Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// HR Contacts Section Component
function ContactsSection({
  company,
  contacts,
  selectedContactId,
  onContactSelect,
}) {
  const [showMoreContacts, setShowMoreContacts] = useState(false);
  const [showGuideHR, setShowGuideHR] = useState(false);

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  return (
    <section className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-bold text-gray-800">Verified HR contact</h2>
        <button
          onClick={() => setShowGuideHR(!showGuideHR)}
          className="border border-gray-200 bg-gray-50 px-2 md:px-4 py-1 rounded-full text-xs cursor-pointer hover:bg-gray-100 transition-colors"
          aria-pressed={showGuideHR}
        >
          ? Tips
        </button>
      </div>

      {showGuideHR && (
        <div className="border border-gray-200 rounded-xl bg-gray-50 p-2 md:p-4 mb-2">
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

      {contacts?.length > 0 && (
        <div>
          <div
            className={`border border-gray-200 rounded-xl bg-white p-2 md:p-4 shadow-lg cursor-pointer ${
              selectedContactId === "p1" ? "ring-2 shadow-xl" : ""
            } mb-2`}
            style={{
              ...(selectedContactId === "p1" && {
                "--tw-ring-color": company.color || "#e7e7e7",
                "--tw-ring-opacity": "1",
              }),
            }}
            onClick={() => onContactSelect("p1")}
          >
            <div className="grid grid-cols-[56px_1fr_auto] gap-2 items-center">
              <div className="flex h-full">
                <div
                  className="w-14 h-14 rounded-xl border border-gray-300 flex items-center justify-center font-black text-white text-nowrap"
                  style={{
                    backgroundColor: company.color || "#e7e7e7",
                  }}
                >
                  {getInitials(contacts[0].name)}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  👤 Name: {getInitials(contacts[0].name)} 🔒
                </h3>
                <div className="flex md:flex-row gap-1 text-xs text-gray-600 font-bold mb-1">
                  <div>📧 Email: 🔒</div>
                  <div className="hidden md:block">•</div>
                  <div>📞 Phone: 🔒</div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                  <span className="text-gray-600 font-bold">
                    {contacts[0].city} •{" "}
                  </span>
                  <span className="border border-gray-300 bg-gray-50 px-1 py-0.5 rounded-full">
                    Active: {contacts[0].active}
                  </span>
                </div>
              </div>
              <span className="border border-gray-300 bg-gray-50 px-2 md:px-4 py-1 rounded-full text-xs text-nowrap">
                {selectedContactId === "p1" ? "Selected" : "Tap to select"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowMoreContacts(!showMoreContacts)}
            className="border border-gray-200 bg-gray-50 px-2 md:px-4 py-2 rounded-xl w-full hover:bg-gray-100 transition-colors"
          >
            {showMoreContacts ? "Hide contacts" : "Show more contacts"}
          </button>

          {showMoreContacts && (
            <div className="space-y-2 mt-2">
              {contacts.slice(1).map((contact) => (
                <div
                  key={contact.id}
                  className={`border border-gray-200 rounded-xl bg-white p-2 md:p-4 shadow-lg cursor-pointer ${
                    selectedContactId === contact.id ? "ring-2 shadow-xl" : ""
                  }`}
                  style={{
                    ...(selectedContactId === contact.id && {
                      "--tw-ring-color": company.color || "#e7e7e7",
                      "--tw-ring-opacity": "1",
                    }),
                  }}
                  onClick={() => onContactSelect(contact.id)}
                >
                  <div className="grid grid-cols-[56px_1fr_auto] gap-2 items-center">
                    <div className="flex h-full">
                      <div
                        className="w-14 h-14 rounded-xl border border-gray-300 flex items-center justify-center font-black text-white text-nowrap"
                        style={{
                          backgroundColor: company.color || "#e7e7e7",
                        }}
                      >
                        {getInitials(contact.name)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">
                        👤 Name: {getInitials(contact.name)} 🔒
                      </h3>
                      <div className="flex md:flex-row gap-1 text-xs text-gray-600 font-bold mb-1">
                        <div>📧 Email: 🔒</div>
                        <div className="hidden md:block">•</div>
                        <div>📞 Phone: 🔒</div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <span className="text-gray-600 font-bold">
                          {contact.city} •{" "}
                        </span>
                        <span className="border border-gray-300 bg-gray-50 px-1 py-0.5 rounded-full">
                          Active: {contact.active}
                        </span>
                      </div>
                    </div>
                    <span className="border border-gray-300 bg-gray-50 px-2 md:px-4 py-1 rounded-full text-xs">
                      {selectedContactId === contact.id
                        ? "Selected"
                        : "Tap to select"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {contacts?.length == 0 && (
        <div className="flex items-center justify-center py-2 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-600">
          <div className="text-center">
            <div className="text-gray-400 mb-1">👥</div>
            <div>No contacts found for this company.</div>
          </div>
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
function LiveListingsSection({
  company,
  childJobs,
  extJob,
  onReferenceSelect,
}) {
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
          <span className="border border-gray-300 bg-gray-50 px-2 md:px-4 py-0.5 rounded-full text-xs">
            {childJobs.length}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {extJob
            ? `Using: ${extJob.source} — ${extJob.title}`
            : "Using: AI snapshot"}
        </span>
      </div>

      <div className="space-y-2">
        {childJobs.slice(0, 2).map((liveJob) => (
          <div
            key={liveJob.id}
            className={`border border-gray-200 rounded-xl bg-white p-2 md:p-4 shadow-lg cursor-pointer ${
              extJob?.id === liveJob.id ? "ring-2 shadow-xl" : ""
            }`}
            style={{
              ...(extJob?.id === liveJob.id && {
                "--tw-ring-color": company.color || "#e7e7e7",
                "--tw-ring-opacity": "1",
              }),
            }}
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
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Location with icon */}
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
                    <svg
                      className="w-3 h-3 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="font-medium">{liveJob.city}</span>
                  </div>

                  {/* Source with enhanced styling */}
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 transition-colors`}
                  >
                    <span>{liveJob.source}</span>
                  </div>

                  {/* Freshness with dynamic styling */}
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 bg-gray-50 border rounded-full font-medium transition-all ${
                      (liveJob.ageHours || 0) <= 1
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                        : (liveJob.ageHours || 0) <= 6
                        ? "bg-green-50 border-green-200 text-green-700"
                        : (liveJob.ageHours || 0) <= 24
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : (liveJob.ageHours || 0) <= 48
                        ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                        : "bg-gray-50 border-gray-200 text-gray-600"
                    }`}
                  >
                    {(liveJob.ageHours || 0) <= 1 && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    )}
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      {(liveJob.ageHours || 0) <= 1
                        ? "Just now"
                        : (liveJob.ageHours || 0) <= 6
                        ? "Fresh"
                        : freshness(liveJob.ageHours || 0)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <a
                    href={liveJob.link}
                    target="_blank"
                    rel="noopener"
                    className="border border-gray-200 bg-gray-50 px-2 md:px-4 py-1 rounded-xl text-xs hover:bg-gray-100 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open ↗
                  </a>
                </div>
                <button
                  className="border border-gray-200 bg-gray-50 px-2 md:px-4 py-1 rounded-xl text-xs w-full hover:bg-gray-100 transition-colors"
                  onClick={() => onReferenceSelect("live", liveJob)}
                >
                  Use as reference
                </button>
              </div>
            </div>
          </div>
        ))}

        {showMoreLive && childJobs.length > 2 && (
          <div className="space-y-2">
            {childJobs.slice(2).map((liveJob) => (
              <div
                key={liveJob.id}
                className={`border border-gray-200 rounded-xl bg-white p-2 md:p-4 shadow-lg cursor-pointer ${
                  extJob?.id === liveJob.id ? "ring-2 shadow-xl" : ""
                }`}
                style={{
                  ...(extJob?.id === liveJob.id && {
                    "--tw-ring-color": "#10b981", // Using green color for live jobs to indicate "active"
                    "--tw-ring-opacity": "1",
                  }),
                }}
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
                      <span className="border border-gray-300 bg-gray-50 px-2 md:px-4 py-0.5 rounded-full">
                        {liveJob.source}
                      </span>{" "}
                      • {liveJob.city} •{" "}
                      <span className="border border-gray-300 bg-gray-50 px-2 md:px-4 py-0.5 rounded-full">
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
                        className="border border-gray-200 bg-gray-50 px-2 md:px-4 py-1 rounded-xl text-xs hover:bg-gray-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open ↗
                      </a>
                    </div>
                    <button
                      className="border border-gray-200 bg-gray-50 px-2 md:px-4 py-1 rounded-xl text-xs w-full hover:bg-gray-100 transition-colors"
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

        {childJobs.length > 2 && (
          <button
            onClick={() => setShowMoreLive(!showMoreLive)}
            className="border border-gray-200 bg-gray-50 px-2 md:px-4 py-2 rounded-xl w-full hover:bg-gray-100 transition-colors"
          >
            {showMoreLive ? "Hide live jobs" : "Show more live jobs"}
          </button>
        )}
      </div>
    </section>
  );
}

// AI Job Snapshot Section Component
function AISnapshotSection({ job, company, aiSnapshot, onReferenceSelect }) {
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
          className="border border-gray-200 bg-gray-50 px-2 md:px-4 py-1 rounded-full text-xs cursor-pointer hover:bg-gray-100 transition-colors"
          aria-pressed={showGuideSnap}
        >
          ? Tips
        </button>
      </div>

      {showGuideSnap && (
        <div className="border border-gray-200 rounded-xl bg-gray-50 p-2 md:p-4 mb-2">
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
        className={`border border-gray-200 rounded-xl bg-white p-2 md:p-4 shadow-lg cursor-pointer ring-2 shadow-xl`}
        style={{
          "--tw-ring-color": company.color || "#3b82f6",
          "--tw-ring-opacity": "1",
        }}
        onClick={() => onReferenceSelect("snapshot")}
      >
        <p className="text-xs text-gray-500 mb-4">
          Based on past postings (Computrabajo, LinkedIn, official pages). Paste
          a link if you want us to cite a current listing in your first line.
        </p>

        <div className="grid md:grid-cols-2 gap-2 md:gap-4 mb-4">
          <div>
            <div className="font-bold mb-1">Application Tips</div>
            <div className="text-xs space-y-1">
              {aiSnapshot?.application_tips}
            </div>
          </div>
          <div>
            <div className="font-bold mb-1">Company Specific Tips</div>
            <div className="text-xs space-y-1">
              {aiSnapshot?.company_specific_tips}
            </div>
          </div>
          <div>
            <div className="font-bold mb-1">Required Skills</div>
            <ul className="text-xs space-y-1">
              {(aiSnapshot?.required_skills || []).map((req, i) => (
                <li key={i}>• {req}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-bold mb-1">Salary Range</div>
            <div className="text-xs space-y-1">
              <div>
                <span className="font-semibold">Min:</span>{" "}
                {aiSnapshot?.salary_range?.min || ""}
              </div>
              <div>
                <span className="font-semibold">Max:</span>{" "}
                {aiSnapshot?.salary_range?.max || ""}
              </div>
              <div>
                <span className="font-semibold">Currency:</span>{" "}
                {aiSnapshot?.salary_range?.currency || ""}
              </div>
              <div>
                <span className="font-semibold">Period:</span>{" "}
                {aiSnapshot?.salary_range?.period || ""}
              </div>
            </div>
          </div>
          <div>
            <div className="font-bold mb-1">Market Insights</div>
            <ul className="text-xs space-y-1">
              {(Object.entries(aiSnapshot?.market_insights || {}) || []).map(
                ([key, value], i) => (
                  <li key={i}>
                    • <span className="font-semibold">{key}:</span> {value}
                  </li>
                ),
              )}
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
            className="flex-1 px-2 md:px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm"
          />
          <button
            onClick={handleSaveLink}
            className="border border-gray-200 bg-gray-50 px-2 md:px-4 py-2 rounded-xl text-sm hover:bg-gray-100 transition-colors"
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
            className="border border-gray-200 bg-gray-50 px-2 md:px-4 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
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
          className="border border-gray-200 bg-gray-50 px-2 md:px-4 py-1 rounded-full text-xs cursor-pointer hover:bg-gray-100 transition-colors"
          aria-pressed={showGuideOffer}
        >
          ? Tips
        </button>
      </div>

      {showGuideOffer && (
        <div className="border border-gray-200 rounded-xl bg-gray-50 p-2 md:p-4 mb-2">
          <div className="font-bold mb-1">What HR reacts to</div>
          <ul className="space-y-1 ml-4 text-sm">
            <li>Night shifts or immediate start (specific availability).</li>
            <li>Relevant certifications (license, first aid).</li>
            <li>Proximity ("live nearby"). Pick 1–3 for best results.</li>
          </ul>
        </div>
      )}

      <div className="border border-gray-200 rounded-xl bg-white p-2 md:p-4 shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-gray-500">
            Pick 1–3 extras — HR replies faster when you're specific.
          </p>
          <span
            className={`text-xs border rounded-full px-2 md:px-4 py-1 ${
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
              className={`border rounded-full px-2 md:px-4 py-2 text-xs cursor-pointer transition-colors ${
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
      <div className="border border-gray-200 rounded-xl bg-white p-2 md:p-4 shadow-lg space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-bold">Contact</span>
          <span className="text-sm">
            {selectedContact.initials} • {selectedContact.role} —{" "}
            {selectedContact.city}{" "}
            <span className="ml-1 border border-gray-300 bg-gray-50 px-2 md:px-4 py-0.5 rounded-full text-xs">
              Reply {selectedContact.reply}%
            </span>{" "}
            <span className="ml-1 border border-gray-300 bg-gray-50 px-2 md:px-4 py-0.5 rounded-full text-xs">
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
                    className="border border-gray-300 bg-gray-50 px-2 md:px-4 py-0.5 rounded-full text-xs whitespace-nowrap"
                  >
                    {label}
                  </span>
                ))
            ) : (
              <span className="border border-gray-300 bg-gray-50 px-2 md:px-4 py-0.5 rounded-full text-xs">
                —
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-bold">Quality</span>
          <span
            className={`text-sm border rounded-full px-2 md:px-4 py-0.5 text-xs ${
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
function StickyApplyFooter({ company, selectedContact, onApplyClick }) {
  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 bg-white border-t border-gray-200 p-2 shadow-lg">
      <div className="container max-w-screen-md mx-auto">
        <div className="flex flex-col gap-2 mb-2">
          <button
            onClick={onApplyClick}
            className="flex-1 border border-gray-300 text-white font-bold px-2 md:px-4 py-2 rounded-xl shadow-lg text-center hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            style={{
              backgroundColor: company.color || "#e7e7e7",
            }}
          >
            Apply now
          </button>
          <span className="border border-gray-300 bg-gray-50 py-2 rounded-full text-xs text-center">
            Selected: {selectedContact.initials} • {selectedContact.role} (
            {selectedContact.city})
          </span>
        </div>
      </div>
    </div>
  );
}

// Main Component
const JobDetailsClient = ({
  job,
  company,
  childJobs,
  aiSnapshot,
  contacts,
}) => {
  const [selectedContactId, setSelectedContactId] = useState("p1");
  const [extJob, setExtJob] = useState(null);
  const [extras, setExtras] = useState(new Set(["nights", "start"]));
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

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

  const handleApplyClick = () => {
    setIsApplyModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsApplyModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-2 md:px-4 py-2 text-gray-600 text-sm pb-8">
      <div className="container max-w-screen-md mx-auto">
        <div className="bg-white shadow-lg overflow-hidden p-2 md:p-4">
          <JobHeroSection
            job={job}
            company={company}
            contactsLength={contacts?.length}
            childJobsLength={childJobs?.length}
          />

          <ContactsSection
            company={company}
            contacts={contacts}
            selectedContactId={selectedContactId}
            onContactSelect={handleContactSelect}
          />

          {childJobs?.length > 0 && (
            <LiveListingsSection
              company={company}
              childJobs={childJobs}
              extJob={extJob}
              onReferenceSelect={handleReferenceSelect}
            />
          )}

          {!childJobs?.length > 0 && aiSnapshot && (
            <AISnapshotSection
              job={job}
              company={company}
              aiSnapshot={aiSnapshot}
              onReferenceSelect={handleReferenceSelect}
            />
          )}

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

      <StickyApplyFooter
        company={company}
        selectedContact={selectedContact}
        onApplyClick={handleApplyClick}
      />

      <ApplyNowModal
        isOpen={isApplyModalOpen}
        onClose={handleCloseModal}
        job={job}
        company={company}
        selectedContact={selectedContact}
        extJob={extJob}
        extras={extras}
        extrasLabels={extrasLabels}
      />
    </div>
  );
};

export default JobDetailsClient;
