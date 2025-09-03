import api from "./api";

/**
 * Contacts Service
 * Handles contact-related API operations including contact forms,
 * support tickets, and communication management
 */

export const contactsService = {
  /**
   * Submit general contact form
   * @param {Object} contactData - Contact form data
   * @param {string} contactData.name - Contact name
   * @param {string} contactData.email - Contact email
   * @param {string} contactData.subject - Message subject
   * @param {string} contactData.message - Message content
   * @param {string} [contactData.phone] - Contact phone
   * @param {string} [contactData.company] - Company name
   * @param {string} [contactData.type] - Contact type (general, support, partnership, etc.)
   * @returns {Promise<Object>} Submission response
   */
  submitContactForm: async (contactData) => {
    try {
      return await api.post("/contacts", contactData);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Submit support ticket
   * @param {Object} ticketData - Support ticket data
   * @param {string} ticketData.subject - Ticket subject
   * @param {string} ticketData.description - Issue description
   * @param {string} ticketData.priority - Priority level (low, medium, high, urgent)
   * @param {string} ticketData.category - Issue category
   * @param {Array} [ticketData.attachments] - File attachments
   * @returns {Promise<Object>} Created ticket
   */
  submitSupportTicket: async (ticketData) => {
    try {
      // Handle file attachments
      if (ticketData.attachments && ticketData.attachments.length > 0) {
        const formData = new FormData();

        // Add text fields
        Object.entries(ticketData).forEach(([key, value]) => {
          if (key !== "attachments" && value !== undefined && value !== null) {
            if (typeof value === "object") {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          }
        });

        // Add attachments
        ticketData.attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });

        return await api.upload("/contacts/support", formData);
      } else {
        return await api.post("/contacts/support", ticketData);
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user's support tickets
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.status] - Ticket status filter
   * @param {string} [params.priority] - Priority filter
   * @param {string} [params.category] - Category filter
   * @returns {Promise<Object>} User's tickets list
   */
  getUserTickets: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `/contacts/support/my-tickets${
        queryString ? `?${queryString}` : ""
      }`;

      return await api.get(url);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get ticket by ID
   * @param {string|number} ticketId - Ticket ID
   * @returns {Promise<Object>} Ticket details
   */
  getTicketById: async (ticketId) => {
    try {
      return await api.get(`/contacts/support/${ticketId}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reply to support ticket
   * @param {string|number} ticketId - Ticket ID
   * @param {Object} replyData - Reply data
   * @param {string} replyData.message - Reply message
   * @param {Array} [replyData.attachments] - File attachments
   * @returns {Promise<Object>} Reply response
   */
  replyToTicket: async (ticketId, replyData) => {
    try {
      // Handle file attachments
      if (replyData.attachments && replyData.attachments.length > 0) {
        const formData = new FormData();

        // Add message
        formData.append("message", replyData.message);

        // Add attachments
        replyData.attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });

        return await api.upload(
          `/contacts/support/${ticketId}/reply`,
          formData,
        );
      } else {
        return await api.post(`/contacts/support/${ticketId}/reply`, replyData);
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update ticket status
   * @param {string|number} ticketId - Ticket ID
   * @param {string} status - New status (open, pending, resolved, closed)
   * @returns {Promise<Object>} Updated ticket
   */
  updateTicketStatus: async (ticketId, status) => {
    try {
      return await api.patch(`/contacts/support/${ticketId}/status`, {
        status,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Close ticket
   * @param {string|number} ticketId - Ticket ID
   * @param {string} [reason] - Closure reason
   * @returns {Promise<Object>} Success response
   */
  closeTicket: async (ticketId, reason = "") => {
    try {
      return await api.patch(`/contacts/support/${ticketId}/close`, { reason });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Rate support ticket resolution
   * @param {string|number} ticketId - Ticket ID
   * @param {Object} ratingData - Rating data
   * @param {number} ratingData.rating - Rating (1-5)
   * @param {string} [ratingData.feedback] - Additional feedback
   * @returns {Promise<Object>} Rating response
   */
  rateTicketResolution: async (ticketId, ratingData) => {
    try {
      return await api.post(`/contacts/support/${ticketId}/rate`, ratingData);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Submit partnership inquiry
   * @param {Object} partnershipData - Partnership inquiry data
   * @param {string} partnershipData.companyName - Company name
   * @param {string} partnershipData.contactName - Contact person name
   * @param {string} partnershipData.email - Contact email
   * @param {string} partnershipData.phone - Contact phone
   * @param {string} partnershipData.partnershipType - Type of partnership
   * @param {string} partnershipData.description - Partnership description
   * @param {string} [partnershipData.website] - Company website
   * @param {string} [partnershipData.expectedVolume] - Expected volume/scale
   * @returns {Promise<Object>} Submission response
   */
  submitPartnershipInquiry: async (partnershipData) => {
    try {
      return await api.post("/contacts/partnership", partnershipData);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Submit employer/company registration inquiry
   * @param {Object} employerData - Employer inquiry data
   * @param {string} employerData.companyName - Company name
   * @param {string} employerData.contactName - Contact person name
   * @param {string} employerData.email - Contact email
   * @param {string} employerData.position - Contact's position
   * @param {string} employerData.industry - Company industry
   * @param {string} employerData.companySize - Company size
   * @param {string} [employerData.website] - Company website
   * @param {string} [employerData.description] - Additional information
   * @returns {Promise<Object>} Submission response
   */
  submitEmployerInquiry: async (employerData) => {
    try {
      return await api.post("/contacts/employer", employerData);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Subscribe to newsletter
   * @param {Object} subscriptionData - Subscription data
   * @param {string} subscriptionData.email - Email address
   * @param {string} [subscriptionData.name] - Subscriber name
   * @param {Array} [subscriptionData.interests] - Areas of interest
   * @param {string} [subscriptionData.frequency] - Email frequency preference
   * @returns {Promise<Object>} Subscription response
   */
  subscribeToNewsletter: async (subscriptionData) => {
    try {
      return await api.post("/contacts/newsletter", subscriptionData);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Unsubscribe from newsletter
   * @param {string} email - Email address
   * @param {string} [token] - Unsubscribe token
   * @returns {Promise<Object>} Unsubscription response
   */
  unsubscribeFromNewsletter: async (email, token = "") => {
    try {
      return await api.post("/contacts/newsletter/unsubscribe", {
        email,
        token,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update newsletter preferences
   * @param {Object} preferences - Newsletter preferences
   * @param {string} preferences.email - Email address
   * @param {Array} preferences.interests - Updated interests
   * @param {string} preferences.frequency - Email frequency
   * @param {string} [preferences.token] - Update token
   * @returns {Promise<Object>} Update response
   */
  updateNewsletterPreferences: async (preferences) => {
    try {
      return await api.put("/contacts/newsletter/preferences", preferences);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Report an issue or abuse
   * @param {Object} reportData - Report data
   * @param {string} reportData.type - Report type (spam, inappropriate, fake, etc.)
   * @param {string} reportData.resourceType - Type of resource being reported (job, company, user)
   * @param {string} reportData.resourceId - ID of reported resource
   * @param {string} reportData.description - Report description
   * @param {Array} [reportData.evidence] - Evidence attachments
   * @returns {Promise<Object>} Report response
   */
  reportIssue: async (reportData) => {
    try {
      // Handle evidence attachments
      if (reportData.evidence && reportData.evidence.length > 0) {
        const formData = new FormData();

        // Add text fields
        Object.entries(reportData).forEach(([key, value]) => {
          if (key !== "evidence" && value !== undefined && value !== null) {
            if (typeof value === "object") {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          }
        });

        // Add evidence files
        reportData.evidence.forEach((file, index) => {
          formData.append(`evidence[${index}]`, file);
        });

        return await api.upload("/contacts/report", formData);
      } else {
        return await api.post("/contacts/report", reportData);
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get contact form categories
   * @returns {Promise<Array>} Contact categories
   */
  getContactCategories: async () => {
    try {
      return await api.get("/contacts/categories");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get support ticket categories
   * @returns {Promise<Array>} Support categories
   */
  getSupportCategories: async () => {
    try {
      return await api.get("/contacts/support/categories");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get FAQ items
   * @param {Object} params - Query parameters
   * @param {string} [params.category] - FAQ category
   * @param {string} [params.search] - Search term
   * @returns {Promise<Array>} FAQ items
   */
  getFAQ: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `/contacts/faq${queryString ? `?${queryString}` : ""}`;

      return await api.get(url);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search knowledge base
   * @param {string} query - Search query
   * @param {Object} [filters] - Search filters
   * @returns {Promise<Object>} Search results
   */
  searchKnowledgeBase: async (query, filters = {}) => {
    try {
      return await api.post("/contacts/knowledge-base/search", {
        query,
        ...filters,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if user has unlocked a specific contact
   * @param {string|number} contactId - Contact ID
   * @returns {Promise<Object>} Unlock status and user credits
   */
  checkUnlockStatus: async (contactId) => {
    try {
      return await api.get(`/contacts/status?contactId=${contactId}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Unlock a contact by spending credits
   * @param {string|number} contactId - Contact ID
   * @returns {Promise<Object>} Unlock response with contact details
   */
  unlockContact: async (contactId) => {
    try {
      return await api.post("/contacts/unlock", { contactId });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user's unlocked contacts
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @returns {Promise<Object>} User's unlocked contacts
   */
  getUnlockedContacts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `/contacts/unlocked${queryString ? `?${queryString}` : ""}`;

      return await api.get(url);
    } catch (error) {
      throw error;
    }
  },
};

export default contactsService;
