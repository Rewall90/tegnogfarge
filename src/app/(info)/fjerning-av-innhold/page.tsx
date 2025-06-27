import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '@/components/shared/PageLayout';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import GenericWebPageJsonLd from '@/components/json-ld/GenericWebPageJsonLd';

export const metadata: Metadata = {
  title: 'Fjerning av innhold - TegnOgFarge.no',
  description: 'Hos Tegn og Farge er vi opptatt av å gjøre ting riktig. Vi bruker bare bilder og innhold vi har lov til å bruke, og vi håper alle som bruker siden vår gjør det samme.',
  alternates: {
    canonical: 'https://tegnogfarge.no/fjerning-av-innhold',
  },
};

export default function ContentRemovalPolicyPage() {
  const breadcrumbItems = [
    { label: 'Hjem', href: '/' },
    { label: 'Fjerning av innhold', href: '/fjerning-av-innhold', active: true }
  ];

  return (
    <PageLayout wrapperClassName="bg-[#FEFAF6]">
      <GenericWebPageJsonLd
        pageType="WebPage"
        title="Fjerning av innhold - TegnOgFarge.no"
        description="Hos Tegn og Farge er vi opptatt av å gjøre ting riktig. Vi bruker bare bilder og innhold vi har lov til å bruke, og vi håper alle som bruker siden vår gjør det samme."
        pathname="/fjerning-av-innhold"
      />
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <div>
            <h1 className="text-heading text-[#264653] font-bold mb-4">Retningslinjer for fjerning av innhold</h1>
            <p className="text-lg text-gray-600 mb-8">
                Hos Tegn og Farge er vi opptatt av å gjøre ting riktig. Vi bruker bare bilder og innhold vi har lov til å bruke, og vi håper alle som bruker siden vår gjør det samme.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">1. Hvis du mener vi har brukt noe vi ikke har lov til</h2>
            <p className="text-lg text-gray-600 mb-4">
                Dersom du ser noe på nettsiden vår som du mener vi ikke har rett til å bruke – kanskje du selv eier det – kan du <Link href="/kontakt" className="text-link-orange hover:underline">kontakte oss via kontaktskjemaet</Link>. Vennligst inkluder følgende informasjon i meldingen din:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
                <li>Hvilket innhold du mener er feil å bruke (f.eks. bilde eller tekst), og lenke til hvor vi finner det på nettsiden</li>
                <li>Hvorfor det ikke er greit at vi bruker det</li>
                <li>Ditt navn, e-post og eventuelt adresse</li>
                <li>Bevis på at du eier det, eller at du har lov til å si ifra på vegne av den som gjør det</li>
                <li>En setning hvor du forklarer at du virkelig tror vi har gjort en feil, og at dette ikke er noe vi har fått lov til</li>
                <li>En setning hvor du sier at alt du skriver er sant</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">2. Hva skjer etterpå?</h2>
            <p className="text-lg text-gray-600 mb-8">
                Når vi har fått meldingen din, ser vi gjennom alt så fort vi kan. Hvis det ser ut som du har rett, fjerner vi det innholdet du har sagt ifra om. Vi kan også kontakte deg hvis vi trenger mer informasjon.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">3. Hvis vi har fjernet noe ved en feil</h2>
            <p className="text-lg text-gray-600 mb-4">
                Hvis du har lagt ut noe på vår nettside, og det har blitt tatt bort – men du mener det var en feil – kan du også sende oss en e-post. Skriv da:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
                <li>Hva som ble tatt bort, og hvor det var</li>
                <li>At du mener det ble fjernet ved en feil</li>
                <li>Navn, adresse og e-postadressen din</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">4. Endringer i reglene</h2>
            <p className="text-lg text-gray-600 mb-8">
                Vi kan komme til å endre på disse reglene hvis det trengs. Hvis vi gjør det, sier vi fra her på denne siden. Du kan gjerne komme innom og lese dem igjen senere.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">Spørsmål?</h2>
            <p className="text-lg text-gray-600">
                Lurer du på noe? <Link href="/kontakt" className="text-link-orange hover:underline">Ta kontakt med oss</Link>, så svarer vi så fort vi kan.
            </p>
        </div>
      </div>
    </PageLayout>
  );
} 