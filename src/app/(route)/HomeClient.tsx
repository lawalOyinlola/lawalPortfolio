"use client";

import { useLoading } from "@/components/providers/LoadingContext";
import Hero from "@/components/Hero";
import Product from "@/components/Product";
import Clients from "@/components/Clients";
import ScrollAnimation from "@/components/ScrollAnimation";
import Projects from "@/components/Projects";
import Faqs from "@/components/Faqs";
import FaqJsonLd from "@/components/FaqJsonLd";
import BrandStats from "@/components/BrandStats";
import ContactsRef from "@/components/ContactsRef";
import SecurityShowcase, {
  type ShowcaseLab,
} from "@/components/SecurityShowcase";
import { FAQS } from "@/app/constants";

const HOME_FAQ_LIMIT = 5;

interface HomeClientProps {
  securityLab: ShowcaseLab | null;
}

// Order: who I am, what I build (the work), then how I test it, proof from
// others, the record, the answers, and finally the ask. The grid sits between
// the work and the security section so its dark bars run straight into it.
export default function HomeClient({ securityLab }: HomeClientProps) {
  const { loading } = useLoading();

  return (
    <div>
      <Hero ready={!loading} />
      <Product />
      <Projects />
      <ScrollAnimation ready={!loading} />
      <SecurityShowcase lab={securityLab} />
      <Clients />
      <BrandStats />
      {/* Slides up over the last, pinned screen of BrandStats */}
      <div className="relative z-2 mt-[-100vh]">
        <FaqJsonLd items={FAQS.slice(0, HOME_FAQ_LIMIT)} />
        <Faqs limit={HOME_FAQ_LIMIT} showSeeAll figure />
      </div>
      <div id="contact" className="relative z-2">
        <ContactsRef />
      </div>
    </div>
  );
}
