import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '@/components/shared/PageLayout';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import GenericWebPageJsonLd from '@/components/json-ld/GenericWebPageJsonLd';

export const metadata: Metadata = {
  title: 'Lisensieringspolicy - TegnOgFarge.no',
  description: 'Alt innhold på Tegn og Farge er beskyttet av opphavsrett. Les om hva du har lov til å gjøre med innholdet vårt, og hva som ikke er tillatt.',
  alternates: {
    canonical: 'https://www.tegnogfarge.no/lisensieringspolicy',
  },
};

export default function LicensePage() {
  const breadcrumbItems = [
    { label: 'Hjem', href: '/' },
    { label: 'Lisensieringspolicy', href: '/lisensieringspolicy', active: true }
  ];

  return (
    <PageLayout wrapperClassName="bg-[#FEFAF6]">
      <GenericWebPageJsonLd
        pageType="WebPage"
        title="Lisensieringspolicy - TegnOgFarge.no"
        description="Alt innhold på Tegn og Farge er beskyttet av opphavsrett. Les om hva du har lov til å gjøre med innholdet vårt, og hva som ikke er tillatt."
        pathname="/lisensieringspolicy"
      />
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <div>
            <h1 className="text-heading text-[#264653] font-bold mb-4">Lisensieringspolicy</h1>
            <p className="text-lg text-gray-600 mb-8">
                Alt innhold på Tegn og Farge – som fargeleggingsark, bilder og tekst – er beskyttet av opphavsrett. Det betyr at det er vi som eier det, og at det kun er ment til personlig bruk eller bruk i skolesammenheng. Når du bruker innholdet vårt, sier du deg enig i reglene under:
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">1. Hva du har lov til å gjøre</h2>
            <p className="text-lg text-gray-600 mb-4">Du kan laste ned, skrive ut og dele fargeleggingsarkene våre så lenge det er til privat eller skolebruk. Dette gjelder for eksempel:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
                <li>Bruk i skoler av lærere og elever, både i klasserommet og hjemme</li>
                <li>Å dele med venner og familie</li>
                <li>Å legge ut bilder på sosiale medier, så lenge det ikke er for å tjene penger</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">2. Hva du ikke har lov til</h2>
            <p className="text-lg text-gray-600 mb-4">Du kan ikke bruke innholdet vårt til noe som handler om å tjene penger. Dette gjelder blant annet:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
                <li>Å selge eller dele arkene våre videre, enten slik de er eller endret</li>
                <li>Å bruke innholdet vårt i bøker, produkter eller ting som folk betaler for</li>
                <li>Å bruke bildene våre i reklame eller prosjekter hvor noen tjener penger</li>
            </ul>
            <p className="text-lg text-gray-600 mt-4 mb-8">Det er ikke lov å bruke innholdet vårt til kommersielle formål uten tillatelse. Det kan få konsekvenser.</p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">3. Hvem som eier innholdet</h2>
            <p className="text-lg text-gray-600 mb-8">
                Alt på Tegn og Farge er laget og eid av oss. Du kan ikke si at du har laget det selv, eller bruke det som ditt eget – verken originalen eller noe du har forandret på.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">4. Spesielle ønsker?</h2>
            <p className="text-lg text-gray-600 mb-8">
                Har du lyst til å bruke noe fra oss på en måte som ikke står her – for eksempel i et prosjekt eller noe kommersielt – må du <Link href="/kontakt" className="text-link-orange hover:underline">kontakte oss</Link>. Vi leser hver forespørsel og svarer så fort vi kan.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">5. Endringer i reglene</h2>
            <p className="text-lg text-gray-600 mb-8">
                Vi kan endre på disse reglene når som helst. Sjekk gjerne innom her av og til for å se hva som gjelder.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">Spørsmål?</h2>
            <p className="text-lg text-gray-600">
                Lurer du på noe om disse reglene? <Link href="/kontakt" className="text-link-orange hover:underline">Ta kontakt med oss</Link> – vi hjelper deg gjerne!
            </p>
        </div>
      </div>
    </PageLayout>
  );
} 