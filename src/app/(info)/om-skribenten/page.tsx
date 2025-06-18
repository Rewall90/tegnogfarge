import { Metadata } from 'next';
import BaseJsonLd from '@/components/json-ld/BaseJsonLd';

export const metadata: Metadata = {
  title: 'Om Skribenten - TegnOgFarge.no',
  description: 'Bli kjent med skribenten og illustratøren bak TegnOgFarge.no. Lær om lidenskapen for kreativitet og tegning som driver nettstedet.',
  alternates: {
    canonical: 'https://www.tegnogfarge.no/om-skribenten',
  },
};

export default function SkribentPage() {
  return (
    <>
      <BaseJsonLd />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Om Skribenten</h1>
        <div className="prose lg:prose-xl max-w-none">
          <p>
            Velkommen til siden om meg, skribenten og illustratøren som står bak alle tegningene du finner på TegnOgFarge.no. 
            Jeg er utrolig glad for å kunne dele min lidenskap for kunst og kreativitet med dere.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">Min Bakgrunn</h2>
          <p>
            Helt siden jeg var liten, har tegning vært min måte å uttrykke meg på. Jeg har tilbrakt utallige timer med blyant og papir, og senere med digitale tegneverktøy, for å skape verdener og karakterer fra fantasien. Jeg har en formell utdanning innen grafisk design og illustrasjon, noe som har gitt meg et solid fundament for å skape de tegningene du ser her.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">Min Filosofi</h2>
          <p>
            Jeg tror at alle har en kunstner inni seg som bare venter på å slippe ut. Fargelegging er en fantastisk måte å
            utforske denne siden av seg selv på, uansett alder eller ferdighetsnivå. Det handler ikke om å skape et
            perfekt mesterverk, men om å ha det gøy, slappe av og la kreativiteten flyte.
          </p>

          <p>
            Alle tegningene på denne siden er laget med kjærlighet og et ønske om å inspirere. Jeg håper de gir deg
            like mye glede å fargelegge som de ga meg å tegne.
          </p>

          <p>
            Hvis du vil se mer av arbeidet mitt utenfor dette prosjektet, eller kanskje til og med bestille en
            personlig tegning, kan du besøke min portefølje på [Link til portefølje/annen nettside].
          </p>
          
          <p>
            Takk for at du tok deg tid til å bli litt bedre kjent med meg. God fargelegging!
          </p>

          <p>
            For mer informasjon om hvordan du kan bruke bildene, se vår <a href="/lisensieringspolicy">lisensieringspolicy</a>.
          </p>
        </div>
      </div>
    </>
  );
}