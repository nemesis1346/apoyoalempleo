/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";

const ApplyNowModal = ({ isOpen, onClose, job, company, selectedContact }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Animation states
  const [showStep2Intro, setShowStep2Intro] = useState(false);
  const [step2Progress, setStep2Progress] = useState(0);
  const [step2Checks, setStep2Checks] = useState([]);

  const companyColor = company?.color || "#3b82f6";
  const companyColorRgb = hexToRgb(companyColor);

  // Helper function to convert hex to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 59, g: 130, b: 246 };
  }

  // Haptic feedback helper
  const vibrate = (duration = 10) => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(duration);
      }
    } catch (error) {
      // Silently fail if vibration is not supported
    }
  };

  // Generate dynamic CSS variables based on company color
  const dynamicStyles = {
    "--brand": companyColor,
    "--brand-rgb": `${companyColorRgb.r}, ${companyColorRgb.g}, ${companyColorRgb.b}`,
    "--brand-soft": `rgba(${companyColorRgb.r}, ${companyColorRgb.g}, ${companyColorRgb.b}, 0.1)`,
    "--brand-ring": `rgba(${companyColorRgb.r}, ${companyColorRgb.g}, ${companyColorRgb.b}, 0.3)`,
    "--ring": `rgba(${companyColorRgb.r}, ${companyColorRgb.g}, ${companyColorRgb.b}, 0.55)`,
  };

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setShowStep2Intro(false);
      setStep2Progress(0);
      setStep2Checks([]);
      setSelectedPayment(null);
      setValidationErrors({});

      // Trigger animations after modal is visible
      setTimeout(() => {
        animateVacancies();
        animateBenefitRail();
      }, 300);
    }
  }, [isOpen]);

  // Animate vacancy counter
  const animateVacancies = () => {
    const targetVacancies = Math.floor(Math.random() * 30) + 15; // Random 15-45
    let current = 0;
    const duration = 800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      current = Math.round(targetVacancies * progress);

      const vacElement = document.getElementById("vacancy-count");
      if (vacElement) vacElement.textContent = current;

      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  // Animate benefit rail
  const animateBenefitRail = () => {
    setTimeout(() => {
      const rail = document.getElementById("benefit-rail");
      if (rail) rail.classList.add("animate-in");
    }, 100);
  };

  // Step navigation
  const goToStep = (step) => {
    if (step === currentStep) return;

    vibrate(10);
    setIsAnimating(true);
    setCurrentStep(step);

    if (step === 2) {
      setShowStep2Intro(true);
      setTimeout(() => runStep2Animation(), 100);
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  // Step 2 animation sequence
  const runStep2Animation = () => {
    const checks = [
      { key: "contact", text: "Contact verified" },
      {
        key: "match",
        text: `Match: ${job?.title || "Position"} • ${
          job?.location?.[0] || "Location"
        }`,
      },
      { key: "timing", text: "Timing optimal" },
    ];

    let currentCheck = 0;

    const animateCheck = () => {
      if (currentCheck < checks.length && checks[currentCheck]) {
        setStep2Checks((prev) => [...prev, checks[currentCheck]]);
        setStep2Progress(((currentCheck + 1) / checks.length) * 100);
        currentCheck++;
        setTimeout(animateCheck, 520);
      } else {
        // Focus on first input after animation
        setTimeout(() => {
          const nameInput = document.getElementById("full-name");
          if (nameInput) {
            nameInput.focus();
            nameInput.classList.add("focus-highlight");
            vibrate(10);
            setTimeout(
              () => nameInput.classList.remove("focus-highlight"),
              1200,
            );
          }
        }, 200);
      }
    };

    animateCheck();
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (
      !formData.fullName.trim() ||
      formData.fullName.trim().split(" ").length < 2
    ) {
      errors.fullName = "Please enter your full name (first and last name)";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Payment method selection
  const selectPaymentMethod = (method) => {
    vibrate(8);
    setSelectedPayment(method);

    // Add selection animation
    const tile = document.querySelector(`[data-payment="${method}"]`);
    if (tile) {
      tile.classList.add("just-selected");
      setTimeout(() => tile.classList.remove("just-selected"), 220);
    }
  };

  // Handle final submission
  const handleSubmit = () => {
    if (!selectedPayment) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const params = new URLSearchParams({
        contact: selectedContact?.initials || "HR",
        company: company?.name || "Company",
        role: job?.title || "Job",
        payment: selectedPayment,
        price: "5",
      });

      // In a real app, this would redirect to payment processor
      console.log("Redirecting to payment:", params.toString());

      // For demo, just close modal
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 1000);
    }, 700);
  };

  // Generate preview message
  const generatePreviewMessage = () => {
    const name = formData.fullName.trim();
    const location = job?.location?.[0] || "your city";
    const jobTitle = job?.title || "this position";

    const hello = name ? `Hello, I'm ${name}.` : "Hello.";
    const availability = `I live near ${location} and I'm available to start immediately.`;
    const credentials =
      "I have a valid security license and clean background check.";
    const timing = "Could we talk today or tomorrow at 9:15 AM? Thank you.";

    return `${hello} ${availability}\n\n${credentials}\n\n${timing}\n\n— ${
      name || "Your name"
    }`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-500 ease-out max-h-[96vh] flex flex-col ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={dynamicStyles}
      >
        {/* Handle */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>

        {/* Sticky Hero */}
        <div
          className="sticky top-0 z-10 border border-gray-200 rounded-2xl mx-3 mb-4 p-4 shadow-lg"
          style={{
            background: `linear-gradient(180deg, var(--brand-soft) 0%, #ffffff 65%)`,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg"
              style={{ backgroundColor: companyColor }}
            >
              {company?.name?.[0]}
              {company?.name?.[1] || ""}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-gray-800 mb-1">
                {job?.title}
              </h2>
              <p className="text-sm font-bold text-gray-600">{company?.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-full">
                  📍 {job?.location?.[0] || "Location"}:{" "}
                  <strong id="vacancy-count">0</strong> vacancies this week
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${(currentStep / 3) * 100}%`,
                      background: `linear-gradient(90deg, var(--brand), rgba(var(--brand-rgb), 0.8))`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-600">
                  Step {currentStep}/3
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-3 pb-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              🔥 Your verified contact
            </h3>

            {/* Contact card */}
            <div className="border border-gray-200 rounded-xl bg-white p-4 shadow-lg mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black"
                  style={{ backgroundColor: companyColor }}
                >
                  {selectedContact?.initials || "HR"}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-1">
                    👤 Name:{" "}
                    <strong>{selectedContact?.initials || "HR"}</strong> 🔒
                  </h4>
                  <div className="text-xs text-gray-600">
                    📧 Email: 🔒 | 📞 Phone: 🔒 •{" "}
                    {selectedContact?.city || "City"}
                  </div>
                </div>
                <span className="bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-xs">
                  Selected
                </span>
              </div>
            </div>

            {/* Step 2 intro animation */}
            {showStep2Intro && currentStep === 2 && (
              <div className="mb-4">
                <div className="space-y-2 mb-3">
                  {step2Checks
                    .filter((check) => check && check.text)
                    .map((check, index) => (
                      <div
                        key={check.key || index}
                        className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-800"
                      >
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm">
                          ✓
                        </div>
                        <span className="text-sm font-medium">
                          {check.text}
                        </span>
                      </div>
                    ))}
                </div>

                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${step2Progress}%` }}
                  />
                </div>

                <div
                  className="flex items-center gap-3 bg-white border-2 rounded-xl p-4"
                  style={{ borderColor: companyColor }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{
                      background: `linear-gradient(180deg, var(--brand-soft), var(--brand))`,
                      color: "white",
                    }}
                  >
                    ⭐
                  </div>
                  <span className="font-bold text-gray-800">
                    You're seconds away from messaging{" "}
                    {selectedContact?.initials || "HR"} directly.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div
                id="benefit-rail"
                className="border-2 rounded-2xl p-4 relative overflow-hidden transition-all duration-500"
                style={{
                  borderColor: companyColor,
                  background: `
                    radial-gradient(600px 120px at 90% -40px, var(--brand-soft), transparent 65%),
                    linear-gradient(180deg, #fffef9, #ffffff)
                  `,
                }}
              >
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🎯 Unlock now and get:
                </h4>

                <div className="space-y-3 mb-4">
                  {[
                    { icon: "🔓", text: "Unlock 1 verified contact" },
                    { icon: "📬", text: "Direct contact with recruiter" },
                    { icon: "✍️", text: "We help you write your message" },
                    {
                      icon: "⭐",
                      text: "91% receive response in 5 business days",
                    },
                  ].map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white/50 border border-gray-200 rounded-xl transform transition-all duration-300 benefit-line"
                      style={{
                        transitionDelay: `${index * 80}ms`,
                        opacity: 0,
                        transform: "translateY(6px)",
                      }}
                    >
                      <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-lg shadow-sm">
                        {benefit.icon}
                      </div>
                      <span className="font-semibold text-gray-800">
                        {benefit.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-center mb-4">
                    <p className="font-bold text-gray-800 leading-relaxed">
                      It's not magic. It's direct contact.
                      <br />
                      <em className="text-gray-600">
                        🚀 Stop waiting. Start getting responses.
                      </em>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => goToStep(2)}
                      className="w-full font-black py-4 px-6 rounded-xl text-white shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden shimmer-btn"
                      style={{
                        background: `linear-gradient(180deg, rgba(255,255,255,0.3), var(--brand))`,
                        backgroundColor: companyColor,
                      }}
                    >
                      ✅ Yes, I want direct contact
                    </button>
                    <button
                      onClick={onClose}
                      className="w-full bg-white border-2 border-gray-300 text-gray-700 font-bold py-4 px-6 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      ❌ No, I prefer to be ignored on job boards
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
                <h4 className="text-lg font-bold text-gray-800 mb-4">
                  🚀 Register in seconds
                </h4>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="full-name"
                      className="block text-sm text-gray-600 mb-2"
                    >
                      Full name
                    </label>
                    <input
                      id="full-name"
                      type="text"
                      placeholder="First and last name"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      className={`w-full p-4 border rounded-xl text-base transition-all duration-200 ${
                        validationErrors.fullName
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:border-current focus:shadow-lg"
                      }`}
                      style={{
                        "--tw-ring-color": companyColor,
                        borderColor: validationErrors.fullName
                          ? undefined
                          : formData.fullName
                          ? companyColor
                          : undefined,
                      }}
                    />
                    {validationErrors.fullName && (
                      <p className="text-red-600 text-xs mt-1">
                        {validationErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm text-gray-600 mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`w-full p-4 border rounded-xl text-base transition-all duration-200 ${
                        validationErrors.email
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:border-current focus:shadow-lg"
                      }`}
                      style={{
                        "--tw-ring-color": companyColor,
                        borderColor: validationErrors.email
                          ? undefined
                          : formData.email
                          ? companyColor
                          : undefined,
                      }}
                    />
                    {validationErrors.email && (
                      <p className="text-red-600 text-xs mt-1">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-4 mb-4">
                  🔑 Activate your access — password will be sent to your email
                </p>

                <button
                  onClick={() => {
                    if (validateForm()) {
                      goToStep(3);
                    }
                  }}
                  disabled={!formData.fullName || !formData.email}
                  className="w-full font-bold py-4 px-6 rounded-xl text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: companyColor }}
                >
                  Next: Preview message
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Message Preview */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">
                  📤 Example - Your message
                </h4>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
                  <div className="text-sm text-gray-600 mb-3">
                    <strong>Subject:</strong>{" "}
                    <span className="font-mono">{job?.title}</span>
                  </div>
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                    {generatePreviewMessage()}
                  </pre>
                  <p className="text-xs text-gray-500 mt-3">
                    ⚠️ Example — the final version is much more professional and
                    convincing
                  </p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold text-gray-800">
                    💳 Choose payment method
                  </h4>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: "nequi",
                      name: "Nequi",
                      badge: "Popular in CO",
                      subtitle: "Instant • No fees",
                      icon: "💳",
                    },
                    {
                      id: "pse",
                      name: "PSE",
                      badge: "Popular in CO",
                      subtitle: "Bank transfer • Instant",
                      icon: "🏦",
                    },
                    {
                      id: "card",
                      name: "Card",
                      badge: null,
                      subtitle: "Visa/Mastercard • Secure",
                      icon: "💳",
                    },
                    {
                      id: "cash",
                      name: "Cash payment",
                      badge: null,
                      subtitle: "Voucher • 24-48h processing",
                      icon: "💵",
                    },
                  ].map((method) => (
                    <div
                      key={method.id}
                      data-payment={method.id}
                      onClick={() => selectPaymentMethod(method.id)}
                      className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                        selectedPayment === method.id
                          ? "shadow-xl -translate-y-1"
                          : "shadow-lg hover:shadow-xl"
                      }`}
                      style={{
                        borderColor:
                          selectedPayment === method.id
                            ? companyColor
                            : "#e5e7eb",
                        background:
                          selectedPayment === method.id
                            ? `linear-gradient(180deg, var(--brand-soft), #fff)`
                            : "#fff",
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-xl">
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800">
                              {method.name}
                            </span>
                            {method.badge && (
                              <span className="bg-orange-100 border border-orange-200 text-orange-700 px-2 py-0.5 rounded-full text-xs">
                                {method.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {method.subtitle}
                          </p>
                        </div>
                        <div className="text-gray-400 transition-transform duration-200">
                          {selectedPayment === method.id ? "✓" : "→"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer (Step 3 only) */}
        {currentStep === 3 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <button
              onClick={handleSubmit}
              disabled={!selectedPayment || isLoading}
              className={`w-full font-bold py-4 px-6 rounded-xl text-white shadow-lg transition-all duration-200 relative overflow-hidden ${
                isLoading
                  ? "cursor-not-allowed"
                  : "hover:scale-[1.02] active:scale-[0.98]"
              }`}
              style={{ backgroundColor: companyColor }}
            >
              {isLoading ? (
                <>
                  <span className="opacity-75">Processing...</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </>
              ) : (
                "🔥 Unlock now — $5"
              )}
            </button>
            <div className="text-center mt-2 space-y-1">
              <p className="text-xs text-gray-600">
                🧾 One-time payment for 1 verified contact + benefits
              </p>
              <p className="text-xs text-gray-600">
                🟢 WhatsApp support • ⭐ 91% respond in 5 business days
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-in .benefit-line {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        .focus-highlight {
          box-shadow:
            0 0 0 3px rgba(var(--brand-rgb), 0.3),
            0 0 0 6px rgba(var(--brand-rgb), 0.15) !important;
          animation: focus-bump 0.22s ease-out;
        }

        @keyframes focus-bump {
          0% {
            transform: scale(0.995);
          }
          100% {
            transform: scale(1);
          }
        }

        .just-selected::after {
          content: "";
          position: absolute;
          left: 16px;
          right: 16px;
          top: 8px;
          height: 3px;
          border-radius: 3px;
          background: linear-gradient(
            90deg,
            var(--brand),
            rgba(var(--brand-rgb), 0.8)
          );
          transform: scaleX(0);
          transform-origin: left;
          animation: ribbon 0.18s ease-out forwards;
        }

        @keyframes ribbon {
          from {
            transform: scaleX(0);
            opacity: 0.2;
          }
          to {
            transform: scaleX(1);
            opacity: 1;
          }
        }

        .shimmer-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.55) 45%,
            transparent 60%
          );
          background-size: 200% 100%;
          transform: translateX(-150%);
          animation: shimmer 9s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%,
          85% {
            transform: translateX(-150%);
          }
          93% {
            transform: translateX(50%);
          }
          100% {
            transform: translateX(50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .shimmer-btn::after {
            animation: none;
          }
          .animate-in .benefit-line {
            opacity: 1 !important;
            transform: translateY(0) !important;
            transition: none;
          }
        }
      `}</style>
    </>
  );
};

export default ApplyNowModal;
