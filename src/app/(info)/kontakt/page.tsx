import { Metadata } from 'next';
import PageLayout from '@/components/shared/PageLayout';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import ContactForm from '@/components/contact/ContactForm';
import GenericWebPageJsonLd from '@/components/json-ld/GenericWebPageJsonLd';

export const metadata: Metadata = {
  title: 'Kontakt Oss - TegnOgFarge.no',
  description: 'Har du spørsmål eller forslag? Kontakt oss via vårt kontaktskjema. Vi ser frem til å høre fra deg!',
  alternates: {
    canonical: 'https://www.tegnogfarge.no/kontakt',
  },
};

export default function ContactPage() {
  const breadcrumbItems = [
    { label: 'Hjem', href: '/' },
    { label: 'Kontakt Oss', href: '/kontakt', active: true }
  ];

  return (
    <PageLayout wrapperClassName="bg-[#FEFAF6]">
      <GenericWebPageJsonLd
        pageType="ContactPage"
        title="Kontakt Oss - TegnOgFarge.no"
        description="Har du spørsmål eller forslag? Kontakt oss via vårt kontaktskjema. Vi ser frem til å høre fra deg!"
        pathname="/kontakt"
      />
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mb-12">
            <h1 className="text-heading text-[#264653] font-bold mb-4">Kontakt Oss</h1>
            <p className="text-lg text-gray-600 mb-8">
              Har du spørsmål, innspill eller noe du lurer på? Vi setter alltid pris på å høre fra deg. Enten du har forslag til nye fargeleggingsark, trenger hjelp med noe, eller har lyst til å bidra med ideer – ta kontakt!
            </p>
            <p className="text-lg text-gray-700 mb-4">Du kan nå oss hvis du for eksempel:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Har spørsmål om innholdet på nettsiden</li>
              <li>Vil dele forslag eller tilbakemeldinger</li>
              <li>Ser etter muligheter for samarbeid</li>
              <li>Trenger hjelp med noe teknisk</li>
            </ul>
        </div>
        <ContactForm />
      </div>
    </PageLayout>
  );
} 