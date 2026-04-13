# Workflow Fitur Kolom Iklan

## 📋 Overview
Fitur kolom iklan akan ditambahkan ke semua halaman dashboard member (Client, Architect, Structure, MEP, QS, Drafter, dan Arsitek Berlisensi). Kolom ini terletak di sisi kanan halaman dan menampilkan kategori iklan produk konstruksi.

## 🎯 Tujuan
1. Menampilkan iklan produk terkait konstruksi di dashboard member
2. Mengarahkan user ke halaman katalog produk sesuai kategori
3. Mengelola iklan melalui dashboard marketing (CRUD - Create, Read, Update, Delete)

---

## 🏗️ Arsitektur Fitur

### 1. Kategori Iklan
Kategori iklan yang akan ditampilkan (9 kategori):

1. **Material Struktural (Rangka Bangunan)**
   - Beton, baja/besi beton, kayu, batu, dan batu bata yang berfungsi menahan beban

2. **Material Penutup & Dinding**
   - Batu bata, batako, hebel (bata ringan), dan panel semen

3. **Material Atap & Plafon**
   - Genteng (tanah liat, beton), metal sheet, asbes, triplek, dan gypsum

4. **Material Finishing (Interior & Eksterior)**
   - Keramik, granit, lantai kayu (parket), cat, wallpaper, dan panel dinding

5. **Material Transparan/Kaca**
   - Kaca polos, kaca tempered, dan jendela aluminium

6. **Material Alternatif & Alami**
   - Tanah yang dipadatkan (rammed earth), bambu, dan material daur ulang

7. **Material Mekanikal, Elektrikal, & Plumbing (MEP)**
   - Pipa PVC, kabel, dan bahan isolasi

8. **Material Sanitary**
   - Peralatan dan perlengkapan kamar mandi

9. **Material Landscape (Hardscape, Softscape, Lighting)**
   - Paving, kanstin, pattern concrete, jalur difabel, tanam semak, pohon, rumput, lampu penerangan

### 2. Komponen Utama

#### A. Frontend - Member Dashboards
**Lokasi File:**
- `src/app/member/client/page.tsx`
- `src/app/member/architect/page.tsx`
- `src/app/member/structure/page.tsx`
- `src/app/member/mep/page.tsx`
- `src/app/member/qs/page.tsx`
- `src/app/member/drafter/page.tsx`
- `src/app/member/licensed-architect/page.tsx`

**Komponen:**
- `AdColumn` - Komponen kolom iklan di sisi kanan
- `AdCategoryBox` - Kotak kategori iklan (klik + hover effect)
- Tampilan responsive (hidden pada mobile, visible pada desktop)

#### B. Frontend - Halaman Katalog Iklan
**Lokasi File:**
- `src/app/ads/[category]/page.tsx` - Halaman katalog berdasarkan kategori
- `src/app/ads/page.tsx` - Halaman semua iklan (opsional)

**Fitur:**
- Menampilkan daftar iklan per kategori
- Tampilan grid/card untuk setiap produk
- Detail produk dalam modal atau halaman terpisah
- Filter dan search (opsional)

#### C. Frontend - Marketing Dashboard
**Lokasi File:**
- `src/app/admin/marketing/page.tsx` (mungkin perlu tab baru atau modifikasi)

**Fitur:**
- List semua iklan yang ada
- Tambah iklan baru (Create)
- Edit iklan (Update)
- Hapus iklan (Delete)
- Filter berdasarkan kategori
- Toggle status aktif/nonaktif

#### D. Backend - API Routes
**Lokasi File:**
- `src/app/api/ads/route.ts` - GET (list), POST (create)
- `src/app/api/ads/[id]/route.ts` - GET (detail), PUT (update), DELETE (delete)
- `src/app/api/ads/category/[category]/route.ts` - GET (by category)

#### E. Database - Prisma Schema
**Lokasi File:**
- `prisma/schema.prisma`

**Model yang dibutuhkan:**
```prisma
model Ad {
  id          String   @id @default(cuid())
  title       String
  description String
  category    String   // 'struktural', 'penutup-dinding', 'atap-plafon', 'finishing', 'transparan-kaca', 'alternatif-alami', 'mep', 'sanitary', 'landscape'
  imageUrl    String?
  catalogUrl  String?
  price       String?
  contact     String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 🔄 Alur Penggunaan

### Alur 1: Member Melihat Iklan
```
1. Member login ke dashboard
2. Kolom iklan muncul di sisi kanan
3. Member melihat 9 kotak kategori iklan
4. Member klik salah satu kategori (misal: "Lantai")
5. Diarahkan ke halaman /ads/[kategori]
6. Melihat katalog produk sesuai kategori yang tersedia
7. Klik produk untuk melihat detail
```

### Alur 2: Marketing Menambah Iklan
```
1. Marketing login ke dashboard
2. Buka menu "Iklan" di Marketing Dashboard
3. Klik tombol "Tambah Iklan"
4. Isi form:
   - Judul iklan
   - Deskripsi
   - Kategori (dropdown)
   - URL gambar (opsional)
   - URL katalog (opsional)
   - Harga (opsional)
   - Kontak (opsional)
5. Klik "Simpan"
6. Iklan muncul di list
7. Iklan otomatis tampil di kolom iklan member dashboard
```

### Alur 3: Marketing Mengedit Iklan
```
1. Marketing login ke dashboard
2. Buka menu "Iklan" di Marketing Dashboard
3. Cari iklan yang ingin diedit
4. Klik tombol "Edit"
5. Ubah data yang diinginkan
6. Klik "Update"
7. Perubahan langsung terlihat di dashboard member
```

### Alur 4: Marketing Menghapus Iklan
```
1. Marketing login ke dashboard
2. Buka menu "Iklan" di Marketing Dashboard
3. Cari iklan yang ingin dihapus
4. Klik tombol "Hapus"
5. Konfirmasi penghapusan
6. Iklan dihapus dari database
7. Iklan hilang dari dashboard member
```

---

## 📋 Konfigurasi Kategori

### Data Structure untuk Kategori

```typescript
// src/lib/ad-categories.ts
export interface AdCategory {
  id: string
  name: string
  subtitle: string
  description: string
  icon: string  // Lucide icon name
  slug: string  // Untuk URL routing
}

export const AD_CATEGORIES: AdCategory[] = [
  {
    id: 'struktural',
    name: 'Material Struktural',
    subtitle: 'Rangka Bangunan',
    description: 'Beton, Baja, Kayu, Batu, Batu Bata',
    icon: 'Building2',
    slug: 'struktural'
  },
  {
    id: 'penutup-dinding',
    name: 'Material Penutup & Dinding',
    subtitle: 'Dinding & Penutup',
    description: 'Batu Bata, Batako, Hebel, Panel Semen',
    icon: 'Wall',
    slug: 'penutup-dinding'
  },
  {
    id: 'atap-plafon',
    name: 'Material Atap & Plafon',
    subtitle: 'Atap & Plafon',
    description: 'Genteng, Metal Sheet, Asbes, Triplek, Gypsum',
    icon: 'Home',
    slug: 'atap-plafon'
  },
  {
    id: 'finishing',
    name: 'Material Finishing',
    subtitle: 'Interior & Eksterior',
    description: 'Keramik, Granit, Parket, Cat, Wallpaper, Panel Dinding',
    icon: 'Palette',
    slug: 'finishing'
  },
  {
    id: 'transparan-kaca',
    name: 'Material Transparan/Kaca',
    subtitle: 'Kaca & Jendela',
    description: 'Kaca Polos, Kaca Tempered, Jendela Aluminium',
    icon: 'Square',
    slug: 'transparan-kaca'
  },
  {
    id: 'alternatif-alami',
    name: 'Material Alternatif & Alami',
    subtitle: 'Eco-Friendly',
    description: 'Rammed Earth, Bambu, Material Daur Ulang',
    icon: 'Leaf',
    slug: 'alternatif-alami'
  },
  {
    id: 'mep',
    name: 'Material MEP',
    subtitle: 'Mekanikal, Elektrikal, Plumbing',
    description: 'Pipa PVC, Kabel, Bahan Isolasi',
    icon: 'Zap',
    slug: 'mep'
  },
  {
    id: 'sanitary',
    name: 'Material Sanitary',
    subtitle: 'Kamar Mandi',
    description: 'Peralatan & Perlengkapan Kamar Mandi',
    icon: 'Droplet',
    slug: 'sanitary'
  },
  {
    id: 'landscape',
    name: 'Material Landscape',
    subtitle: 'Hardscape, Softscape, Lighting',
    description: 'Paving, Kanstin, Tanaman, Lampu Penerangan',
    icon: 'TreePine',
    slug: 'landscape'
  }
]

// Helper function untuk mendapatkan kategori by slug
export const getCategoryBySlug = (slug: string): AdCategory | undefined => {
  return AD_CATEGORIES.find(cat => cat.slug === slug)
}

// Helper function untuk mendapatkan kategori by id
export const getCategoryById = (id: string): AdCategory | undefined => {
  return AD_CATEGORIES.find(cat => cat.id === id)
}
```

### Category Values untuk Database

**Enum Category Values:**
```prisma
// Digunakan untuk validasi di database
enum Category {
  STRUKTURAL
  PENUTUP_DINDING
  ATAP_PLAFON
  FINISHING
  TRANSPARAN_KACA
  ALTERNATIF_ALAMI
  MEP
  SANITARY
  LANDSCAPE
}
```

**String Values untuk API:**
```typescript
export const CATEGORY_VALUES = [
  'struktural',
  'penutup-dinding',
  'atap-plafon',
  'finishing',
  'transparan-kaca',
  'alternatif-alami',
  'mep',
  'sanitary',
  'landscape'
] as const

export type CategoryValue = typeof CATEGORY_VALUES[number]
```

---

## 📝 Detail Implementasi

### Tahap 1: Database Setup
1. Tambah model `Ad` ke `prisma/schema.prisma`
2. Jalankan `bun run db:push` untuk migrasi database
3. Buat file `src/lib/db.ts` (jika belum ada) untuk Prisma Client

### Tahap 2: Backend API Routes
1. Buat `src/app/api/ads/route.ts`
   - GET: Mengambil semua iklan (dengan filter aktif)
   - POST: Menambah iklan baru (hanya admin/marketing)
2. Buat `src/app/api/ads/[id]/route.ts`
   - GET: Mengambil detail iklan
   - PUT: Update iklan (hanya admin/marketing)
   - DELETE: Hapus iklan (hanya admin/marketing)
3. Buat `src/app/api/ads/category/[category]/route.ts`
   - GET: Mengambil iklan berdasarkan kategori

### Tahap 3: Frontend - Komponen Kolom Iklan
1. Buat `src/components/ads/AdColumn.tsx`
   - Layout kolom di sisi kanan
   - List 9 kategori
   - Styling dengan shadcn/ui Card component
2. Buat `src/components/ads/AdCategoryBox.tsx`
   - Kotak kategori dengan hover effect
   - Link ke halaman kategori

### Tahap 4: Frontend - Integrasi ke Member Dashboards
1. Update layout masing-masing dashboard member:
   - Client: `src/app/member/client/page.tsx`
   - Architect: `src/app/member/architect/page.tsx`
   - Structure: `src/app/member/structure/page.tsx`
   - MEP: `src/app/member/mep/page.tsx`
   - QS: `src/app/member/qs/page.tsx`
   - Drafter: `src/app/member/drafter/page.tsx`
   - Licensed Architect: `src/app/member/licensed-architect/page.tsx`
2. Tambah layout 2 kolom:
   - Kolom kiri: konten dashboard yang sudah ada
   - Kolom kanan: AdColumn component

### Tahap 5: Frontend - Halaman Katalog
1. Buat `src/app/ads/[category]/page.tsx`
   - Fetch iklan berdasarkan kategori
   - Display grid of ad cards
   - Search dan filter (opsional)
2. Buat `src/components/ads/AdCard.tsx`
   - Card component untuk menampilkan iklan
   - Image, title, description, price, contact

### Tahap 6: Frontend - Marketing Dashboard
1. Update `src/app/admin/marketing/page.tsx`
   - Tambah tab "Manajemen Iklan"
   - Table untuk list iklan
   - Form untuk tambah/edit iklan
   - Tombol delete dengan konfirmasi
2. Buat `src/components/admin/AdForm.tsx`
   - Form dengan validasi
   - Dropdown kategori
   - Input untuk semua field Ad model

---

## 🎨 UI/UX Guidelines

### Kolom Iklan (AdColumn)
- **Position**: Fixed di sisi kanan (desktop), hidden di mobile
- **Width**: ~280-320px (lebar sedikit lebih besar untuk 9 kategori)
- **Spacing**: padding-4, gap-3
- **Background**: bg-muted/50
- **Styling**: Card component dari shadcn/ui
- **Hover Effect**: bg-muted hover:bg-muted/80 transition
- **Scrollable**: max-h-screen dengan overflow-y-auto jika konten terlalu panjang

### Penataan Tulisan di Kolom Iklan

**Layout Structure:**
```
┌─────────────────────────────────┐
│     IKLAN PRODUK KONSTRUKSI     │  ← Header (text-center, font-bold)
├─────────────────────────────────┤
│                                 │
│  🏗️  MATERIAL STRUKTURAL         │  ← Icon + Judul (font-semibold)
│     Rangka Bangunan              │  ← Subtitle (text-xs, muted)
│     Beton, Baja, Kayu...         │  ← Description (text-xs, muted)
│                                 │
├─────────────────────────────────┤
│                                 │
│  🧱  MATERIAL PENUTUP & DINDING  │  ← Card dengan border-bottom
│     Batu Bata, Batako, Hebel     │
│                                 │
├─────────────────────────────────┤
│                                 │
│  🏠  MATERIAL ATAP & PLAFON      │
│     Genteng, Metal, Gypsum      │
│                                 │
├─────────────────────────────────┤
│                                 │
│  🎨  MATERIAL FINISHING          │
│     Interior & Eksterior        │
│     Keramik, Granit, Parket     │
│                                 │
├─────────────────────────────────┤
│                                 │
│  🪟  MATERIAL TRANSPARAN/KACA    │
│     Kaca Polos, Tempered        │
│     Jendela Aluminium           │
│                                 │
├─────────────────────────────────┤
│                                 │
│  🌿  MATERIAL ALTERNATIF & ALAMI│
│     Rammed Earth, Bambu         │
│     Material Daur Ulang         │
│                                 │
├─────────────────────────────────┤
│                                 │
│  ⚡  MATERIAL MEP                │
│     Mekanikal, Elektrikal,      │
│     Plumbing                    │
│     Pipa, Kabel, Isolasi        │
│                                 │
├─────────────────────────────────┤
│                                 │
│  🚿  MATERIAL SANITARY           │
│     Perlengkapan Kamar Mandi    │
│                                 │
├─────────────────────────────────┤
│                                 │
│  🌳  MATERIAL LANDSCAPE          │
│     Hardscape, Softscape,       │
│     Lighting                    │
│     Paving, Tanaman, Lampu      │
│                                 │
└─────────────────────────────────┘
```

**Typography Rules:**
- **Header**: `text-sm font-bold text-center uppercase tracking-wide`
- **Kategori Title**: `text-sm font-semibold text-primary`
- **Subtitle**: `text-xs text-muted-foreground italic`
- **Description**: `text-xs text-muted-foreground`
- **Icons**: Menggunakan Lucide icons dengan `w-4 h-4`

**Spacing & Padding:**
- Card kategori: `p-3` (padding kompak)
- Gap antar elemen: `gap-1`
- Margin antar kategori: `mb-3`

**Color Scheme:**
- Background: `bg-card hover:bg-accent/50`
- Border: `border border-border hover:border-primary/30`
- Text primary: `text-foreground`
- Text muted: `text-muted-foreground`

**Interactive States:**
- Normal: `cursor-pointer transition-all duration-200`
- Hover: `hover:shadow-md hover:scale-[1.02] hover:bg-accent/50`
- Active: `active:scale-[0.98]`

**Responsive Behavior:**
- Desktop (lg+): Visible di sidebar kanan dengan fixed position
- Tablet (md): Visible tapi tidak fixed, scroll dengan konten
- Mobile (sm): Hidden, bisa diakses melalui menu dropdown atau bottom sheet

### Kotak Kategori (AdCategoryBox)
- **Layout**: Card dengan p-3 (padding kompak)
- **Icon**: Lucide icon di kiri dengan size w-4 h-4
- **Typography**: 
  - Title: text-sm font-semibold
  - Subtitle: text-xs italic text-muted-foreground
  - Description: text-xs text-muted-foreground (truncated jika panjang)
- **Color**: text-primary untuk title, text-muted-foreground untuk subtitle/description
- **Cursor**: pointer
- **Hover**: hover:shadow-md hover:scale-[1.02] hover:bg-accent/50 transition-all
- **Border**: border border-border hover:border-primary/30
- **Icon Mapping**:
  - Struktural: `Building2`
  - Penutup & Dinding: `Wall`
  - Atap & Plafon: `Home`
  - Finishing: `Palette`
  - Transparan/Kaca: `Square`
  - Alternatif & Alami: `Leaf`
  - MEP: `Zap`
  - Sanitary: `Droplet`
  - Landscape: `TreePine`

### Halaman Katalog
- **Layout**: Grid responsif (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- **Card**: shadcn/ui Card dengan image, title, description
- **Empty State**: Pesan jika tidak ada iklan di kategori
- **Loading**: Skeleton loader saat fetching data

### Marketing Dashboard
- **Table**: shadcn/ui Table
- **Columns**: Image, Title, Category, Status, Actions
- **Form**: shadcn/ui Form dengan validation
- **Dialog**: shadcn/ui Dialog untuk tambah/edit
- **Delete Confirmation**: shadcn/ui AlertDialog

---

## 🔐 Security & Authorization

### API Routes Protection
- `GET /api/ads` - Public (semua user bisa lihat)
- `GET /api/ads/category/[category]` - Public
- `POST /api/ads` - Hanya admin/marketing
- `PUT /api/ads/[id]` - Hanya admin/marketing
- `DELETE /api/ads/[id]` - Hanya admin/marketing

### Session Validation
Gunakan `getServerSession(authOptions)` untuk cek role:
```typescript
const session = await getServerSession(authOptions)
if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MARKETING')) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│  Member Login   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Member Dashboard│────▶│  AdColumn       │
│  (Client/Arch/  │     │  Component      │
│   Struct/...)   │     └────────┬────────┘
└─────────────────┘              │
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Klik Kategori       │
                    │  (Struktural/Atap/...) |
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  /ads/[category]      │
                    │  Halaman Katalog      │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
          ┌─────────────────┐     ┌─────────────────┐
          │  AdCard Detail  │     │  Kembali ke     │
          │  (Image/Desc/)  │     │  Dashboard      │
          └─────────────────┘     └─────────────────┘

┌─────────────────┐
│ Marketing Login │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Marketing       │────▶│  Tab Iklan      │
│  Dashboard      │     │  (Manajemen)    │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
            ┌───────────┐ ┌───────────┐ ┌───────────┐
            │   Create  │ │   Update  │ │  Delete   │
            │  (Form)   │ │  (Form)   │ │  (Alert)  │
            └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
                  │             │             │
                  └─────────────┴─────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Update Database      │
                    │  (Ad Model)           │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
          ┌─────────────────┐     ┌─────────────────┐
          │  Iklan Baru/    │     │  Iklan Terupdate│
          │  Terhapus       │     │  Langsung Tampil│
          │                 │     │  di Member      │
          └─────────────────┘     └─────────────────┘
```

---

## ✅ Checklist Implementasi

### Database
- [ ] Tambah model `Ad` ke Prisma schema
- [ ] Jalankan `bun run db:push`
- [ ] Verifikasi tabel `Ad` terbuat

### Backend API
- [ ] Buat `GET /api/ads` - list all ads
- [ ] Buat `POST /api/ads` - create ad (admin/marketing only)
- [ ] Buat `GET /api/ads/[id]` - get ad detail
- [ ] Buat `PUT /api/ads/[id]` - update ad (admin/marketing only)
- [ ] Buat `DELETE /api/ads/[id]` - delete ad (admin/marketing only)
- [ ] Buat `GET /api/ads/category/[category]` - get ads by category
- [ ] Test semua API routes

### Frontend Components
- [ ] Buat `AdColumn.tsx` component
- [ ] Buat `AdCategoryBox.tsx` component
- [ ] Buat `AdCard.tsx` component
- [ ] Buat `AdForm.tsx` component
- [ ] Styling sesuai shadcn/ui guidelines

### Frontend Pages
- [ ] Buat `src/app/ads/[category]/page.tsx`
- [ ] Update `src/app/member/client/page.tsx`
- [ ] Update `src/app/member/architect/page.tsx`
- [ ] Update `src/app/member/structure/page.tsx`
- [ ] Update `src/app/member/mep/page.tsx`
- [ ] Update `src/app/member/qs/page.tsx`
- [ ] Update `src/app/member/drafter/page.tsx`
- [ ] Update `src/app/member/licensed-architect/page.tsx`
- [ ] Update `src/app/admin/marketing/page.tsx`

### Testing
- [ ] Test: Member melihat kolom iklan di semua dashboard
- [ ] Test: Klik kategori → diarahkan ke halaman katalog
- [ ] Test: Marketing menambah iklan baru
- [ ] Test: Marketing mengedit iklan
- [ ] Test: Marketing menghapus iklan
- [ ] Test: Iklan non-aktif tidak tampil di member
- [ ] Test: Responsive design (mobile vs desktop)
- [ ] Test: Unauthorized access ke API yang butuh auth

### Documentation
- [ ] Update README.md dengan fitur baru
- [ ] Add comments di code untuk clarity

---

## 🚀 Next Steps

Setelah workflow ini disetujui, implementasi akan dilakukan dengan urutan:
1. **Database Schema** - Setup Prisma model
2. **Backend API** - Buat semua API routes
3. **Core Components** - AdColumn, AdCard, AdForm
4. **Member Dashboards Integration** - Tambah kolom iklan
5. **Catalog Pages** - Halaman katalog per kategori
6. **Marketing Dashboard Integration** - Manajemen iklan
7. **Testing & Refinement** - Uji coba dan perbaikan

---

**Catatan:**
- Semua perubahan akan menggunakan Next.js 16, TypeScript, dan shadcn/ui
- API routes akan menggunakan `getServerSession(authOptions)` untuk auth
- Responsive design dengan mobile-first approach
- Sticky footer akan tetap dijaga di semua halaman
