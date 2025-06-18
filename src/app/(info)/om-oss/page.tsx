import { Metadata } from 'next';
import BaseJsonLd from '@/components/json-ld/BaseJsonLd';
import PageLayout from '@/components/shared/PageLayout';

export const metadata: Metadata = {
  title: 'Om Oss - TegnOgFarge.no',
  description: 'Lær mer om TegnOgFarge.no, vår misjon, og teamet bak siden. Finn ut hvorfor vi brenner for å tilby gratis fargeleggingsoppgaver for barn.',
  alternates: {
    canonical: 'https://www.tegnogfarge.no/om-oss',
  },
};

export default function AboutPage() {
  const breadcrumbItems = [
    { label: 'Hjem', href: '/' },
    { label: 'Om Oss', href: '/om-oss', active: true }
  ];

  return (
    <PageLayout breadcrumbItems={breadcrumbItems}>
      <BaseJsonLd />
      
      <div className="bg-[#FEFAF6] p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-6">Om Oss</h1>
        
        <div className="prose lg:prose-xl max-w-none mb-10">
          <p>Hos Tegn & Farge har vi som mål å inspirere barnas fantasi og utvikle kreative ferdigheter gjennom morsomme og enkle fargeleggingsark. Vi mener at fargelegging er mer enn en hyggelig aktivitet – det styrker motorikk, fargegjenkjenning og konsentrasjon.</p>
          
          <p>Vi startet opp i 2025 fordi vi ønsket å lage et sted hvor barn kan fargelegge og virkelig være kreative. Vår visjon er å gi barna et rom til å skape – ikke bare å bruke.</p>
          
          <p>Vi lanserte Tegn & Farge med en klar idé: å tilby en digital arena der barna kan uttrykke seg fritt og samtidig ha det gøy med enkle og engasjerende motiver. Siden starten har vi jobbet med å levere morsomt og lærerikt innhold som engasjerer små hoder og hender.</p>

          <p>Vårt mål er å støtte kreativ utvikling hos barn i alle aldre med lettfølgelige og underholdende fargeleggingsark. Vi oppdaterer kontinuerlig med nye temaer og ideer som inspirerer til videre utforskning og nysgjerrighet.</p>
          
          <p>Med Tegn & Farge blir fargelegging både morsommere og mer lærerikt enn noen gang! Bli med oss på denne fargerike reisen – la kreativiteten blomstre!</p>
        </div>
        
        <h2 className="text-2xl font-semibold mb-4">Kontakt Oss</h2>
        <p>Kontakt oss gjerne på <a href="mailto:kontakt@tegnogfarge.no" className="text-blue-600 hover:underline">kontakt@tegnogfarge.no</a> 😊</p>
      </div>
    </PageLayout>
  );
} 