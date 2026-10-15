
import { useEffect } from "react";
import Hero from "../components/Hero";
import Homelisting from "../components/Homelisting";
import usePageMeta from "../Hooks/usePageMeta";
 
export default function Homepage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          name: "Campus Connect",
          url: "https://campusconnect.co.ke",
          logo: "https://campusconnect.co.ke/logo.png",
        },
        {
          "@type": "WebSite",
          name: "Campus Connect",
          url: "https://campusconnect.co.ke",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://campusconnect.co.ke/search?query={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        },
      ],
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  usePageMeta({
    title: "Buy and sell with students on your campus",
    description:
      "Buy and sell textbooks, electronics, hostel essentials and more with students on your campus. Browse the latest listings, chat on WhatsApp, meet safely and pay in person.",
  });
 
  return (
    <div>
      <Hero />
      <Homelisting />
    </div>
  );
}