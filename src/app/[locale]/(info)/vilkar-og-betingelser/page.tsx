import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '@/components/shared/PageLayout';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import GenericWebPageJsonLd from '@/components/json-ld/GenericWebPageJsonLd';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Vilkår og betingelser - TegnOgFarge.no',
  description: 'Når du besøker eller bruker nettsiden vår, sier du deg enig i reglene som står her. Les dem gjerne nøye.',
  alternates: {
    canonical: 'https://tegnogfarge.no/vilkar-og-betingelser',
  },
};

export default async function TermsAndConditionsPage({ params }: PageProps) {
  const { locale } = await params;

  const breadcrumbItems = [
    { label: 'Hjem', href: locale === 'no' ? '/' : `/${locale}` },
    { label: 'Vilkår og betingelser', href: locale === 'no' ? '/vilkar-og-betingelser' : `/${locale}/vilkar-og-betingelser`, active: true }
  ];

  return (
    <PageLayout wrapperClassName="bg-[#FEFAF6]">
      <GenericWebPageJsonLd
        pageType="WebPage"
        title="Vilkår og betingelser - TegnOgFarge.no"
        description="Når du besøker eller bruker nettsiden vår, sier du deg enig i reglene som står her. Les dem gjerne nøye."
        pathname="/vilkar-og-betingelser"
      />
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <div>
            <h1 className="text-heading text-[#264653] font-bold mb-4">Vilkår og betingelser</h1>
            <p className="text-lg text-gray-600 mb-8">
                Velkommen til Tegn og Farge! Når du besøker eller bruker nettsiden vår på https://tegnogfarge.no, sier du deg enig i reglene som står her. Les dem gjerne nøye – de forklarer hva du har lov til, og hva du ikke har lov til, når du bruker siden vår.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">1. Bruk av innholdet vårt</h2>
            <p className="text-lg text-gray-600 mb-4">
                Alle fargeleggingsark og annet innhold på Tegn og Farge er ment for personlig bruk eller bruk i skolesammenheng. Du kan laste ned, skrive ut og dele arkene for moro skyld, eller bruke dem i undervisning hjemme eller på skolen.
            </p>
            <p className="text-lg text-gray-700 mb-4">Det er ikke lov å bruke innholdet vårt til å tjene penger, for eksempel:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
                <li>Å selge eller dele arkene mot betaling</li>
                <li>Å bruke dem i bøker, blader, nettsider eller apper du tjener penger på</li>
                <li>Å bruke bildene våre i reklame, produkter eller prosjekter for bedrifter</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">2. Opphavsrett og eierskap</h2>
            <p className="text-lg text-gray-600 mb-8">
                Alt innhold – bilder, tegninger og tekst – tilhører Tegn og Farge og er beskyttet av loven. Du har ikke lov til å kopiere, endre eller bruke det som ditt eget uten tillatelse. Gjør du det likevel, kan det få juridiske konsekvenser.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">3. Deling som er lov</h2>
            <p className="text-lg text-gray-600 mb-8">
                Du kan gjerne laste ned og dele fargeleggingsark til personlig bruk eller i undervisning – for eksempel med venner, i klasserommet eller på dine egne sosiale medier (så lenge du ikke tjener penger på det). Du må også sørge for at innholdet ikke blir endret på en måte som bryter med opphavsretten.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">4. Abonnement i fremtiden</h2>
            <p className="text-lg text-gray-600 mb-8">
                Akkurat nå er alt på Tegn og Farge gratis. Men i fremtiden kan det hende vi legger til en abonnementstjeneste. Da vil vi lage egne regler for det.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">5. Hva du ikke har lov til</h2>
            <p className="text-lg text-gray-700 mb-4">Når du bruker nettsiden vår, lover du å ikke gjøre noe som:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
                <li>Bryter med norsk lov</li>
                <li>Ødelegger eller forstyrrer nettsiden vår</li>
                <li>Prøver å få tilgang til systemene eller dataene våre uten tillatelse</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">6. Endringer i reglene</h2>
            <p className="text-lg text-gray-600 mb-8">
                Vi kan endre på disse vilkårene når vi har behov for det. Hvis vi gjør endringer, legger vi det ut på denne siden. Vi anbefaler at du sjekker reglene med jevne mellomrom.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">Kontakt oss</h2>
            <p className="text-lg text-gray-600">
                Har du spørsmål om vilkårene våre? <Link href={locale === 'no' ? '/kontakt' : `/${locale}/kontakt`} className="text-link-orange hover:underline">Ta kontakt med oss</Link>, så hjelper vi deg gjerne!
            </p>
        </div>
      </div>
    </PageLayout>
  );
} 