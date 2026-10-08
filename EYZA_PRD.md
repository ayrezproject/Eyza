# PRD — EYZA
## Electronic Yielding Zone Assistant

**Product:** EYZA  
**Akronim:** Electronic Yielding Zone Assistant  
**Platform:** Web  
**Status:** MVP  
**Version:** 1.1  
**Last Updated:** 2026-10-09  
**Primary Stack:** React/Next.js, TypeScript, Vercel, GitHub, GitHub Actions  
**AI:** LLM API dengan tool/function calling  

---

## 1. Visi Produk

EYZA adalah AI Coding Agent berbasis web yang membantu pengguna membuat, mengembangkan, menguji, memperbaiki, dan melakukan deployment aplikasi melalui instruksi bahasa natural.

Tujuan utama EYZA bukan sekadar memberikan potongan kode di chat, tetapi mampu mengerjakan project secara terstruktur melalui workspace GitHub dan pipeline build/test/deployment.

Contoh:

> "Buatkan aplikasi kasir sederhana menggunakan React."

EYZA menganalisis kebutuhan, membuat rencana, menghasilkan dan mengubah source code, menjalankan build/test, memperbaiki error, lalu melakukan deployment jika diizinkan.

## 2. Tujuan MVP

MVP harus mampu menjalankan siklus dasar:

```text
User
↓
EYZA Chat
↓
Plan
↓
Generate / Modify Code
↓
GitHub
↓
Build / Test
↓
Analyze Error
↓
Auto Fix
↓
Deploy
↓
Result
```

Prioritas utama:
1. Stabil.
2. Aman.
3. Mudah digunakan.
4. Bisa menyelesaikan project kecil sampai menengah.
5. Arsitektur mudah dikembangkan.

## 3. Target Pengguna

### Primary
- Developer pemula.
- Developer independen.
- Pembuat aplikasi dengan bantuan AI.
- Pengguna yang ingin membuat prototype tanpa menulis seluruh kode manual.

### Secondary
- Developer berpengalaman yang ingin mengotomatisasi pekerjaan repetitif.
- Tim kecil yang membutuhkan coding assistant.

## 4. Value Proposition

EYZA memungkinkan pengguna memberikan instruksi seperti manusia kepada agent dan mendapatkan project yang benar-benar dikerjakan.

Contoh:

> "Buatkan aplikasi inventory menggunakan React dengan dashboard, produk, kategori, dan stok."

EYZA harus dapat:
- memahami permintaan;
- membuat plan;
- membuat file;
- mengubah file;
- melakukan commit;
- menjalankan build/test;
- membaca error;
- memperbaiki error;
- melakukan deployment.

## 5. Arsitektur Produk

```text
                         USER
                           │
                           ▼
                 ┌──────────────────┐
                 │    EYZA WEB      │
                 │     Vercel       │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │    EYZA AGENT    │
                 │                  │
                 │ Orchestrator     │
                 │ Planner          │
                 │ Coder            │
                 │ Reviewer         │
                 │ Debugger         │
                 └────────┬─────────┘
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
          GitHub       Database       AI API
             │
             ▼
      GitHub Actions
             │
       ┌─────┴─────┐
       ▼           ▼
     Build        Test
       │           │
       └─────┬─────┘
             ▼
        Error/Result
             │
             ▼
       EYZA Debugger
             │
             ▼
          GitHub
             │
             ▼
          Vercel
             │
             ▼
       LIVE APPLICATION
```

## 6. Teknologi

### Frontend
- React / Next.js
- TypeScript
- Tailwind CSS
- Responsive design

### Hosting
- Vercel Free untuk MVP

### Source Control
- GitHub

### Execution
- GitHub Actions
- **Constraint:** Vercel Free tier private repo = 2.000 menit/bulan. Gunakan public repo untuk MVP atau monitor usage.
- **Latency:** cold start Actions ~45–90 detik — tampilkan loading state di UI.

### Database
- PostgreSQL-compatible serverless database dengan free tier
- Rekomendasi: Neon / Supabase / PlanetScale

### AI
- LLM API yang mendukung tool/function calling
- Provider **wajib** dibungkus oleh **AI Provider Abstraction Layer** agar dapat diganti tanpa mengubah logika agent.
- Pilihan awal: Google Gemini Flash (cost-efficient) atau OpenAI GPT-4o-mini.
- **Token budget per task:** default 100.000 token input + 10.000 token output.
- **Cost tracking wajib** diimplementasikan sejak awal.

### Monorepo Build Tool
- **Turborepo** untuk task caching dan build orchestration di monorepo.

### Authentication
- GitHub OAuth

## 7. Fitur MVP

### 7.1 Authentication
- Login.
- Logout.
- Session management.
- GitHub connection.

### 7.2 Dashboard
Menampilkan:
- jumlah project;
- project terbaru;
- task aktif;
- build;
- deployment;
- status agent.

### 7.3 AI Chat
User dapat berkomunikasi dengan EYZA menggunakan bahasa natural.

EYZA menampilkan:
- response;
- plan;
- progress;
- file yang diubah;
- build status;
- error;
- deployment status.

### 7.4 Project Management
User dapat:
- membuat project;
- memilih framework;
- menghubungkan repository;
- memilih branch;
- melihat status project.

Framework awal:
- React
- Next.js
- Node.js

### 7.5 Workspace
Workspace menampilkan:
- file tree;
- source code;
- chat;
- tasks;
- builds;
- tests;
- commits;
- deployments.

### 7.6 AI Planner
EYZA membuat rencana sebelum mengerjakan task besar.

Contoh:

```text
Task: Buat aplikasi POS

✓ Analisis kebutuhan
□ Buat struktur project
□ Buat database schema
□ Buat halaman kasir
□ Buat product management
□ Buat cart
□ Buat checkout
□ Testing
□ Build
□ Deploy
```

### 7.7 Coding Tools

Read:
- list_files
- read_file
- search_code

Write:
- create_file
- update_file
- delete_file

Git:
- git_status
- git_diff
- git_commit
- git_push

Build:
- install_dependencies
- build_project
- run_tests

Deployment:
- deploy
- get_deployment_status
- get_deployment_url

## 8. GitHub Integration

EYZA harus dapat:
- membuat repository;
- membaca repository;
- membuat branch;
- membaca file;
- mengubah file;
- commit;
- push;
- membaca workflow;
- membaca hasil workflow;
- membuat pull request pada tahap lanjutan.

Gunakan permission seminimal mungkin.

## 9. GitHub Actions

GitHub Actions digunakan sebagai execution engine MVP.

Pipeline dasar:

```text
Push
↓
npm install
↓
Lint
↓
Test
↓
Build
↓
Result
```

Jika gagal, hasil error dikirim kembali ke EYZA.

## 10. Self-Healing

EYZA harus dapat:

```text
Build Failed
↓
Read Error Log
↓
Classify Error (syntax / dependency / logic / env)
↓
Check Fix History (apakah fix ini sudah pernah dicoba?)
↓
Generate Fix (berbeda dari fix sebelumnya)
↓
Modify Code
↓
Commit
↓
Build Again
↓
[jika gagal lagi] → repeat dengan context akumulatif
[jika retry habis] → Failure Report ke user
```

### Batasan Retry

- **Maksimal 3 percobaan per task** untuk MVP.
- Setiap percobaan dicatat di `fix_history` beserta error dan hasil perbaikannya.
- Debugger **wajib membaca fix_history** sebelum menghasilkan fix baru agar tidak mengulangi solusi yang sama.

### Klasifikasi Error

| Tipe | Contoh | Strategi Fix |
|---|---|---|
| `syntax` | SyntaxError, unexpected token | Patch file terkait |
| `dependency` | Module not found, missing package | install atau buat file |
| `type` | TypeScript type error | Fix type annotation |
| `logic` | Test assertion failure | Analisis logika, revisi implementasi |
| `env` | Missing env variable | Lapor ke user, tidak auto-fix |
| `unknown` | Error tidak dikenali | Lapor ke user |

### Escalation Path

Jika semua retry habis:
1. Agent berhenti — tidak boleh retry tanpa persetujuan user.
2. EYZA menampilkan **Failure Report** yang mencakup:
   - Daftar error yang ditemukan.
   - Daftar fix yang sudah dicoba.
   - File yang terlibat.
   - Rekomendasi manual langkah selanjutnya.
3. User dapat memilih: **coba lagi** atau **batalkan task**.

## 11. Deployment

Setelah build berhasil:

```text
Build Success
↓
Deployment
↓
Vercel
↓
Preview URL / Production URL
```

Production deployment membutuhkan konfirmasi user pada MVP.

## 12. Permission & Security

Karena EYZA memiliki akses terhadap source code dan GitHub:
- gunakan OAuth;
- gunakan scoped token;
- simpan secret secara terenkripsi;
- jangan masukkan API key ke prompt;
- jangan expose secret ke model;
- batasi repository yang dapat diakses;
- log setiap tindakan agent.

Permission:

```text
Read       → otomatis
Write      → otomatis
Commit     → otomatis
Push       → otomatis / configurable
Production Deploy → konfirmasi
```

## 13. Activity Log

Contoh:

```text
18:42 Reading package.json
18:43 Creating Dashboard.jsx
18:43 Updating App.jsx
18:44 Commit created
18:44 GitHub Action started
18:45 Build failed
18:45 EYZA analyzing error
18:46 Fix applied
18:47 Build successful
18:48 Deployment started
18:49 Deployment successful
```

## 14. Agent Architecture

Jangan menggunakan satu agent untuk seluruh pekerjaan.

```text
                 ORCHESTRATOR
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       PLANNER       CODER       REVIEWER
          │            │            │
          └────────────┼────────────┘
                       ▼
                    DEBUGGER
```

### Orchestrator
Mengatur seluruh workflow. Bertanggung jawab atas:
- Menerima instruksi dari user.
- Menginisiasi state machine task.
- Mendelegasikan ke agent yang tepat sesuai state.
- Memastikan task tidak melampaui batas token/waktu.

### Planner
Memecah requirement menjadi task terstruktur. Output: daftar langkah terurut dengan estimasi file yang akan diubah.  
Planner **wajib menampilkan plan ke user** dan meminta konfirmasi sebelum Coder mulai bekerja.

### Coder
Menghasilkan dan mengubah kode berdasarkan plan dari Planner.
- Hanya boleh bekerja setelah plan disetujui user.
- Wajib membuat perubahan minimal (tidak mengubah file yang tidak relevan).
- Maks. modifikasi: **20 file per task** untuk MVP.

### Reviewer
Memeriksa kualitas dan konsistensi **sebelum** commit.

**Checklist Reviewer:**
- [ ] Tidak ada API key / secret dalam kode.
- [ ] TypeScript tidak ada error (`tsc --noEmit`).
- [ ] Tidak ada `console.log` yang tidak perlu.
- [ ] Tidak ada shell command yang tidak terduga.
- [ ] Perubahan konsisten dengan plan yang disetujui user.
- [ ] Import/export tidak broken.

Jika review **gagal**, Reviewer mengirim feedback ke Coder untuk diperbaiki.  
Maks. **2 iterasi Coder–Reviewer** sebelum eskalasi ke user.

### Debugger
Menganalisis build/test error dan membuat perbaikan.
- Wajib membaca `fix_history` sebelum membuat fix baru.
- Mengklasifikasikan error sebelum mencoba memperbaiki.
- Tidak boleh mengubah file di luar scope yang diidentifikasi.

### Safeguards Lintas Agent

- **Task timeout:** maksimal 30 menit per task.
- **File modification limit:** maksimal 20 file per task.
- **Token budget:** default 100.000 token input per task.
- **Circuit breaker:** jika GitHub API atau LLM API error 3x berturut-turut, task → `PAUSED` dan user dinotifikasi.

## 15. UX

Antarmuka harus:
- modern;
- sederhana;
- cepat;
- responsive;
- mudah dipahami pengguna non-teknis;
- menampilkan progress agent secara jelas.

Layout utama:

```text
┌─────────────────────────────────────────────┐
│ EYZA                                  ⚙️    │
├───────────────────┬─────────────────────────┤
│ Project Files     │ AI CHAT                 │
│                   │                         │
│ 📁 src            │ User:                   │
│ 📁 components     │ Buat dashboard...       │
│ 📄 package.json   │                         │
│                   │ EYZA:                   │
│                   │ Saya akan membuat...    │
│                   │                         │
│                   ├─────────────────────────┤
│                   │ Tulis instruksi...      │
└───────────────────┴─────────────────────────┘
```

## 16. Database

### Entitas Awal

```text
users
projects
repositories
conversations
messages
tasks                  ← diperluas untuk state machine
task_steps
task_state_transitions ← baru: audit trail setiap transisi state
executions
builds
deployments
agent_logs
agent_contexts         ← baru: simpan context LLM antar session
file_snapshots         ← baru: snapshot file sebelum agent mengubah (untuk rollback)
cost_tracking          ← baru: pantau pengeluaran token & biaya LLM per task
user_preferences       ← baru: konfigurasi user (auto-deploy, framework default, dll)
```

### Schema Kritis: `tasks`

```sql
tasks (
  id              uuid PRIMARY KEY,
  project_id      uuid REFERENCES projects(id),
  conversation_id uuid REFERENCES conversations(id),
  instruction     text NOT NULL,
  plan            jsonb,
  state           task_state NOT NULL DEFAULT 'CREATED',
  prev_state      task_state,
  retry_count     int DEFAULT 0,
  max_retries     int DEFAULT 3,
  fix_history     jsonb DEFAULT '[]',
  token_used      int DEFAULT 0,
  cost_usd        numeric(10,6) DEFAULT 0,
  started_at      timestamptz,
  paused_at       timestamptz,
  completed_at    timestamptz,
  timeout_at      timestamptz,
  error_message   text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
)
```

### Enum `task_state`

```sql
CREATE TYPE task_state AS ENUM (
  'CREATED',
  'PLANNING',
  'AWAITING_APPROVAL',
  'CODING',
  'REVIEWING',
  'COMMITTING',
  'BUILDING',
  'DEPLOYING',
  'COMPLETED',
  'PAUSED',
  'CANCELLED',
  'FAILED',
  'TIMED_OUT'
);
```

### Schema Kritis: `task_state_transitions`

```sql
task_state_transitions (
  id         uuid PRIMARY KEY,
  task_id    uuid REFERENCES tasks(id),
  from_state task_state,
  to_state   task_state NOT NULL,
  event      text NOT NULL,
  metadata   jsonb,
  created_at timestamptz DEFAULT now()
)
```

## 17. Repository Structure

```text
eyza/
│
├── apps/
│   └── web/
│
├── packages/
│   ├── ai/          ← AI Provider Abstraction Layer
│   ├── agent/
│   ├── github/
│   ├── database/
│   ├── tools/       ← baru: tools agent dipisah agar dapat ditest independen
│   ├── types/       ← baru: shared TypeScript types lintas package
│   └── shared/
│
├── .github/
│   └── workflows/
│
├── prisma/
│
├── turbo.json       ← baru: Turborepo config
├── package.json
└── README.md
```

Agent package:

```text
packages/agent/
├── orchestrator/
├── planner/
├── coder/
├── reviewer/
├── debugger/
├── state-machine/   ← baru: task state machine & transitions
├── tools/
└── prompts/
```

## 18. Non-Goals MVP

Jangan masukkan dahulu:
- desktop application;
- persistent VPS;
- browser automation;
- Docker orchestration kompleks;
- multi-user enterprise;
- billing;
- marketplace;
- autonomous production deployment tanpa persetujuan;
- unlimited background execution;
- semantic search / embedding (post-MVP);
- long-term memory lintas project (post-MVP).

## 19. Success Criteria MVP

MVP dianggap berhasil jika:
1. User dapat login.
2. User dapat menghubungkan GitHub.
3. User dapat membuat project.
4. User dapat memberikan instruksi ke EYZA.
5. EYZA dapat membaca repository.
6. EYZA dapat membuat/mengubah file.
7. EYZA dapat commit/push.
8. GitHub Actions dapat build/test.
9. EYZA dapat membaca error.
10. EYZA dapat memperbaiki error.
11. Project berhasil build.
12. Project dapat di-deploy ke Vercel.
13. User mendapatkan URL aplikasi.
14. Task yang terputus dapat dilanjutkan (resume dari state terakhir).
15. Cost per task dapat dipantau.

## 20. Contoh End-to-End

User:

> Buat aplikasi inventory React dengan dashboard, produk, kategori, dan stok.

Alur EYZA:

```text
Analyze request
↓
Create plan → tampilkan ke user → tunggu approval
↓
Generate/modify files (Coder)
↓
Review changes (Reviewer) → jika gagal → kembali ke Coder
↓
Commit + push
↓
Run GitHub Actions
↓
Read build/test result
↓
Fix errors if needed (Debugger, max 3x)
↓
Run again
↓
Deploy to Vercel → konfirmasi user untuk production
↓
Return result + URL
```

**Prinsip utama:** bangun EYZA sebagai AI Coding Agent yang dapat menyelesaikan task, bukan sekadar chatbot yang menghasilkan kode.

---

## 21. Task State Machine

### State yang Didefinisikan

| State | Deskripsi |
|---|---|
| `CREATED` | Task baru dibuat, belum diproses |
| `PLANNING` | Planner menganalisis dan membuat rencana |
| `AWAITING_APPROVAL` | Plan siap, menunggu konfirmasi user |
| `CODING` | Coder menghasilkan/mengubah file |
| `REVIEWING` | Reviewer memeriksa perubahan |
| `COMMITTING` | Commit dan push ke GitHub |
| `BUILDING` | GitHub Actions menjalankan build/test |
| `DEPLOYING` | Vercel menjalankan deployment |
| `COMPLETED` | Task selesai berhasil |
| `PAUSED` | Dijeda oleh user |
| `CANCELLED` | Dibatalkan permanen |
| `FAILED` | Gagal setelah semua retry habis |
| `TIMED_OUT` | Melebihi batas waktu task |

### Transisi Kritis

```text
PLANNING       → AWAITING_APPROVAL  (plan_ready)
AWAITING_APPROVAL → CODING          (user_approved)
REVIEWING      → COMMITTING         (review_passed)
REVIEWING      → CODING             (review_failed, retry < max)
BUILDING       → PLANNING           (build_fail, retry < max_retry)
BUILDING       → FAILED             (build_fail, retry >= max_retry)
Any            → PAUSED             (user_pause)
Any            → CANCELLED          (user_cancel)
Any            → TIMED_OUT          (elapsed > 30 menit)
```

### Aturan State Machine

1. Setiap transisi **wajib dicatat** di tabel `task_state_transitions`.
2. Orchestrator adalah satu-satunya yang boleh mengubah state task.
3. Agent lain (Coder, Reviewer, dll) hanya melapor hasil — tidak mengubah state langsung.
4. Task di state `PAUSED` dapat di-resume oleh user — Orchestrator melanjutkan dari `prev_state`.
5. Task di state `COMPLETED`, `CANCELLED`, `FAILED`, atau `TIMED_OUT` bersifat **terminal** — tidak dapat diubah lagi.

---

## 22. UX: Confirmation Flow

Sebelum task besar dimulai, EYZA **wajib menampilkan preview plan** dan meminta konfirmasi.

Contoh tampilan:

```text
EYZA akan melakukan:

  Plan: Buat aplikasi inventory React
  ───────────────────────────────────
  1. Buat struktur project
  2. Buat komponen Dashboard
  3. Buat komponen Products
  4. Buat komponen Categories
  5. Buat komponen Stock
  6. Setup routing

  Estimasi: ~12 file akan dibuat/diubah
  ───────────────────────────────────
  [ Lanjutkan ]   [ Ubah Plan ]   [ Batalkan ]
```

Jika instruksi user **ambigu**, EYZA bertanya terlebih dahulu:

```text
EYZA: Sebelum saya mulai, saya ingin memastikan:
  - Apakah inventory ini menggunakan database, atau cukup local state?
  - Apakah perlu fitur login?
  - Framework pilihan: React biasa atau Next.js?
```

