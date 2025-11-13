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
  title: 'Personvernerklæring - TegnOgFarge.no',
  description: 'Denne personvernerklæringen forklarer hvordan vi i Tegn og Farge samler inn, bruker og beskytter personopplysninger når du bruker nettstedet vårt.',
  keywords: 'personvern, cookies, informasjonskapsler, samtykke, GDPR, norsk personvernlov, cookie consent',
  alternates: {
    canonical: 'https://tegnogfarge.no/personvernerklaering',
  },
  other: {
    'privacy-policy': 'https://tegnogfarge.no/personvernerklaering',
    'cookie-policy': 'https://tegnogfarge.no/personvernerklaering',
  },
};

export default async function PrivacyPolicyPage({ params }: PageProps) {
  const { locale } = await params;

  const breadcrumbItems = [
    { label: 'Hjem', href: locale === 'no' ? '/' : `/${locale}` },
    { label: 'Personvernerklæring', href: locale === 'no' ? '/personvernerklaering' : `/${locale}/personvernerklaering`, active: true }
  ];

  return (
    <PageLayout wrapperClassName="bg-[#FEFAF6]">
      <GenericWebPageJsonLd
        pageType="PrivacyPolicyPage"
        title="Personvernerklæring - TegnOgFarge.no"
        description="Denne personvernerklæringen forklarer hvordan vi i Tegn og Farge samler inn, bruker og beskytter personopplysninger når du bruker nettstedet vårt."
        pathname="/personvernerklaering"
      />
      
      {/* Enhanced JSON-LD for Privacy Compliance */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Personvernerklæring",
            "description": "Komplett personvernerklæring med informasjonskapsler og samtykkebehandling",
            "url": "https://tegnogfarge.no/personvernerklaering",
            "lastReviewed": "2024-12-12",
            "about": [
              {
                "@type": "Thing",
                "name": "GDPR Compliance",
                "description": "EU General Data Protection Regulation compliance"
              },
              {
                "@type": "Thing", 
                "name": "Cookie Consent",
                "description": "User consent management for information cookies"
              },
              {
                "@type": "Thing",
                "name": "Norwegian Privacy Law",
                "description": "Compliance with Norwegian data protection regulations"
              }
            ]
          })
        }}
      />
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <div>
          <h1 className="text-heading text-[#264653] font-bold mb-4">Personvernerklæring</h1>
          <p className="text-lg text-gray-600 mb-6">Sist oppdatert: 12. desember 2024</p>
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

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">Samtykkebehandling</h2>
          <p className="text-lg text-gray-600 mb-4">
            Vi respekterer ditt valg når det gjelder informasjonskapsler. Du kan når som helst endre dine samtykkepreferanser ved å klikke på cookie-innstillinger-knappen nederst til venstre på nettsiden.
          </p>
          <p className="text-lg text-gray-600 mb-4">
            Ditt samtykke lagres i 12 måneder. Etter dette vil du bli bedt om å fornye samtykket ditt. Du kan trekke tilbake samtykket ditt når som helst uten at det påvirker lovligheten av behandlingen som ble utført før tilbaketrekkingen.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">Mobilapp</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-[#264653]">TegnOgFarge Mobilapp</h3>
          <p className="text-lg text-gray-600 mb-4">TegnOgFarge tilbyr en mobilapp som lar brukere fargelegge bilder direkte på sin mobil eller nettbrett, og lagre dem på sin egen enhet.</p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-[#264653]">Informasjon vi samler inn</h3>
          <p className="text-lg text-gray-700 font-semibold mb-2">Fotobibliotek/Galleritilgang:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg mb-4">
            <li>Appen ber om tillatelse til å få tilgang til enhetens fotobibliotek/galleri</li>
            <li>Dette er kun for å lagre fargelagte kunstbilder lokalt på din enhet</li>
            <li>Vi leser IKKE eksisterende bilder fra fotobiblioteket ditt</li>
            <li>Vi får kun tilgang til å lagre nye bilder</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-[#264653]">Hva vi IKKE samler inn</h3>
          <p className="text-lg text-gray-600 mb-4">TegnOgFarge mobilapp samler IKKE inn noen personopplysninger:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg mb-4">
            <li>Vi samler IKKE inn navn, e-post eller kontaktinformasjon</li>
            <li>Vi sender IKKE bilder eller tegninger til våre servere</li>
            <li>Vi lagrer IKKE bilder eller data eksternt</li>
            <li>Vi sporer IKKE hvordan du bruker appen</li>
            <li>Vi samler IKKE inn analysdata eller brukerstatistikk</li>
            <li>Vi bruker IKKE sporingstjenester eller analysetjenester</li>
            <li>Vi deler IKKE data med tredjeparter</li>
            <li>Vi har INGEN annonser eller annonsepartnere</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-[#264653]">Hvordan data brukes</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg mb-4">
            <li>Fargelagte bilder lagres kun lokalt på din egen enhet i ditt fotobibliotek</li>
            <li>Du har full kontroll over alle lagrede bilder</li>
            <li>Du kan når som helst slette bilder direkte fra ditt fotobibliotek</li>
            <li>Alle bilder forblir på din enhet og sendes aldri over internett</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-[#264653]">Tillatelser appen ber om</h3>
          <p className="text-lg text-gray-700 font-semibold mb-2">Fotobibliotek/Galleritilgang (iOS) / Lagringstilgang (Android):</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg mb-4">
            <li><strong>Formål:</strong> Kun for å lagre dine ferdigfargede bilder til ditt fotobibliotek</li>
            <li><strong>Når:</strong> Når du velger å lagre et fargelagt bilde</li>
            <li><strong>Påkrevd:</strong> Valgfri - du kan bruke appen uten å lagre bilder</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-[#264653]">Offline funksjonalitet</h3>
          <p className="text-lg text-gray-600 mb-4">Appen fungerer helt offline og krever ingen internettforbindelse:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg mb-4">
            <li>Ingen data sendes over internett</li>
            <li>Ingen kommunikasjon med eksterne servere</li>
            <li>Alt skjer lokalt på din enhet</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-[#264653]">Personvern for barn</h3>
          <p className="text-lg text-gray-600 mb-4">Appen er designet for barn og familier. Vi tar personvern på alvor:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg mb-4">
            <li>Ingen datainnsamling</li>
            <li>Ingen annonser</li>
            <li>Ingen kjøp i appen</li>
            <li>Ingen kommunikasjonsfunksjoner</li>
            <li>Ingen eksterne lenker</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-[#264653]">Endringer i personvernerklæringen for mobilapp</h3>
          <p className="text-lg text-gray-600 mb-4">Vi forbeholder oss retten til å oppdatere denne personvernerklæringen. Ved vesentlige endringer vil vi informere brukere gjennom app-oppdateringer.</p>
          <p className="text-lg text-gray-600 mb-6"><strong>Sist oppdatert:</strong> 12. desember 2024</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-[#264653]">Kontakt oss</h2>
          <p className="text-lg text-gray-600">Har du spørsmål om personvern eller cookies? <Link href={locale === 'no' ? '/kontakt' : `/${locale}/kontakt`} className="text-link-orange hover:underline">Ta kontakt med oss</Link>, så hjelper vi deg gjerne!</p>

        </div>
      </div>
    </PageLayout>
  );
} 