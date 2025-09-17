// Summary of Copyrighted Content Found in Sanity CMS
// ===================================================

const copyrightAnalysisResults = {
  totalSubcategories: 17,
  totalDrawings: 590,
  charactersFound: 16,
  charactersNotFound: 1, // Svampebobb (SpongeBob)

  subcategories: [
    {
      id: "0ee36888-dd85-4390-8e5b-1611d37810ec",
      title: "Pokemon Figurer",
      slug: "fargelegging-pokemon",
      parentCategory: "Tegneserier",
      drawingCount: 145,
      character: "Pokemon"
    },
    {
      id: "7946942b-c622-473e-b807-16b8674c8afb",
      title: "Fargelgg PawPatrol",
      slug: "fargelgg-pawpatrol",
      parentCategory: "Tegneserier",
      drawingCount: 23,
      character: "Paw Patrol"
    },
    {
      id: "d73b37fc-2d66-436e-9e21-ebd3ca3fdc51",
      title: "Fargelegg Ole Brumm",
      slug: "fargelegg-ole-brumm",
      parentCategory: "Tegneserier",
      drawingCount: 24,
      character: "Ole Brumm (Winnie the Pooh)"
    },
    {
      id: "ab07aa95-db21-40df-8fae-980804cb5785",
      title: "Fargelegg Ninjago",
      slug: "fargelegg-ninjago",
      parentCategory: "Tegneserier",
      drawingCount: 25,
      character: "Ninjago"
    },
    {
      id: "790d299b-9ae8-4656-bbe0-d13582d3c690",
      title: "Fargelegg Minions",
      slug: "fargelegg-minions",
      parentCategory: "Tegneserier",
      drawingCount: 24,
      character: "Minions"
    },
    {
      id: "3ffdc5b9-e400-47e2-9d89-d284514aa736",
      title: "Fargelegg Karakterene i My Little Pony",
      slug: "fargelegg-karakterene-i-my-little-pony",
      parentCategory: "Tegneserier",
      drawingCount: 29,
      character: "My Little Pony"
    },
    {
      id: "21780f69-53f4-4aa2-a122-23bc41007982",
      title: "Fargelegg Hello Kitty",
      slug: "fargelegg-hello-kitty",
      parentCategory: "Tegneserier",
      drawingCount: 28,
      character: "Hello Kitty"
    },
    {
      id: "01781d83-f1de-43bd-9be6-5040e1fee4e5",
      title: "Fargelegg Harry Potter",
      slug: "fargelegg-harry-potter",
      parentCategory: "Tegneserier",
      drawingCount: 30,
      character: "Harry Potter"
    },
    {
      id: "feb10488-b0d3-4213-92a4-7d41fe8b27a0",
      title: "Fargelegg Elsa",
      slug: "fargelegg-elsa",
      parentCategory: "Tegneserier",
      drawingCount: 34,
      character: "Elsa"
    },
    {
      id: "6941859a-69cd-470a-ab2b-98b7ee213e6e",
      title: "Disney Prinsesser",
      slug: "disney-prinsesser",
      parentCategory: "Tegneserier",
      drawingCount: 17,
      character: "Disney figurer (Disney characters)"
    },
    {
      id: "8a19da8a-5aed-4552-91ba-141b3ee914bb",
      title: "Fargelegg Disney Figurer",
      slug: "fargelegg-disney-figurer",
      parentCategory: "Tegneserier",
      drawingCount: 26,
      character: "Disney figurer (Disney characters)"
    },
    {
      id: "6265e08e-b88e-43a9-8d33-10ba50645ed3",
      title: "Fargelegg Barbie",
      slug: "fargelegg-barbie",
      parentCategory: "Tegneserier",
      drawingCount: 31,
      character: "Barbie"
    },
    {
      id: "8629531d-3edf-4ede-9309-8695001471b9",
      title: "Fargelegg Spiderman",
      slug: "fargelegg-spiderman",
      parentCategory: "Superhelter",
      drawingCount: 57,
      character: "Spiderman"
    },
    {
      id: "f4545a83-f722-4dca-a94e-5e60c85387be",
      title: "Fargelegg Sonic",
      slug: "fargelegg-sonic",
      parentCategory: "Superhelter",
      drawingCount: 27,
      character: "Sonic"
    },
    {
      id: "2cb2b5c8-92b1-4182-8b09-5600adc2fe04",
      title: "Fargelegg Mario",
      slug: "fargelegg-mario",
      parentCategory: "Superhelter",
      drawingCount: 24,
      character: "Mario"
    },
    {
      id: "1270073f-1bcb-4000-9255-4b12568e9d10",
      title: "Fargelegg DeadPool",
      slug: "fargelegg-deadpool",
      parentCategory: "Superhelter",
      drawingCount: 24,
      character: "Deadpool"
    },
    {
      id: "dd1aeea8-b581-4b72-83a2-15b7ff0beacb",
      title: "Fargelegg Captain America",
      slug: "fargelegg-captain-america",
      parentCategory: "Superhelter",
      drawingCount: 22,
      character: "Captain America"
    }
  ]
};

console.log(`
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                            COPYRIGHTED CONTENT REMOVAL SUMMARY                         ║
╠════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                        ║
║  📊 OVERVIEW:                                                                          ║
║  • Total copyrighted subcategories found: ${copyrightAnalysisResults.totalSubcategories.toString().padEnd(39)} ║
║  • Total drawings affected: ${copyrightAnalysisResults.totalDrawings.toString().padEnd(53)} ║
║  • Characters found: ${copyrightAnalysisResults.charactersFound}/17 ${' '.repeat(56)} ║
║  • Character not found: Svampebobb (SpongeBob) ${' '.repeat(40)} ║
║                                                                                        ║
║  🎯 DISTRIBUTION BY CATEGORY:                                                          ║
║  • Tegneserier: 12 subcategories, 423 drawings ${' '.repeat(35)} ║
║  • Superhelter: 5 subcategories, 167 drawings ${' '.repeat(36)} ║
║                                                                                        ║
║  🚨 LEGAL RISK ASSESSMENT:                                                             ║
║  • HIGH RISK: Pokemon (145 drawings), Spiderman (57 drawings), Elsa (34 drawings)     ║
║  • MEDIUM RISK: Barbie, Harry Potter, My Little Pony, Hello Kitty                     ║
║  • ALL CHARACTERS: Major international brands with active copyright enforcement       ║
║                                                                                        ║
╚════════════════════════════════════════════════════════════════════════════════════════╝

🔧 RECOMMENDED ACTION PLAN:
═══════════════════════════════════════════════════════════════════════════════════════

1. 📦 BACKUP DATA (CRITICAL - DO THIS FIRST!)
   - Export all subcategories and drawings before making changes
   - Consider archiving instead of deleting for potential future reference

2. 🚫 IMMEDIATE DEACTIVATION
   - Set isActive = false for all 17 subcategories
   - This will hide them from public view immediately
   - Drawings will remain in database but become inaccessible

3. 🗑️ CONTENT REMOVAL (if required by legal)
   - Delete the 590 affected drawings from Sanity
   - Delete the 17 subcategories
   - Clean up any orphaned image assets in Sanity's media library

4. 🔍 MANUAL REVIEW
   - Check if "Svampebobb" (SpongeBob) exists under different naming
   - Review other subcategories for potential copyright issues

5. 📝 DOCUMENTATION
   - Document all removed content for legal compliance
   - Update content guidelines to prevent future copyright violations

💾 BULK OPERATION IDs:
═══════════════════════════════════════════════════════════════

Subcategory IDs to deactivate:
${JSON.stringify(copyrightAnalysisResults.subcategories.map(s => s.id), null, 2)}

⚠️  WARNING: Double-check these IDs before running any bulk operations!

🎯 NEXT STEPS:
═══════════════════════════════════════════════════════════════

1. Review this summary with your legal team
2. Run backup script (create one if needed)
3. Execute deactivation script for immediate hiding
4. Plan permanent removal timeline if required
5. Update content creation guidelines

📧 If you need help creating scripts for any of these operations, let me know!
`);

// Export for potential use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = copyrightAnalysisResults;
}