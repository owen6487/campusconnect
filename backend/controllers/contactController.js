// Save as controllers/contactController.js
const validator = require("validator");
const ContactMessage = require("../models/contactMessage");
const sendEmail = require("../utils/sendemaill");

const TOPICS = {
  general: "General question",
  report: "Report a listing or user",
  account: "Account problem",
  other: "Other",
};

// POST /api/contact   body: { name, email, topic?, listingLink?, message, website? }
const submitContact = async (req, res) => {
  try {
    const { name, email, topic, listingLink, message, website } = req.body;

    // "website" is a hidden field only bots fill in. Say "sent" so they don't learn they were caught.
    if (website) return res.status(201).json({ message: "Message sent" });

    const cleanName = typeof name === "string" ? name.trim().replace(/\s+/g, " ") : "";
    if (cleanName.length < 2 || cleanName.length > 50) {
      return res.status(400).json({ message: "Enter your name (2 to 50 characters)" });
    }

    const cleanEmail = typeof email === "string" ? email.trim() : "";
    if (!validator.isEmail(cleanEmail)) {
      return res.status(400).json({ message: "Enter a valid email so we can reply" });
    }

    const cleanTopic = Object.keys(TOPICS).includes(topic) ? topic : "general";

    const text = typeof message === "string" ? message.trim() : "";
    if (text.length < 10 || text.length > 2000) {
      return res.status(400).json({ message: "Your message must be 10 to 2000 characters" });
    }

    const link = typeof listingLink === "string" ? listingLink.trim().slice(0, 300) : "";

    await ContactMessage.create({
      name: cleanName,
      email: cleanEmail,
      topic: cleanTopic,
      listingLink: cleanTopic === "report" ? link : "",
      message: text,
      user: req.user?._id ?? req.user?.id ?? null,
    });

    // Tell the team. The message is already saved, so an email failure must not fail the request.
    // Only the team is emailed. We never email an address a visitor typed, because that would
    // let anyone use your contact form to send email to other people.
    if (process.env.SUPPORT_EMAIL && typeof sendEmail === "function") {
      try {
        await sendEmail(
          process.env.SUPPORT_EMAIL,
          `New contact message: ${TOPICS[cleanTopic]}`,
          [
            `From: ${cleanName} <${cleanEmail}>`,
            `Logged in: ${req.user ? "yes" : "no"}`,
            `Topic: ${TOPICS[cleanTopic]}`,
            cleanTopic === "report" && link ? `About: ${link}` : null,
            "",
            text,
            "",
            `Press Reply to answer ${cleanEmail} directly.`,
          ]
            .filter((line) => line !== null)
            .join("\n"),
          {
            replyTo: cleanEmail,
            from: process.env.NO_REPLY_EMAIL || process.env.RESEND_FROM || "noreply@campusconnect.co.ke",
          }
        );
      } catch (mailErr) {
        console.error("Contact notification email failed:", mailErr);
      }
    }

    res.status(201).json({ message: "Message sent" });
  } catch (err) {
    console.error("Submit contact error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { submitContact };
