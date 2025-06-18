import { Metadata } from 'next';
import BaseJsonLd from '@/components/json-ld/BaseJsonLd';
import PageLayout from '@/components/shared/PageLayout';
import Breadcrumbs from '@/components/shared/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Lisensieringspolicy - TegnOgFarge.no',
  description: 'Les våre retningslinjer for bruk av fargeleggingsark fra TegnOgFarge.no. Informasjon om personlig og kommersiell bruk.',
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
      <BaseJsonLd />
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="text-3xl font-bold mb-8">Lisensieringspolicy</h1>
        <div className="prose lg:prose-xl max-w-none">
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">Personlig Bruk</h2>
          <p>Alle fargeleggingsark tilgjengelig på TegnOgFarge.no er gratis for personlig, ikke-kommersiell bruk. Dette inkluderer:</p>
          <ul>
            <li>Utskrift av fargeleggingsark for deg selv, din familie, eller dine venner.</li>
            <li>Bruk i klasserom, barnehager, eller andre pedagogiske sammenhenger, så lenge det ikke innebærer videresalg.</li>
            <li>Deling av lenker til våre sider på sosiale medier eller blogger.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">Ikke-tillatt Bruk</h2>
          <p>Du har ikke tillatelse til å:</p>
          <ul>
            <li>Videreselge, distribuere eller publisere våre fargeleggingsark på andre nettsteder eller plattformer.</li>
            <li>Bruke våre illustrasjoner i kommersielle produkter eller tjenester uten uttrykkelig skriftlig tillatelse.</li>
            <li>Fjerne vårt nettstedsnavn eller logo fra fargeleggingsarkene.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">Kommersiell Bruk</h2>
          <p>Hvis du ønsker å bruke våre illustrasjoner for kommersielle formål, for eksempel i bøker, markedsføringsmateriell eller andre produkter, vennligst kontakt oss for å diskutere en lisensavtale.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">Spørsmål?</h2>
          <p>Har du spørsmål om vår lisensieringspolicy? Ikke nøl med å <a href="mailto:kontakt@tegnogfarge.no">kontakte oss</a>.</p>
        </div>
      </div>
    </PageLayout>
  );
} 