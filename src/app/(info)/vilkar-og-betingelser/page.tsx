import { Metadata } from 'next';
import BaseJsonLd from '@/components/json-ld/BaseJsonLd';
import PageLayout from '@/components/shared/PageLayout';
import Breadcrumbs from '@/components/shared/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Vilkår og betingelser - TegnOgFarge.no',
  description: 'Les våre vilkår og betingelser for bruk av TegnOgFarge.no. Få informasjon om dine rettigheter og plikter som bruker av vår tjeneste.',
  alternates: {
    canonical: 'https://www.tegnogfarge.no/vilkar-og-betingelser',
  },
};

export default function TermsAndConditionsPage() {
  const breadcrumbItems = [
    { label: 'Hjem', href: '/' },
    { label: 'Vilkår og betingelser', href: '/vilkar-og-betingelser', active: true }
  ];

  return (
    <PageLayout wrapperClassName="bg-[#FEFAF6]">
      <BaseJsonLd />
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="text-3xl font-bold mb-8">Vilkår og betingelser</h1>
        <div className="prose lg:prose-xl max-w-none">
          
          <p>Sist oppdatert: 18. juni 2024</p>
          
          <p>Velkommen til TegnOgFarge.no. Ved å bruke dette nettstedet godtar du å overholde og være bundet av følgende vilkår og betingelser. Vennligst les dem nøye.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">1. Bruk av innhold</h2>
          <p>Alt innhold på dette nettstedet, inkludert fargeleggingsark og illustrasjoner, er levert for personlig, ikke-kommersiell bruk. For mer informasjon, se vår <a href="/lisensieringspolicy">lisensieringspolicy</a>.</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">2. Ansvarsfraskrivelse</h2>
          <p>Innholdet på TegnOgFarge.no tilbys "som det er". Vi gir ingen garantier, verken uttrykte eller underforståtte, og fraskriver oss herved alle andre garantier.</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">3. Begrensninger</h2>
          <p>Under ingen omstendigheter skal TegnOgFarge.no eller dets leverandører være ansvarlig for eventuelle skader (inkludert, uten begrensning, skader for tap av data eller fortjeneste, eller på grunn av driftsavbrudd) som oppstår som følge av bruk eller manglende evne til å bruke materialet på nettstedet.</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">4. Endringer i vilkårene</h2>
          <p>Vi forbeholder oss retten til å revidere disse vilkårene og betingelsene når som helst uten varsel. Ved å bruke dette nettstedet, godtar du å være bundet av den da gjeldende versjonen av disse vilkårene.</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">5. Gjeldende lov</h2>
          <p>Disse vilkårene og betingelsene er underlagt og tolkes i samsvar med lovene i Norge, og du underkaster deg ugjenkallelig den eksklusive jurisdiksjonen til domstolene i den staten eller det stedet.</p>

        </div>
      </div>
    </PageLayout>
  );
} 