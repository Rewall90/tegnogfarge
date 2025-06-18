import { Metadata } from 'next';
import BaseJsonLd from '@/components/json-ld/BaseJsonLd';
import PageLayout from '@/components/shared/PageLayout';
import Breadcrumbs from '@/components/shared/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Personvernerklæring - TegnOgFarge.no',
  description: 'Les vår personvernerklæring for å forstå hvordan vi samler inn, bruker og beskytter dine personopplysninger på TegnOgFarge.no.',
  alternates: {
    canonical: 'https://www.tegnogfarge.no/personvernerklaering',
  },
};

export default function PrivacyPolicyPage() {
  const breadcrumbItems = [
    { label: 'Hjem', href: '/' },
    { label: 'Personvernerklæring', href: '/personvernerklaering', active: true }
  ];

  return (
    <PageLayout wrapperClassName="bg-[#FEFAF6]">
      <BaseJsonLd />
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="text-3xl font-bold mb-8">Personvernerklæring</h1>
        <div className="prose lg:prose-xl max-w-none">
          <p>Sist oppdatert: 18. juni 2024</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">1. Introduksjon</h2>
          <p>Denne personvernerklæringen beskriver hvordan TegnOgFarge.no ("vi", "oss", "vår") samler inn, bruker, og beskytter dine personopplysninger når du besøker og bruker vår nettside.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">2. Hvilke data samler vi inn?</h2>
          <p>Vi kan samle inn følgende typer informasjon:</p>
          <ul>
              <li><strong>Personlig identifikasjonsinformasjon:</strong> Navn og e-postadresse dersom du melder deg på vårt nyhetsbrev eller kontakter oss.</li>
              <li><strong>Bruksdata:</strong> Informasjon om hvordan du bruker nettstedet, som hvilke sider du besøker og hvor lenge. Dette samles inn anonymt via analyseverktøy.</li>
              <li><strong>Informasjonskapsler (Cookies):</strong> For å forbedre brukeropplevelsen.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">3. Hvordan bruker vi dine data?</h2>
          <p>Dine data brukes til å:</p>
          <ul>
              <li>Sende deg nyhetsbrev og oppdateringer, hvis du har samtykket til det.</li>
              <li>Forbedre nettstedet og brukeropplevelsen.</li>
              <li>Analysere trender og bruk for å skape bedre innhold.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">4. Deling av data</h2>
          <p>Vi selger, bytter eller leier ikke ut din personlige identifikasjonsinformasjon til andre. Anonymiserte, aggregerte data kan deles med tredjeparter for analyseformål.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">5. Dine rettigheter</h2>
          <p>Du har rett til å be om innsyn, retting eller sletting av dine personopplysninger. Du kan også trekke tilbake ditt samtykke til nyhetsbrev når som helst ved å følge avmeldingslenken i e-posten.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">6. Endringer i denne erklæringen</h2>
          <p>Vi kan oppdatere denne personvernerklæringen fra tid til annen. Vi vil varsle deg om eventuelle endringer ved å publisere den nye erklæringen på denne siden.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">7. Kontakt oss</h2>
          <p>Hvis du har spørsmål om denne personvernerklæringen, kan du <a href="mailto:kontakt@tegnogfarge.no">kontakte oss</a>.</p>
        </div>
      </div>
    </PageLayout>
  );
} 