import LegalPage from "../pages/Legalpage";
import usePageMeta from "../Hooks/usePageMeta";

const sections = [
  {
    id: "agreement",
    heading: "Agreeing to these terms",
    paragraphs: [
      "By creating an account or using Campus Connect, you agree to these terms. If you don't agree, please don't use the service.",
    ],
  },
  {
    id: "accounts",
    heading: "Your account",
    items: [
      "You must be a student aged 18 or over, and give accurate information when you sign up.",
      "Keep your password private. You are responsible for activity on your account.",
      "One person, one account. Don't create accounts to get around a suspension.",
    ],
  },
  {
    id: "our-role",
    heading: "What Campus Connect is, and isn't",
    paragraphs: [
      "Campus Connect is a place where students find each other. We are not a party to any sale. We don't own, inspect or guarantee the items listed, and we don't handle payments. Each sale is an agreement between the buyer and the seller.",
    ],
  },
  {
    id: "listing-rules",
    heading: "Rules for listings",
    items: [
      "Describe your item honestly and use your own photos.",
      "Only sell things you own and are allowed to sell.",
      "Give a real price and a working contact number.",
      "Listings expire automatically after one month and are removed from the platform.",
      "Delete the listing once the item is sold before the one-month expiry period ends.",
    ],
  },
  {
    id: "prohibited",
    heading: "What you must not sell or do",
    items: [
      "Illegal, stolen, counterfeit or unsafe items, including weapons and drugs.",
      "Exam papers, answers, or academic work to be submitted as someone else's.",
      "Anything that harasses, threatens or deceives other users.",
      "Asking buyers for payment before they have seen the item.",
      "Scraping the site or collecting other users' contact details in bulk.",
    ],
  },
  {
    id: "meeting",
    heading: "Meeting and paying",
    paragraphs: [
      "You meet and pay other users at your own risk. We strongly recommend meeting in busy places on campus, inspecting the item before you pay, and reading our Safety Tips.",
    ],
  },
  {
    id: "your-content",
    heading: "Content you post",
    paragraphs: [
      "You keep ownership of your photos and descriptions. By posting them, you allow Campus Connect to display them on the service so that others can see your listing. You promise you have the right to post them.",
    ],
  },
  {
    id: "suspension",
    heading: "Removing content and suspending accounts",
    paragraphs: [
      "We may remove a listing or suspend an account that breaks these terms, is reported as fraudulent, or puts other users at risk. Listings are also automatically deleted after one month if they are not removed earlier. You can delete your account at any time.",
    ],
  },
  {
    id: "liability",
    heading: "Our responsibility",
    paragraphs: [
      "We work to keep Campus Connect running and safe, but we provide it as it is, without promises that it will always be available or error-free. To the extent the law allows, we are not responsible for losses that come from dealings between users, including items that are misdescribed, unsafe or never delivered.",
    ],
  },
  {
    id: "changes",
    heading: "Changes to these terms",
    paragraphs: [
      "We may update these terms from time to time. If we make important changes, we'll tell you in the app. Using Campus Connect after a change means you accept the new terms.",
    ],
  },
  {
    id: "law",
    heading: "Governing law",
    paragraphs: [
      "These terms are governed by the laws of Kenya. Questions about them can be sent through our Contact Us page.",
    ],
  },
];

export default function TermsOfUse() {
  usePageMeta({
    title: "Terms of Use",
    description: "Review the rules for using Campus Connect, including listing standards, safety expectations and account responsibilities.",
  });

  return (
    <LegalPage
      title="Terms of Use"
      updated="October 10, 2026"
      intro="Plain rules for using Campus Connect as a buyer or a seller."
      sections={sections}
    />
  );
}