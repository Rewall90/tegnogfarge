# Oppdatere IP-tilgang i MongoDB Atlas

For å tillate tilkobling fra IP-adressen 209.198.157.210 til MongoDB Atlas, følg disse trinnene:

## Trinn-for-trinn guide

1. **Logg inn på MongoDB Atlas**
   - Gå til [https://cloud.mongodb.com](https://cloud.mongodb.com)
   - Logg inn med brukernavn og passord

2. **Velg ditt prosjekt**
   - Hvis du har flere prosjekter, velg "fargeleggingsapp" eller prosjektet som inneholder databasen din

3. **Gå til Network Access**
   - I sidemenyen, klikk på "Network Access" under "Security"

4. **Legg til IP-adresse**
   - Klikk på "Add IP Address" eller "+ ADD IP ADDRESS"
   - Velg "Add an IP Address"
   - Skriv inn 209.198.157.210 i både "IP Address" og "Optional Comment" feltene
   - Klikk "Confirm"

5. **Verifiser at IP-en er lagt til**
   - Du bør nå se 209.198.157.210 i listen over tillatte IP-adresser
   - Status vil først vise "Pending" og deretter "Active"

## Alternativ for utvikling

For utvikling kan du tillate tilkobling fra alle IP-adresser (bruk dette KUN i utvikling, ikke i produksjon):

1. Følg trinnene 1-3 ovenfor
2. Klikk "Add IP Address"
3. Klikk "ALLOW ACCESS FROM ANYWHERE"
4. Dette vil legge til 0.0.0.0/0 i tilgangslisten
5. Klikk "Confirm"

## Teste tilkoblingen

Etter at du har oppdatert IP-tilgangslisten, kan du teste tilkoblingen:

```bash
node scripts/test-with-ip.js
```

Dette vil vise om tilkoblingen nå fungerer med den nye IP-konfigurasjonen.

## Feilsøking

Hvis du fortsatt opplever problemer etter å ha lagt til IP-adressen:

1. **Sjekk at endringene er aktive** - Endringer i Atlas kan ta noen minutter å tre i kraft
2. **Verifiser nettverkstilkobling** - Sørg for at datamaskinen har internettforbindelse
3. **Sjekk brannmur** - Sørg for at brannmuren ikke blokkerer utgående tilkoblinger til MongoDB Atlas
4. **Dobbelsjekk connection string** - Verifiser at URI-en i .env.local er korrekt 