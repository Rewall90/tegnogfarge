import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '@/components/shared/PageLayout';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import GenericWebPageJsonLd from '@/components/json-ld/GenericWebPageJsonLd';

export const metadata: Metadata = {
  title: 'Personvernerklæring - TegnOgFarge.no',
  description: 'Denne personvernerklæringen forklarer hvordan vi i Tegn og Farge samler inn, bruker og beskytter personopplysninger når du bruker nettstedet vårt.',
  alternates: {
    canonical: 'https://tegnogfarge.no/personvernerklaering',
  },
};

export default function PrivacyPolicyPage() {
  const breadcrumbItems = [
    { label: 'Hjem', href: '/' },
    { label: 'Personvernerklæring', href: '/personvernerklaering', active: true }
  ];

  return (
    <PageLayout wrapperClassName="bg-[#FEFAF6]">
      <GenericWebPageJsonLd
        pageType="PrivacyPolicyPage"
        title="Personvernerklæring - TegnOgFarge.no"
        description="Denne personvernerklæringen forklarer hvordan vi i Tegn og Farge samler inn, bruker og beskytter personopplysninger når du bruker nettstedet vårt."
        pathname="/personvernerklaering"
      />
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <div>
          <h1 className="text-heading text-[#264653] font-bold mb-4">Personvernerklæring</h1>
          <p className="text-lg text-gray-600 mb-6">Sist oppdatert: 7. november 2024</p>
          <p className="text-lg text-gray-600 mb-4">Denne personvernerklæringen forklarer hvordan vi i Tegn og Farge samler inn, bruker og beskytter personopplysninger når du bruker nettstedet vårt. Den forteller også hvilke rettigheter du har, og hvordan loven beskytter deg.</p>
          <p className="text-lg text-gray-600 mb-8">Når du bruker tjenestene våre, samtykker du i at vi kan samle inn og bruke informasjon i tråd med det som står her.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">Hva betyr de ulike begrepene?</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
            <li><strong>Konto:</strong> En konto du eventuelt oppretter hos oss for å bruke bestemte funksjoner.</li>
            <li><strong>Vi / Oss / Vår:</strong> Betyr Tegn og Farge.</li>
            <li><strong>Tjeneste:</strong> Nettsiden vår, tegnogfarge.no.</li>
            <li><strong>Enhet:</strong> Dingsen du bruker – f.eks. mobil, nettbrett eller datamaskin.</li>
            <li><strong>Personopplysninger:</strong> Informasjon som kan brukes til å kjenne deg igjen, som navn og e-post.</li>
            <li><strong>Bruksdata:</strong> Tekniske data om hvordan du bruker siden, f.eks. hvilke sider du besøker og hvor lenge.</li>
            <li><strong>Informasjonskapsler (Cookies):</strong> Små filer som lagres i nettleseren din for å gjøre opplevelsen bedre.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">Hvilken informasjon samler vi inn?</h2>
          <p className="text-lg text-gray-700 font-semibold mb-2">Personopplysninger</p>
          <p className="text-lg text-gray-600 mb-4">Når du bruker nettsiden vår, kan vi be deg oppgi:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
            <li>Navn</li>
            <li>E-postadresse</li>
            <li>Annen informasjon du gir oss frivillig</li>
          </ul>

          <p className="text-lg text-gray-700 font-semibold mt-4 mb-2">Bruksdata</p>
          <p className="text-lg text-gray-600 mb-4">Vi samler automatisk inn teknisk informasjon, for eksempel:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
            <li>IP-adresse</li>
            <li>Nettlesertype og versjon</li>
            <li>Tid og dato for besøk</li>
            <li>Hvor lenge du er på ulike sider</li>
            <li>Hva slags enhet du bruker</li>
          </ul>

          <p className="text-lg text-gray-700 font-semibold mt-4 mb-2">Informasjonskapsler og sporing</p>
          <p className="text-lg text-gray-600 mb-4">Vi bruker cookies og lignende teknologier for å:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
            <li>Forbedre tjenestene våre</li>
            <li>Huske valgene dine (som språk og pålogging)</li>
            <li>Forstå hvordan nettsiden brukes</li>
          </ul>
          <p className="text-lg text-gray-600 mt-4">Du kan selv velge å skru av cookies i nettleseren din. Men det kan føre til at noen funksjoner ikke virker som de skal.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">Hvordan bruker vi informasjonen din?</h2>
          <p className="text-lg text-gray-600 mb-4">Vi bruker informasjonen til å:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
            <li>Gi deg tilgang til nettsiden og forbedre den</li>
            <li>Kontakte deg hvis nødvendig (f.eks. ved endringer)</li>
            <li>Sende deg nyttig informasjon (hvis du ønsker det)</li>
            <li>Forstå hvordan nettsiden brukes</li>
            <li>Håndtere forespørsler du sender oss</li>
          </ul>
          <p className="text-lg text-gray-600 mt-4">Vi kan også bruke informasjonen i forbindelse med tekniske forbedringer, statistikk, og sikkerhet.</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">Når deler vi informasjon?</h2>
          <p className="text-lg text-gray-600 mb-4">Vi kan dele informasjonen din med:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
            <li>Tjenesteleverandører som hjelper oss med drift</li>
            <li>Samarbeidspartnere (f.eks. hvis du ber om noe via dem)</li>
            <li>Ved juridiske krav eller dersom vi er nødt til å beskytte deg eller oss selv</li>
            <li>I forbindelse med endringer i eierskap av virksomheten</li>
            <li>Med ditt samtykke</li>
          </ul>
          <p className="text-lg text-gray-600 mt-4">Vi selger ikke informasjonen din videre.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">Hvor lenge lagrer vi informasjon?</h2>
          <p className="text-lg text-gray-600">Vi lagrer informasjonen din så lenge det er nødvendig for det den ble samlet inn til. Noe informasjon kan vi måtte lagre lenger for å følge loven (f.eks. regnskap eller sikkerhet).</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">Hvor lagres informasjonen?</h2>
          <p className="text-lg text-gray-600">Data kan bli lagret på servere utenfor Norge. Vi sørger alltid for at informasjonen behandles trygt og i tråd med personvernlovgivningen.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">Dine rettigheter</h2>
          <p className="text-lg text-gray-600 mb-4">Du har rett til å:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
            <li>Se hvilke data vi har lagret om deg</li>
            <li>Få informasjon rettet, oppdatert eller slettet</li>
            <li>Trekke tilbake samtykket ditt (der det er aktuelt)</li>
          </ul>
          <p className="text-lg text-gray-600 mt-4">Kontakt oss hvis du ønsker å bruke noen av disse rettighetene.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">Barn under 13 år</h2>
          <p className="text-lg text-gray-600">Tjenesten vår er ikke ment for barn under 13 år. Vi samler ikke bevisst inn personopplysninger fra barn. Hvis du er forelder og tror barnet ditt har delt info med oss, ta kontakt – så fjerner vi det.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">Lenker til andre sider</h2>
          <p className="text-lg text-gray-600">Noen ganger lenker vi til andre nettsteder. Vi er ikke ansvarlige for hvordan disse sidene håndterer personvern. Les gjerne personvernerklæringen på de sidene du besøker.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">Endringer i personvernerklæringen</h2>
          <p className="text-lg text-gray-600">Vi kan oppdatere denne teksten fra tid til annen. Endringer blir lagt ut på denne siden, og vi varsler deg hvis det skjer større endringer.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">Kontakt oss</h2>
          <p className="text-lg text-gray-600">Har du spørsmål om personvern? <Link href="/kontakt" className="text-link-orange hover:underline">Ta kontakt med oss</Link>, så hjelper vi deg gjerne!</p>

        </div>
      </div>
    </PageLayout>
  );
} 