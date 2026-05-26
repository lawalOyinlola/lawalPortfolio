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
import { FAQS } from "@/app/constants";

const HOME_FAQ_LIMIT = 5;

export default function Home() {
  const { loading } = useLoading();

  return (
    <div>
      <Hero ready={!loading} />
      <Product />
      <Clients />
      <ScrollAnimation ready={!loading} />
      <Projects />
      <FaqJsonLd items={FAQS.slice(0, HOME_FAQ_LIMIT)} />
      <Faqs limit={HOME_FAQ_LIMIT} showSeeAll />
      <BrandStats>
        <ContactsRef
          scrollTriggerSelector="#stats-contact-section"
          scrollTriggerStart="84% top"
        />
      </BrandStats>
    </div>
  );
}
