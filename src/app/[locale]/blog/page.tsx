interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Blog</h1>
      <p className="mb-4">Du har publisert kategorien &quot;Superhelter&quot; og innlegget &quot;Mario&quot; i Sanity Studio.</p>
      <p>For å se og administrere innholdet, besøk Sanity Studio på:</p>
      <a 
        href="http://localhost:3333" 
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        http://localhost:3333
      </a>
    </div>
  );
} 