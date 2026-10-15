// utils/sendemaill.js
const dotenv = require("dotenv");
dotenv.config();

// Sends via Resend ONLY. Returns true/false — never throws, so callers
// decide whether a failed email should fail their whole request.
const sendEmail = async (to, subject, text, options = {}) => {
    try {
        const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
        if (!recipients.length) throw new Error("No recipients");

        if (!process.env.RESEND_API_KEY) {
            console.error("sendEmail: RESEND_API_KEY is not set — email not sent");
            return false;
        }

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: options.from || process.env.NO_REPLY_EMAIL || "noreply@campusconnect.co.ke",
                to: recipients,
                subject,
                text,
                reply_to: options.replyTo || undefined,
            }),
        });

        if (!response.ok) {
            const body = await response.text();
            console.error("Resend error:", response.status, body);
            return false;
        }

        return true;
    } catch (err) {
        console.error("sendEmail failed:", err.message);
        return false;
    }
};

module.exports = sendEmail;