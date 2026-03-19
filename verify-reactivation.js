require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'fn0kjvlp',
  dataset: 'production',
  apiVersion: '2024-06-05',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

// The 55 IDs we deactivated
const idsWeDeactivated = [
  'drawingImage-barn-kledd-ut-til-halloween-1758697829',
  'drawingImage-barn-lager-snomann-sammen-1760935947',
  'drawingImage-barn-lager-snomann-sammen-1760936143',
  'drawingImage-bie-flyr-hjem-til-bikuben-1762351839',
  'drawingImage-bjorn-fanger-fisk-i-elva-1763367771',
  'drawingImage-bjorn-fanger-fisk-i-elva-1763368219',
  'drawingImage-blomster-i-sirkel-med-monster-1762926648',
  'drawingImage-blomster-i-sirkel-med-monster-1762926809',
  'drawingImage-blomster-i-sirkelmonster-1762926399',
  'drawingImage-blomster-i-sirkelmonster-1762926419',
  'drawingImage-blomster-mandala-med-bokstaven-a-1763450516',
  'drawingImage-dragehode-med-mandala-monster-1762849126',
  'drawingImage-engel-leser-bok-pa-sky-1762491620',
  'drawingImage-engel-sitter-pa-en-sky-1762491498',
  'drawingImage-fint-paskeegg-med-monster-1762457084',
  'drawingImage-flagget-til-nord-korea-1763392642',
  'drawingImage-glad-fisk-med-sma-bobler-1752732725',
  'drawingImage-gravemaskin-graver-i-jorda-1759135612',
  'drawingImage-gresskar-med-skummelt-ansikt-1758697132',
  'drawingImage-gris-leker-i-sola-1751793100',
  'drawingImage-gris-leker-ute-i-regnet-1751793051',
  'drawingImage-julekule-med-enkle-striper-1761019651',
  'drawingImage-julekule-med-fint-monster-1761019598',
  'drawingImage-julekule-med-striper-1761019475',
  'drawingImage-julekule-med-striper-1761019820',
  'drawingImage-ku-star-ved-et-gjerde-1761384047',
  'drawingImage-ku-star-ved-et-gjerde-1761384085',
  'drawingImage-leopard-klatrer-opp-i-tre-1762665213',
  'drawingImage-leoparden-hviler-pa-en-stein-1762665507',
  'drawingImage-leopardmamma-passer-pa-barna-sine-1762665191',
  'drawingImage-lite-hus-med-gronn-hage-1760846453',
  'drawingImage-lite-hus-med-gronn-hage-1760846685',
  'drawingImage-liten-frosk-sitter-pa-blad-1762626141',
  'drawingImage-liten-frosk-sitter-pa-blad-1762626377',
  'drawingImage-liten-kanin-med-lange-orer-1758118817',
  'drawingImage-nissen-koser-seg-med-kjeks-1759638127',
  'drawingImage-racerbil-kjorer-over-malstreken-1759378807',
  'drawingImage-racerbil-med-stort-smil-1759378667',
  'drawingImage-racerbil-med-stort-smil-1759379153',
  'drawingImage-regnbue-over-byen-1760509110',
  'drawingImage-regnbue-over-fossen-1760508547',
  'drawingImage-regnbue-over-fossen-1760508564',
  'drawingImage-rein-som-gar-i-snoen-1761461541',
  'drawingImage-reinsdyr-drar-en-slede-1761461285',
  'drawingImage-reinsdyr-trekker-en-juleslede-1761461359',
  'drawingImage-rodt-eple-med-gronne-blader-1760502954',
  'drawingImage-skilpadde-med-mandala-monster-1762849460',
  'drawingImage-snofnugg-med-rette-kanter-1760936316',
  'drawingImage-to-spillere-kjemper-om-ballen-1753188392',
  'drawingImage-ugle-sitter-pa-en-grein-1761629000',
  'drawingImage-ugle-sitter-stille-pa-gren-1761629312',
  'drawingImage-ulv-som-gar-i-skogen-1761716699',
  'drawingImage-vanskelig-mandala-med-mange-blomster-1762926279',
  'drawingImage-vanskelig-mandala-med-mange-blomster-1762926439',
  'drawingImage-vi-pynter-juletreet-sammen-1759725539'
];

async function verifyReactivation() {
  console.log('=== VERIFYING REACTIVATION STATUS ===\n');
  console.log(`Checking ${idsWeDeactivated.length} drawings that were incorrectly deactivated...\n`);

  const drawings = await client.fetch(`
    *[_type == "drawingImage" && _id in $ids] {
      _id,
      title,
      isActive,
      "slug": slug.current
    }
  `, { ids: idsWeDeactivated });

  const stillDeactivated = drawings.filter(d => d.isActive === false);
  const nowActive = drawings.filter(d => d.isActive === true);

  console.log(`✅ Now ACTIVE: ${nowActive.length}`);
  console.log(`❌ Still DEACTIVATED: ${stillDeactivated.length}\n`);

  if (stillDeactivated.length > 0) {
    console.log('Still deactivated:\n');
    stillDeactivated.forEach((d, i) => {
      console.log(`${i + 1}. ${d.title} (${d._id})`);
    });
  } else {
    console.log('🎉 SUCCESS! All 55 pages have been reactivated!\n');
  }
}

verifyReactivation().catch(console.error);
