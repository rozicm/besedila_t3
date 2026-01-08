# Nove funkcionalnosti v Band Manager

## Pregled

Ta dokument opisuje nove funkcionalnosti, ki so bile dodane v aplikacijo Band Manager.

## 1. Multi-Group Support (Večskupinska podpora)

### Funkcionalnosti

- **Upravljanje več skupin**: Uporabniki lahko ustvarijo in so člani več skupin/ansamblov hkrati
- **Vabila**: Lastniki in administratorji lahko povabijo nove člane preko e-pošte
- **Vloge**: 
  - **OWNER** (Lastnik): Ima vse pravice, lahko briše skupino, dodeljuje vloge
  - **ADMIN** (Administrator): Lahko vabi člane, upravlja skupino, dodaja vsebino
  - **MEMBER** (Član): Lahko vidi vsebino skupine

### Uporaba

1. Pojdite na `/groups`
2. Kliknite "Nova skupina"
3. Vnesite ime in opis skupine
4. Povabite člane preko "Povabi člana" gumba
5. Upravljajte člane in njihove vloge v podrobnostih skupine

### API Endpointi (tRPC)

```typescript
// Pridobi vse skupine uporabnika
groups.list.useQuery()

// Pridobi podrobnosti skupine
groups.get.useQuery({ id: groupId })

// Ustvari novo skupino
groups.create.useMutation({
  name: "Moja skupina",
  description: "Opis skupine"
})

// Povabi člana
groups.invite.useMutation({
  groupId: "...",
  email: "user@example.com",
  role: "MEMBER"
})

// Sprejmi vabilo
groups.acceptInvitation.useMutation({ invitationId: "..." })

// Zavrni vabilo
groups.declineInvitation.useMutation({ invitationId: "..." })

// Odstrani člana (samo OWNER/ADMIN)
groups.removeMember.useMutation({
  groupId: "...",
  memberId: "..."
})

// Zapusti skupino
groups.leave.useMutation({ groupId: "..." })
```

## 2. Koledar nastopov

### Funkcionalnosti

- **Vizualni koledar**: Pregled vseh nastopov po dnevih
- **Podrobnosti nastopa**: 
  - Ime nastopa
  - Datum in čas
  - Lokacija
  - Trajanje
  - Opis in opombe
- **Setlist builder**: Vsak nastop ima svoj setlist
- **Drag & drop**: Prerazporejanje pesmi v setlistu
- **Kopiraj setlist**: Kopiraj setlist iz drugega nastopa ali kroga

### Uporaba

1. Pojdite na `/calendar`
2. Kliknite "Nov nastop"
3. Izberite skupino in vnesite podrobnosti
4. Odprite nastop in dodajte pesmi v setlist
5. Prerazporedite pesmi z drag & drop
6. Dodajte opombe za posamezne pesmi (npr. "počasi", "brez 2. kitice")

### API Endpointi (tRPC)

```typescript
// Pridobi nastope za skupino
performances.list.useQuery({
  groupId: "...",
  from: new Date(),
  to: new Date()
})

// Pridobi prihajajoče nastope
performances.upcoming.useQuery({ limit: 10 })

// Pridobi podrobnosti nastopa
performances.get.useQuery({ id: performanceId })

// Ustvari nov nastop
performances.create.useMutation({
  groupId: "...",
  name: "Poročna zabava",
  date: new Date(),
  location: "Kongresni center",
  duration: 180
})

// Dodaj pesem v setlist
performances.addSongToSetlist.useMutation({
  performanceId: "...",
  songId: 123,
  position: 0,
  notes: "počasi"
})

// Odstrani pesem iz setlista
performances.removeSongFromSetlist.useMutation({
  setlistItemId: "..."
})

// Prerazporedi setlist
performances.reorderSetlist.useMutation({
  performanceId: "...",
  items: [
    { id: "item1", position: 0 },
    { id: "item2", position: 1 }
  ]
})

// Kopiraj setlist
performances.copySetlist.useMutation({
  performanceId: "...",
  sourceType: "performance", // ali "round"
  sourceId: "..."
})
```

## 3. Push notifikacije

### Funkcionalnosti

- **Opomniki za nastope**: 
  - 1 dan pred nastopom
  - 1 uro pred nastopom
- **Vabila v skupine**: Obvestilo, ko vas nekdo povabi
- **Web Push API**: Deluje v brskalniku (Chrome, Firefox, Edge, Safari 16+)
- **Service Worker**: Obvestila delujejo tudi, ko aplikacija ni odprta

### Setup

#### 1. Generiraj VAPID ključe (za produkcijo)

```bash
npx web-push generate-vapid-keys
```

Dodaj ključe v `.env`:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

#### 2. Uporabnik omogoči notifikacije

1. Pojdite na `/settings/notifications`
2. Vklopite stikalo za notifikacije
3. Dovolite notifikacije v brskalniku
4. Aplikacija bo registrirala vaš naprava

### Pošiljanje notifikacij (server-side)

Za pošiljanje notifikacij potrebujete `web-push` paket:

```bash
npm install web-push
```

Primer pošiljanja:

```typescript
import webpush from 'web-push';

// Nastavi VAPID ključe
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Pridobi vse naročnike
const subscriptions = await prisma.pushSubscription.findMany({
  where: {
    user: {
      groupMembers: {
        some: { groupId: performance.groupId }
      }
    }
  }
});

// Pošlji notifikacijo
const payload = JSON.stringify({
  title: 'Opomnik za nastop',
  body: `Nastop ${performance.name} čez 1 uro!`,
  url: `/calendar/${performance.id}`,
  tag: `performance-${performance.id}`
});

for (const sub of subscriptions) {
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      },
      payload
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    // Če je subscription invalid, jo zbriši
    if (error.statusCode === 410) {
      await prisma.pushSubscription.delete({ where: { id: sub.id } });
    }
  }
}
```

### API Endpointi (tRPC)

```typescript
// Naroči se na notifikacije
notifications.subscribe.useMutation({
  endpoint: "...",
  p256dh: "...",
  auth: "..."
})

// Odjavi se od notifikacij
notifications.unsubscribe.useMutation({
  endpoint: "..."
})

// Pridobi naročnine uporabnika
notifications.getSubscriptions.useQuery()

// Pridobi čakajoče opomnike
notifications.getPendingReminders.useQuery()

// Označi opomnik kot poslano
notifications.markReminderSent.useMutation({
  reminderId: "..."
})
```

## 4. Implementacijske podrobnosti

### Baza podatkov

Nove tabele:
- `groups`: Skupine/ansambli
- `group_members`: Člani skupin z vlogami
- `group_invitations`: Vabila v skupine
- `group_songs`: Povezave med skupinami in pesmimi
- `performances`: Nastopi
- `performance_setlist_items`: Pesmi v setlistih nastopov
- `performance_reminders`: Opomniki za nastope
- `push_subscriptions`: Push notification subscriptions

### Service Worker

Service worker (`/public/service-worker.js`) je registriran za:
- Prejemanje push notifikacij
- Prikaz native notifikacij
- Odpiranje ustrezne strani ob kliku na notifikacijo

### Permissions

Za notifikacije potrebujete:
- Permission `Notification` v brskalniku
- Registriran Service Worker
- HTTPS (razen za localhost)

## 5. Prihodnje izboljšave

Možne razširitve:
- [ ] Email notifikacije (backup za push)
- [ ] Prilagodljivi opomniki (uporabnik nastavi čas)
- [ ] Notifikacije za spremembe setlista
- [ ] In-app notifikacije
- [ ] Notifikacijske preference po skupinah
- [ ] SMS notifikacije (preko Twilio)
- [ ] Export nastopov v iCal format
- [ ] Integracija z Google Calendar

## 6. Testiranje

### Testiranje notifikacij

1. Odprite aplikacijo v dveh različnih brskalnikih
2. Omogočite notifikacije za oba računa
3. Povabite drugega uporabnika v skupino
4. Preverite, ali je prejel notifikacijo
5. Uporabite "Pošlji testno notifikacijo" gumb v nastavitvah

### Testiranje skupin

1. Ustvarite novo skupino
2. Povabite drugega uporabnika
3. Preverite sprejem vabila
4. Testirajte upravljanje vlog
5. Testirajte odstranjevanje članov

### Testiranje nastopov

1. Ustvarite nastop za prihodnji datum
2. Dodajte pesmi v setlist
3. Prerazporedite pesmi z drag & drop
4. Kopirajte setlist iz drugega nastopa
5. Preverite prikaz v koledarju

## 7. Znane omejitve

- Push notifikacije ne delujejo v iOS Safari < 16.4
- Service Worker potrebuje HTTPS (razen localhost)
- Notifikacije lahko blokira brskalnik ali OS
- VAPID ključi morajo biti varno shranjeni (ne v git)
- Omejitev naročnin na push (odvisno od brskalnika)

## 8. Varnost

- Clerk auth zagotavlja varne seje
- Push subscription podatki so varno shranjeni
- VAPID private key nikoli ne sme biti exposed
- Permissions preverjene na backend
- Validacija vseh vnosov z Zod schemas

