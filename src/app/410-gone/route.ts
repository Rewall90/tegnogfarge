import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Innhold fjernet - TegnOgFarge.no</title>
    <meta name="robots" content="noindex, nofollow">
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: #FEFAF6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        h1 {
            color: #264653;
            font-size: 2.5em;
            margin-bottom: 20px;
        }
        .icon {
            font-size: 4em;
            margin: 20px 0;
        }
        p {
            font-size: 1.1em;
            line-height: 1.6;
            margin: 20px 0;
        }
        .btn {
            display: inline-block;
            background: #E76F51;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px;
        }
        .btn:hover {
            background: #D4634B;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Innhold fjernet</h1>
        <div class="icon">⚠️</div>
        <p>Dette innholdet har blitt permanent fjernet av juridiske årsaker knyttet til opphavsrett.</p>
        <p>Vi beklager for eventuelle ulemper dette måtte medføre.</p>
        <a href="/" class="btn">Gå til forsiden</a>
        <a href="/hoved-kategori" class="btn">Utforsk kategorier</a>
    </div>
</body>
</html>`,
    {
      status: 410,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      }
    }
  );
}