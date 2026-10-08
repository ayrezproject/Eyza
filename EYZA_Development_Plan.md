# EYZA — Development Plan
## Electronic Yielding Zone Assistant

**Version:** 1.1  
**Last Updated:** 2026-10-09  

## Tujuan Akhir

Membangun EYZA sebagai AI Coding Agent berbasis web yang dapat menerima instruksi natural language, mengerjakan source code melalui GitHub, menjalankan build/test dengan GitHub Actions, memperbaiki error secara otomatis, dan melakukan deployment melalui Vercel.

## Stack Awal

- Frontend/Backend: Next.js + TypeScript
- Hosting: Vercel Free
- Repository: GitHub (gunakan **public repo** untuk menghindari batasan Actions minutes di free tier)
- CI/Execution MVP: GitHub Actions
- Database: PostgreSQL-compatible serverless free tier (Neon / Supabase / PlanetScale)
- AI: LLM API dengan tool calling — **wajib dibungkus AI Provider Abstraction Layer**
- Authentication: GitHub OAuth
- Styling: Tailwind CSS
- Monorepo: **Turborepo**

## Roadmap

### Milestone 1 — Foundation
**Tujuan:** EYZA dapat dijalankan.

- [x] Buat repository EYZA
- [x] Setup monorepo dengan Turborepo
- [x] Setup Next.js + TypeScript
- [x] Setup Vercel
- [x] Setup database (Neon / Supabase / PlanetScale)
- [x] Buat migration schema awal (users, projects, tasks + task_state enum, task_state_transitions)
- [x] Setup environment variables
- [x] Setup GitHub OAuth
- [x] Setup lint/typecheck
- [x] Setup CI (GitHub Actions: lint + typecheck + build)
- [x] Setup `packages/types/` untuk shared TypeScript types

**Definition of Done:** aplikasi EYZA dapat login, dashboard dapat dibuka, dan database migration berjalan bersih.

### Milestone 2 — Dashboard & Chat

- [x] Dashboard
- [x] Project list
- [x] Create project
- [x] Project detail
- [x] AI chat
- [x] Message history
- [x] Activity log (tampilkan state transitions task)
- [x] Task status (tampilkan current state dari state machine)

**Definition of Done:** user dapat membuat project dan berbicara dengan EYZA.

### Milestone 3 — AI Core

- [ ] AI provider abstraction (`packages/ai/`)
- [ ] System prompt baseline
- [ ] Conversation context management
- [ ] Tool calling framework
- [ ] **Task State Machine** — definisi state, transisi, dan guard conditions
- [ ] Orchestrator — satu-satunya yang mengubah state task
- [ ] Planner — output plan + tampilkan ke user untuk approval
- [ ] Task state machine persistence (simpan & load state dari database)
- [ ] **Token budget tracking** per task (batas 100k input token default)
- [ ] **Cost tracking** — hitung estimasi biaya setiap LLM call
- [ ] **Ambiguity detection** — jika instruksi ambigu, Planner bertanya ke user sebelum membuat plan
- [ ] Resume task dari state terakhir setelah disconnect

**Definition of Done:** EYZA dapat mengubah instruksi menjadi rencana terstruktur, menampilkannya ke user, dan state task tersimpan dengan benar di database.

### Milestone 4 — GitHub Agent

- [ ] GitHub OAuth
- [ ] Repository listing
- [ ] Branch listing
- [ ] Read file
- [ ] List files
- [ ] Search code
- [ ] Create file
- [ ] Update file
- [ ] Delete file
- [ ] Diff
- [ ] Commit
- [ ] Push

**Definition of Done:** EYZA dapat membuat perubahan nyata pada repository.

### Milestone 5 — Coding Workflow

- [ ] Project context (struktur file, framework, dependencies)
- [ ] Coder agent — hanya bekerja setelah plan disetujui user
- [ ] Reviewer agent dengan checklist eksplisit:
  - [ ] Deteksi secret/API key dalam kode
  - [ ] TypeScript check (`tsc --noEmit`)
  - [ ] Deteksi shell command tidak terduga
  - [ ] Konsistensi dengan plan yang disetujui
- [ ] Coder–Reviewer feedback loop (max 2 iterasi)
- [ ] **File snapshot** sebelum Coder mengubah file (untuk rollback)
- [ ] Dependency awareness (baca package.json sebelum coding)
- [ ] Change summary yang ditampilkan ke user
- [ ] Safe file operations (tidak mengubah file di luar scope plan)
- [ ] **File modification limit** (maks. 20 file per task)
- [ ] User approval controls

**Definition of Done:** EYZA dapat menyelesaikan task coding kecil secara end-to-end dengan Reviewer checkpoint wajib sebelum commit.

### Milestone 6 — GitHub Actions

- [ ] Workflow template
- [ ] Install dependencies
- [ ] Lint
- [ ] Test
- [ ] Build
- [ ] Retrieve logs
- [ ] Parse errors
- [ ] Display execution status

**Definition of Done:** setiap perubahan dapat diuji secara otomatis.

### Milestone 7 — Self-Healing

- [ ] Error classifier (syntax / dependency / type / logic / env / unknown)
- [ ] Debugger agent
- [ ] `fix_history` context — Debugger membaca fix yang sudah dicoba sebelumnya
- [ ] Related file detection
- [ ] Automatic fix generation (berbeda dari fix sebelumnya)
- [ ] Retry controller — state machine update `retry_count` setiap percobaan
- [ ] **Retry limit hardcoded: maksimal 3** (tidak dapat diubah oleh AI)
- [ ] **Circuit breaker** — jika GitHub API / LLM API gagal 3x berturut-turut → task → `PAUSED`
- [ ] **Task timeout** — jika task melebihi 30 menit → `TIMED_OUT`
- [ ] Failure report — daftar error, fix yang dicoba, file terlibat, saran manual
- [ ] User pilihan setelah failure: "Coba lagi" atau "Batalkan"

**Definition of Done:** EYZA dapat memperbaiki error build/test sederhana secara otomatis, tidak mengulangi fix yang sama, dan selalu berhenti bersih jika semua retry habis.

### Milestone 8 — Deployment

- [ ] Vercel integration
- [ ] Preview deployment
- [ ] Deployment status
- [ ] Deployment URL
- [ ] Production confirmation
- [ ] Deployment history

**Definition of Done:** project yang berhasil build dapat di-deploy.

### Milestone 9 — Autonomous Workflow

Gabungkan:

```text
Instruction
→ Planning
→ Coding
→ Review
→ Commit
→ Build
→ Test
→ Debug
→ Retry
→ Deploy
→ Report
```

**Definition of Done:** EYZA dapat menyelesaikan project kecil dari instruksi sampai deployment dengan intervensi minimal.

## Security Plan

- [ ] GitHub OAuth
- [ ] Least-privilege GitHub permissions
- [ ] Encrypted secrets (jangan simpan plain text)
- [ ] Environment variables (jangan hardcode)
- [ ] Never expose API keys to model / prompt
- [ ] Repository allow-list (batasi repo yang dapat diakses agent)
- [ ] Action audit log (catat semua aksi agent)
- [ ] Production deploy confirmation (wajib approval user)
- [ ] **Retry limits hardcoded** (tidak dapat diubah oleh AI atau user)
- [ ] Rate limiting (GitHub API + LLM API)
- [ ] Prompt/tool boundary validation
- [ ] **Reviewer checkpoint wajib** sebelum setiap commit (tidak boleh di-bypass)
- [ ] **File snapshot** sebelum perubahan (untuk rollback jika diperlukan)
- [ ] **Token budget** per task (cegah runaway API cost)

## Testing Plan

### Unit
- Agent tools (setiap tool ditest secara independen)
- GitHub client
- Planner (output plan deterministik untuk input yang sama)
- Error classifier
- Retry controller
- State machine transitions (setiap transisi ditest dengan guard conditions)
- Token budget counter
- Cost calculator

### Integration
- AI Provider Abstraction → actual LLM API
- AI → tools
- AI → GitHub
- GitHub → Actions
- Actions → EYZA
- EYZA → Vercel
- State machine → database (persist & resume)

### Contract Testing
- AI Provider Abstraction layer: pastikan interface konsisten saat ganti provider LLM.
- GitHub client: mock GitHub API untuk tests agar tidak mengonsumsi quota.

### End-to-End

1. User creates project.
2. User asks EYZA to create a feature.
3. EYZA detects ambiguity → asks clarifying questions.
4. User answers → EYZA generates plan → user approves.
5. EYZA generates changes (Coder).
6. EYZA reviews changes (Reviewer) → passed.
7. EYZA commits.
8. GitHub Actions builds.
9. Build fails.
10. EYZA analyzes error (classifies as `syntax`).
11. EYZA checks fix_history → no previous fix.
12. EYZA fixes code.
13. Build succeeds.
14. EYZA deploys.
15. User receives URL.
16. Task state = `COMPLETED`, semua transisi tercatat di DB.

## MVP Constraints

Jangan membuat pada MVP:
- 24/7 persistent agent server
- complex browser automation
- Docker orchestration
- enterprise billing
- multi-tenant enterprise controls
- unrestricted production deployment
- unlimited autonomous execution
- semantic search / embedding
- long-term memory lintas project

## Future Expansion

Setelah MVP stabil:
- persistent cloud execution;
- sandbox/Docker (eksekusi kode yang lebih aman);
- terminal agent;
- browser agent;
- database agent;
- semantic code search (embeddings);
- long-term project memory;
- multi-agent collaboration;
- GitHub Pull Request automation;
- issue automation;
- advanced QA;
- cloud VM execution;
- Actions minutes monitoring & alerting.

## Prinsip Pengembangan

1. Build small.
2. Validate every milestone.
3. Keep tools isolated — setiap tool dapat ditest secara independen.
4. Keep permissions minimal.
5. Never give the model unrestricted infrastructure access.
6. Make every autonomous action observable — setiap aksi agent harus tercatat.
7. Prefer deterministic tools over free-form shell execution.
8. Add persistent execution only when GitHub Actions is no longer sufficient.
9. **State machine is the source of truth** — semua agent melaporkan hasil ke Orchestrator, tidak mengubah state secara langsung.
10. **Reviewer before every commit** — tidak ada kode yang masuk ke repository tanpa review.
11. **Token budget & cost tracking dari hari pertama** — bukan afterthought.
