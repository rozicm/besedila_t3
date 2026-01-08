# Quick Start Guide

## Hitri začetek za nove funkcionalnosti

### 1. Setup Clerk Authentication

1. Pojdite na [clerk.com](https://clerk.com) in ustvarite račun
2. Ustvarite novo aplikacijo
3. Kopirajte API ključe in jih dodajte v `.env`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

### 2. Setup Database

1. Zaženite migracijo:
   ```bash
   npm run db:push
   ```

2. Preverite, ali so tabele ustvarjene:
   ```bash
   npm run db:studio
   ```

### 3. Setup Push Notifications (Opcijsko)

1. Generirajte VAPID ključe:
   ```bash
   npx web-push generate-vapid-keys
   ```

2. Dodajte ključe v `.env`:
   ```
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=BM...
   VAPID_PRIVATE_KEY=...
   ```

3. Service worker je že konfiguriran v `public/service-worker.js`

### 4. Zagon aplikacije

```bash
npm run dev
```

Aplikacija bo dostopna na `http://localhost:3000`

### 5. Prvi koraki

1. **Registracija**: Kliknite "Sign in" in ustvarite račun
2. **Ustvari skupino**: Pojdite na "Groups" → "Nova skupina"
3. **Dodaj pesmi**: Pojdite na "Songs" in dodajte nekaj pesmi
4. **Ustvari nastop**: Pojdite na "Calendar" → "Nov nastop"
5. **Dodaj setlist**: Odprite nastop in dodajte pesmi
6. **Omogoči notifikacije**: Pojdite na "Notifications" in omogočite

### 6. Povabi člane

1. Odprite skupino
2. Kliknite "Povabi člana"
3. Vnesite email naslov
4. Oni bodo prejeli vabilo v aplikaciji (če so že registrirani)

### 7. Testiranje notifikacij

1. Omogočite notifikacije v nastavitvah
2. Dovolite v brskalniku
3. Kliknite "Pošlji testno notifikacijo"
4. Preverite, ali ste prejeli obvestilo

## Common Issues

### Service Worker se ne registrira

- Preverite, ali uporabljate HTTPS ali localhost
- Preverite konzolo za napake
- Resetirajte service worker v DevTools → Application → Service Workers

### Notifikacije ne delujejo

- Preverite, ali so dovoljenja za notifikacije omogočena v brskalniku
- Preverite, ali je service worker registriran
- Preverite, ali so VAPID ključi pravilno nastavljeni
- Preverite, ali brskalnik podpira Web Push API

### Skupine se ne prikazujejo

- Preverite, ali ste član kakšne skupine
- Preverite avtentikacijo (ali ste prijavljeni)
- Preverite konzolo za napake

### Vabila ne delujejo

- Preverite, ali je email pravilen
- Preverite, ali uporabnik obstaja v sistemu
- Preverite, ali imate pravice za vabljenje (Owner ali Admin)

## Production Deployment

### Vercel

1. Push code na GitHub
2. Povežite z Vercel
3. Dodajte environment variables v Vercel dashboard
4. Deploy

Pomembno:
- Nastavite `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Nastavite `CLERK_SECRET_KEY`
- Nastavite `DATABASE_URL` in `DIRECT_URL`
- Opcijsko: `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in `VAPID_PRIVATE_KEY`

### Custom Server

1. Build aplikacijo:
   ```bash
   npm run build
   ```

2. Zaženite:
   ```bash
   npm start
   ```

3. Poskrbite za HTTPS (potrebno za service worker in push notifications)

## Tips & Tricks

### Hitro testiranje

1. Uporabite več brskalnikov za testiranje več uporabnikov
2. Uporabite Incognito mode za ločene seje
3. Testirajte notifikacije z "Test notification" gumbom

### Development

- `npm run dev` - Development server z hot reload
- `npm run db:studio` - Odpre Prisma Studio za pregled baze
- `npm run db:push` - Posodobi bazo brez migracije
- `npm run db:migrate` - Ustvari in zažene migracijo

### Debugging

- Odprite DevTools → Console za JS napake
- Odprite DevTools → Application → Service Workers za service worker status
- Odprite DevTools → Application → Storage → IndexedDB za lokalne podatke
- Preverite Network tab za API requeste

## Podporne strani

- [Clerk Documentation](https://clerk.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

