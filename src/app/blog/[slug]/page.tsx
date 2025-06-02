import { getPost } from '@/lib/sanity';
import { urlForImage } from '@/lib/sanityImageUrl';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import type { CategoryType } from '@/types/coloring';

// Funksjon for å formatere dato
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  
  if (!post) {
    return (
      <main className="container mx-auto px-4 py-8">
        <p>Innlegget ble ikke funnet.</p>
        <Link href="/blog" className="text-blue-500 hover:underline">← Tilbake til blogg</Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/blog" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Tilbake til blogg
      </Link>
      
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {post.mainImage && (
          <div className="w-full h-[400px] relative">
            <Image
              src={urlForImage(post.mainImage).toString()}
              alt={post.title}
              className="w-full h-full object-cover"
              fill
            />
          </div>
        )}
        
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center text-gray-600 mb-6">
            {post.publishedAt && (
              <time dateTime={post.publishedAt} className="text-sm">
                {formatDate(post.publishedAt)}
              </time>
            )}
            
            {post.categories && post.categories.length > 0 && (
              <div className="flex ml-4">
                <span className="mr-2">|</span>
                <div className="flex gap-2 flex-wrap">
                  {post.categories.map((category: CategoryType) => (
                    <Link 
                      key={category._id}
                      href={`/blog/category/${category.slug.current}`}
                      className="text-xs px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
                    >
                      {category.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {post.excerpt && (
            <div className="text-lg text-gray-700 mb-6 font-medium italic">
              {post.excerpt}
            </div>
          )}
          
          <div className="prose max-w-none">
            {post.body && <PortableText value={post.body} />}
          </div>
        </div>
      </article>
    </main>
  );
}

export async function generateStaticParams() {
  const posts = await import('@/lib/sanity').then(mod => mod.getPosts());
  return posts.map((post: { slug: { current: string } }) => ({ slug: post.slug.current }));
} 