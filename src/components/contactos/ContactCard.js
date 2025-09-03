"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { contactsService } from "../../services/contactsService";
import ContactUnlockModal from "./ContactUnlockModal";

const ContactCard = ({ contact }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [isOpenContactDirectly, setIsOpenContactDirectly] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Get unlock status from contact data (set by backend)
  const isUnlocked = contact?.isUnlocked ?? false;
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const cardRef = useRef(null);

  // Get user credits when authenticated
  useEffect(() => {
    const getUserCredits = async () => {
      if (!isAuthenticated() || !contact?.id) return;

      try {
        setCheckingStatus(true);
        const response = await contactsService.checkUnlockStatus(contact.id);
        if (response.success) {
          setUserCredits(response.userCredits);
        }
      } catch (error) {
        console.error("Error getting user credits:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    getUserCredits();
  }, [contact?.id, isAuthenticated]);

  const handleToggleContactDirectly = () => {
    if (!isAuthenticated()) {
      // Show auth modal
      openAuthModal();
      return;
    }

    if (isUnlocked) {
      // User has access, show contact info
      setIsOpenContactDirectly((prev) => !prev);
    } else {
      // User needs to unlock, show confirmation modal
      setUnlockModalOpen(true);
    }
  };

  const handleUnlockContact = async () => {
    try {
      setUnlocking(true);
      const response = await contactsService.unlockContact(contact.id);

      console.log("Unlock contact response:", response);

      if (response.success) {
        setUserCredits(response.creditsRemaining);
        setUnlockModalOpen(false);
        setIsOpenContactDirectly(true);
      }
    } catch (error) {
      console.error("Error unlocking contact:", error);
      // Show error message
      if (error.response?.status === 402) {
        // Insufficient credits - modal will handle this
        setUserCredits(error.response.data?.userCredits || 0);
      }
    } finally {
      setUnlocking(false);
    }
  };

  const handleShowEmail = () => {
    if (isUnlocked) {
      setShowEmail((prev) => !prev);
    } else {
      setUnlockModalOpen(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsOpenContactDirectly(false);
      }
    };

    if (isOpenContactDirectly) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpenContactDirectly]);

  return (
    <div
      ref={cardRef}
      className="flex flex-col border-1 border-[#e7e7e7] shadow-[0 8px 24px rgba(0, 0, 0, .06)] rounded-lg"
    >
      <div
        className="flex items-center justify-center h-28 border-b rounded-t-lg p-4"
        style={{
          borderBottomColor: contact.company?.color || "#e7e7e7",
          background: `
            linear-gradient(180deg, ${
              contact.company?.color || "#e7e7e7"
            } 0 20%, transparent 20% 100%),
            radial-gradient(1000px 320px at 90% -80px, rgba(255,255,255,.14), rgba(255,255,255,0) 60%),
            linear-gradient(180deg, ${
              contact.company?.color || "#e7e7e7"
            } 0 20%, #fff 85%)
          `,
        }}
      >
        <img
          src={contact.company?.logo_url}
          alt="Company logo"
          className="h-22 w-auto rounded-lg"
        />
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="text-lg text-gray-700 font-semibold">
          {!isUnlocked && <span className="mr-1">🔐</span>}
          {contact.name} - {contact.company?.name}
        </div>
        <div className="text-sm text-gray-600">
          {isUnlocked && contact.position ? `${contact.position} • ` : ""}
          {contact.city || "City not specified"}
        </div>
        <div className="flex mt-4">
          <button
            onClick={handleToggleContactDirectly}
            disabled={checkingStatus}
            className="w-full py-2 rounded-lg text-sm cursor-pointer border-1 hover:translate-y-[-1px] font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              borderColor: contact.company?.color || "#e7e7e7",
              boxShadow: `0 4px 12px color-mix(in srgb, ${
                contact.company?.color || "#e7e7e7"
              } 22%, transparent)`,
              backgroundColor: isOpenContactDirectly
                ? contact.company?.color || "#e7e7e7"
                : "transparent",
              color: isOpenContactDirectly
                ? "white"
                : isUnlocked
                ? "#4B5563"
                : "#9CA3AF",
            }}
          >
            {checkingStatus ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Checking...
              </>
            ) : (
              "Contact directly"
            )}
          </button>
        </div>
        {isOpenContactDirectly && (
          <div
            className="flex flex-col gap-2 rounded-lg p-2 border-1 mt-2"
            style={{
              borderColor: contact.company?.color || "#e7e7e7",
            }}
          >
            <div className="flex gap-2 flex-col md:flex-row">
              <button
                className="flex-1 w-full py-2 rounded-lg text-sm text-gray-600 cursor-pointer border-1 hover:translate-y-[-1px] font-semibold transition-all duration-300"
                style={{
                  borderColor: contact.company?.color || "#e7e7e7",
                  boxShadow: `0 4px 12px color-mix(in srgb, ${
                    contact.company?.color || "#e7e7e7"
                  } 22%, transparent)`,
                }}
              >
                Generate message
              </button>
              {showEmail && (
                <div className="flex p-2 items-center justify-center text-center rounded-sm border-1 border-dashed border-gray-300">
                  <span className="text-black font-bold text-sm">
                    {contact.email}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleShowEmail}
              className="w-full py-2 rounded-lg text-sm text-gray-600 cursor-pointer border-1 border-gray-200 shadow-md hover:translate-y-[-1px] hover:shadow-none font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              {showEmail ? "Hide" : "Show"} email
            </button>

            <div className="flex flex-col px-2 py-4 gap-2 rounded-lg border-1 border-gray-200">
              {/* Fast and personal */}
              <div className="flex gap-2 p-2 border-1 border-gray-200 rounded-lg hover:translate-y-[-1px] hover:shadow-md transition-all duration-300">
                <div className="w-6 h-6 rounded-full bg-[#eaf6f0] border-1 border-[#c9ead8] flex items-center justify-center">
                  <div className="text-[#0a7b52] text-sm font-semibold">✓</div>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <div className="text-gray-700 text-lg font-semibold">
                    Fast and personal
                  </div>
                  <div className="text-gray-600 text-xs">
                    The template is automatically adapted to the contact and
                    company.
                  </div>
                </div>
              </div>
              {/* Better tracking */}
              <div className="flex gap-2 p-2 border-1 border-gray-200 rounded-lg hover:translate-y-[-1px] hover:shadow-md transition-all duration-300">
                <div className="w-6 h-6 rounded-full bg-[#eaf6f0] border-1 border-[#c9ead8] flex items-center justify-center">
                  <div className="text-[#0a7b52] text-sm font-semibold">✓</div>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <div className="text-gray-700 text-lg font-semibold">
                    Better tracking
                  </div>
                  <div className="text-gray-600 text-xs">
                    We mark “Prepared” and “Sent” for your pipeline.
                  </div>
                </div>
              </div>
              {/* Certainly */}
              <div className="flex gap-2 p-2 border-1 border-gray-200 rounded-lg hover:translate-y-[-1px] hover:shadow-md transition-all duration-300">
                <div className="w-6 h-6 rounded-full bg-[#eaf6f0] border-1 border-[#c9ead8] flex items-center justify-center">
                  <div className="text-[#0a7b52] text-sm font-semibold">✓</div>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <div className="text-gray-700 text-lg font-semibold">
                    Certainly
                  </div>
                  <div className="text-gray-600 text-xs">
                    Your email will only be displayed when you request it.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Unlock Modal */}
      <ContactUnlockModal
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        onConfirm={handleUnlockContact}
        contact={contact}
        userCredits={userCredits}
        isLoading={unlocking}
      />
    </div>
  );
};

export default ContactCard;
