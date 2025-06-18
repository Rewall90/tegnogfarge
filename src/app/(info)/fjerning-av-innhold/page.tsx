import { Metadata } from 'next';
import BaseJsonLd from '@/components/json-ld/BaseJsonLd';

export const metadata: Metadata = {
  title: 'Retningslinjer for fjerning av innhold - TegnOgFarge.no',
  description: 'Våre retningslinjer for fjerning av innhold. Lær hvordan du kan be om fjerning av innhold fra TegnOgFarge.no.',
  alternates: {
    canonical: 'https://www.tegnogfarge.no/fjerning-av-innhold',
  },
};

export default function ContentRemovalPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BaseJsonLd />
      <h1 className="text-3xl font-bold mb-8">Retningslinjer for fjerning av innhold</h1>
      <div className="prose lg:prose-xl max-w-none">
        
        <p>Vi respekterer andres immaterielle rettigheter og forventer at våre brukere gjør det samme. Hvis du mener at innhold på TegnOgFarge.no krenker dine opphavsrettigheter, vennligst følg prosedyren nedenfor.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Hvordan sende en forespørsel om fjerning</h2>
        <p>For å be om fjerning av innhold, vennligst send en e-post til [din e-postadresse for fjerning] med følgende informasjon:</p>
        <ul>
          <li>En fysisk eller elektronisk signatur fra eieren av opphavsretten (eller en person autorisert til å handle på vegne av eieren).</li>
          <li>Identifikasjon av det opphavsrettsbeskyttede verket du mener er blitt krenket.</li>
          <li>Identifikasjon av materialet du mener er krenkende, inkludert informasjon som er tilstrekkelig for at vi kan lokalisere materialet (f.eks. URL-en til siden).</li>
          <li>Din kontaktinformasjon, inkludert navn, adresse, telefonnummer og e-postadresse.</li>
          <li>En erklæring om at du i god tro mener at bruken av materialet ikke er autorisert av opphavsrettseieren, dens agent, eller loven.</li>
          <li>En erklæring om at informasjonen i varselet er nøyaktig, og, under straff for mened, at du er autorisert til å handle på vegne av eieren av en eksklusiv rett som angivelig er krenket.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Behandling av forespørselen</h2>
        <p>Når vi mottar en gyldig forespørsel, vil vi vurdere den og, hvis det er hensiktsmessig, fjerne eller deaktivere tilgangen til det angivelig krenkende materialet. Vi vil også varsle den berørte brukeren og gi dem mulighet til å sende inn en innsigelse.</p>
        
      </div>
    </div>
  );
} 