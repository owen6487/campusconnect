import LegalPage from "../pages/Legalpage";
import usePageMeta from "../Hooks/usePageMeta";

const sections = [
  {
    id: "who-we-are",
    heading: "Who we are",
    paragraphs: [
      "Campus Connect is an online marketplace where students buy and sell items with other students. This policy explains what personal information we collect, why, and the choices you have.",
    ],
  },
  {
    id: "what-we-collect",
    heading: "Information we collect",
    items: [
      "Account details: your name, email address, password, campus and, if you choose, your branch.",
      "Google sign-in: if you sign in with Google, we receive your name, email address, profile picture and Google account ID. We never see your Google password.",
      "Listings: the photos, descriptions, prices and contact phone number you add when you post an item.",
      "Sign-in data: a cookie that keeps you signed in, and a count of failed sign-in attempts used to protect your account.",
    ],
  },
  {
    id: "how-we-use-it",
    heading: "How we use your information",
    items: [
      "To create and secure your account and keep you signed in.",
      "To show your listings to buyers on the campus you selected.",
      "To send emails you ask for, such as password reset links.",
      "To prevent fraud and abuse, and to investigate reports.",
    ],
  },
  {
    id: "what-others-see",
    heading: "What other people can see",
    paragraphs: [
      "Anyone who opens your listing can see its photos, description and price, your name, and the contact number you added so buyers can reach you. Your email address and password are never shown to other users.",
    ],
  },
  {
    id: "cookies",
    heading: "Cookies",
    paragraphs: [
      "We use one essential cookie to keep you signed in. It is not readable by scripts on the page and expires after one hour. We don't use advertising cookies.",
    ],
  },
  {
    id: "sharing",
    heading: "Who we share it with",
    paragraphs: [
      "We do not sell your personal information. We share it only with services that help us run Campus Connect, such as hosting, image storage, email delivery and Google sign-in, and when the law requires it.",
    ],
  },
  {
    id: "security",
    heading: "How we protect it",
    paragraphs: [
      "Passwords are stored in scrambled form, so we cannot read them. Accounts are temporarily locked after repeated failed sign-ins. No system is perfectly secure, so please use a strong, unique password and sign out on shared devices.",
    ],
  },
  {
    id: "keeping-deleting",
    heading: "Keeping and deleting your data",
    paragraphs: [
      "You can delete your account at any time. When you do, the account is deactivated and your email address, phone number and Google link are removed from it.",
    ],
  },
  {
    id: "your-rights",
    heading: "Your rights",
    paragraphs: [
      "You can ask to see the personal information we hold about you, correct it, or have it deleted. These rights come from Kenya's Data Protection Act, 2019. To make a request, use the details on our Contact Us page.",
    ],
  },
  {
    id: "age",
    heading: "Who can use Campus Connect",
    paragraphs: [
      "Campus Connect is for university and college students aged 18 and over. We do not knowingly collect information from children.",
    ],
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    paragraphs: [
      "If we make important changes, we'll update the date at the top of this page and tell you in the app.",
    ],
  },
];

export default function DataPolicy() {
  usePageMeta({
    title: "Privacy Policy",
    description: "Read Campus Connect's privacy policy covering account data, listings, cookies, security and your choices.",
  });

  return (
    <LegalPage
      title="Privacy Policy"
      updated="October 10, 2026"
      intro="We collect only what we need to run the marketplace. This page tells you exactly what that is."
      sections={sections}
    />
  );
}