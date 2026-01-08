# Changelog

## [2.0.0] - 2026-01-07

### 🎉 Nove funkcionalnosti

#### Multi-Group Support (Večskupinska podpora)
- ✅ Uporabniki lahko ustvarijo in upravljajo več skupin/ansamblov
- ✅ Sistem vabil za povabilo novih članov preko e-pošte
- ✅ Tri nivoji vlog: Owner, Admin, Member
- ✅ Upravljanje članov (dodajanje, odstranjevanje, spreminjanje vlog)
- ✅ Vsaka skupina ima svoje pesmi in nastope

#### Koledar nastopov
- ✅ Vizualni koledar z vsemi nastopi
- ✅ CRUD operacije za nastope (Create, Read, Update, Delete)
- ✅ Podrobnosti nastopa: datum, čas, lokacija, trajanje, opombe
- ✅ Custom setlist builder za vsak nastop
- ✅ Drag & drop za prerazporejanje pesmi v setlistu
- ✅ Kopiranje setlistov iz drugih nastopov ali krogov
- ✅ Performance-specific opombe za pesmi

#### Push notifikacije
- ✅ Web Push API integracija
- ✅ Service Worker za prejemanje notifikacij
- ✅ Avtomatični opomniki za nastope (1 dan in 1 uro pred)
- ✅ Nastavitve notifikacij v uporabniškem vmesniku
- ✅ Podpora za večino modernih brskalnikov

### 🔧 Tehnične spremembe

#### Baza podatkov
- ✅ Nove tabele: `groups`, `group_members`, `group_invitations`
- ✅ Nove tabele: `performances`, `performance_setlist_items`, `performance_reminders`
- ✅ Nova tabela: `push_subscriptions`
- ✅ Nova tabela: `group_songs` za povezavo med skupinami in pesmimi
- ✅ Migracija: `20260107155208_add_groups_performances_notifications`

#### API (tRPC)
- ✅ Nov router: `groups` z 12 endpointi
- ✅ Nov router: `performances` z 11 endpointi
- ✅ Nov router: `notifications` z 5 endpointi
- ✅ Vsi endpointi z validacijo (Zod schemas)
- ✅ Permission checking na backend

#### Frontend
- ✅ Nova stran: `/groups` - pregled skupin
- ✅ Nova stran: `/groups/[id]` - podrobnosti skupine
- ✅ Nova stran: `/calendar` - koledar nastopov
- ✅ Nova stran: `/calendar/[id]` - podrobnosti nastopa in setlist
- ✅ Nova stran: `/settings/notifications` - nastavitve notifikacij
- ✅ Posodobljena navigacija z novimi linki
- ✅ Posodobljena homepage z novimi kartami

#### Utilities
- ✅ `push-notifications.ts` - utility funkcije za Web Push API
- ✅ `service-worker.js` - service worker za notifikacije
- ✅ Registracija service workerja ob zagonu aplikacije

### 📚 Dokumentacija
- ✅ Posodobljen `README.md` z novimi funkcionalnostmi
- ✅ Nov dokument: `docs/NEW_FEATURES.md` - podrobna dokumentacija novih funkcij
- ✅ Nov dokument: `docs/QUICK_START.md` - hiter začetek za uporabnike
- ✅ Nov dokument: `CHANGELOG.md` - zgodovina sprememb

### 🐛 Popravki
- ✅ Popravljeno opozorilo za `<img>` tag (uporabljen background-image)
- ✅ Ni linter napak

### 📦 Odvisnosti
Vse potrebne odvisnosti so že vključene:
- `@clerk/nextjs` - avtentikacija
- `@dnd-kit/core` - drag & drop
- `@dnd-kit/sortable` - sortable lists
- `@prisma/client` - ORM

### ⚠️ Breaking Changes
Ni breaking changes - vse obstoječe funkcionalnosti delujejo kot prej.

### 🔜 Prihodnje izboljšave
- [ ] Email notifikacije (backup za push)
- [ ] Prilagodljivi opomniki
- [ ] Notifikacije za spremembe setlista
- [ ] SMS notifikacije
- [ ] Export v iCal format
- [ ] Integracija z Google Calendar
- [ ] Mobile app (React Native)

---

## [1.0.0] - Začetna verzija

### Funkcionalnosti
- ✅ Upravljanje pesmi (CRUD)
- ✅ Krogi/setlisti
- ✅ Performance mode
- ✅ PDF export
- ✅ Dark/Light theme
- ✅ NextAuth avtentikacija

### Tehnologije
- Next.js 14
- TypeScript
- Prisma + PostgreSQL
- tRPC
- Tailwind CSS

