/src
  /app
    /page.tsx                    # Forside
    /categories
      /page.tsx                  # Kategorioversikt
      /[slug]/page.tsx          # Spesifikk kategori
    /blog
      /page.tsx                  # Bloggoversikt
      /[slug]/page.tsx          # Enkelt blogginnlegg
    /about/page.tsx             # Om oss
    /login/page.tsx             # Innlogging
    /register/page.tsx          # Registrering
    /dashboard/page.tsx         # Brukerdashboard (samleside)
    /coloring/[id]/page.tsx     # Fargeleggingsverktøy for én tegning
    /api                         # API-ruter
      /auth/[...nextauth]/route.ts
      /drawings/route.ts
      /drawings/[id]/route.ts
      /colorings/route.ts
      /favorites/route.ts
      /blog/route.ts
      /categories/route.ts
      /sitemap.xml/route.ts
      /robots.txt/route.ts
    /layout.tsx                 # Global layout
    /globals.css                # Global stil

/components
  /ui
    Button.tsx
    Card.tsx
    Input.tsx
    Modal.tsx
  /shared
    Header.tsx
    Footer.tsx
  /ColoringCanvas.tsx          # Canvas for tegning
  /ColorPicker.tsx             # Fargevelger
  /FavoriteButton.tsx          # Hjerte/favoritt
  /PostPreview.tsx             # Brukes i blogg

/hooks
  useAuth.ts
  useColoring.ts
  useFavorites.ts

/lib
  db.ts                         # MongoDB-tilkobling
  apiClient.ts                  # Fetch-wrapper for API-kall

/models
  user.ts
  drawing.ts
  coloring.ts
  favorite.ts
  category.ts
  blog.ts

/types
  index.d.ts                    # Globale typer

/contexts
  AuthContext.tsx
  ColoringContext.tsx

/utils
  format.ts
  seo.ts
  colors.ts

/public
  /images
    /drawings
    /blog
  favicon.ico
  logo.svg

/middleware.ts
/next.config.js
/tailwind.config.ts
/postcss.config.js
/.env.local
/tsconfig.json
/package.json
