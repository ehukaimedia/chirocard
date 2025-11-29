# ChiroCard AI Agent Instructions

## Project Overview
ChiroCard is a **local-first PWA** for tracking holistic bodywork sessions (chiropractic, massage, PT). Data is stored locally via IndexedDB (Dexie.js) — no cloud backend. Privacy-first design for HIPAA/GDPR compliance.

## Architecture

### Data Flow
```
User Intake → startSession() → Guest Session (Practitioner Mode) → Locked Record + PDF
```
- **Dual-mode interface**: User mode (intake) and Guest/Practitioner mode (session logging)
- Sessions are **immutable once signed** — the `isLocked` flag prevents edits
- State persists across page navigation via Zustand store (`useAppStore`)

### Key Files
| File | Purpose |
|------|---------|
| `src/db/db.ts` | Dexie database schema — all data types defined here |
| `src/store/useAppStore.ts` | Global app state (mode, active session, intake data) |
| `src/pages/GuestSession.tsx` | Core practitioner workflow — most complex component |
| `src/utils/pdfGenerator.ts` | jsPDF-based session report generation |
| `src/components/BodyMap/BodyRegionSelector.tsx` | Body region status cycling logic |

### Database Schema (Dexie v13)
```typescript
// Key tables and their indexed fields:
users: 'id'              // Single record with id='me'
practitioners: 'id, name, role, order'
sessions: 'id, date, practitionerId'
homework: '++id, isCompletedToday, status'
```

## Conventions

### Component Patterns
- UI components in `src/components/ui/` — use `cn()` utility for conditional classes
- Page components in `src/pages/` — each route maps to one page
- All components use **function declarations** not arrow expressions at module level

### Styling
- **Tailwind CSS** with custom color tokens: `primary` (#177D4F), `secondary` (#8AAB35)
- Dark mode is default (`bg-zinc-950`, `bg-zinc-900`)
- Light mode classes use `dark:` prefix pattern (e.g., `bg-white dark:bg-zinc-900`)
- Glassmorphism cards: `bg-zinc-900/50 border border-zinc-800 rounded-xl`

### State Management
```typescript
// Always use these patterns:
const { mode, startSession, endSession } = useAppStore();
const user = useLiveQuery(() => db.users.get("me"));  // Reactive Dexie queries
```

### Body Status Cycling
```typescript
// User mode (simple): normal ↔ issue
// Practitioner mode (detailed): normal → issue → watch → addressed → normal
```

## Commands
```bash
npm run dev      # Vite dev server at localhost:5173
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Critical Patterns

### Session Handoff Flow
1. User completes intake on `Intake.tsx` (selects practitioner, marks body areas, signs)
2. `startSession()` switches to guest mode and stores intake data in Zustand
3. `GuestSession.tsx` receives data, practitioner logs work, adds recommendations
4. On sign-off: session saved to IndexedDB, PDF generated, homework items added

### PDF Generation
```typescript
// Always use both functions together:
const pdf = generateSessionPDF({ date, practitionerName, notes, bodyLog, ... });
downloadPDF(pdf, `chirocard-session-${date}.pdf`);
```

### Protected Routes
```tsx
// Guest routes require mode === 'guest':
<ProtectedGuestRoute><GuestSession /></ProtectedGuestRoute>
```

## Common Tasks

### Adding a New Database Table
1. Add type to `src/db/db.ts`
2. Add table declaration in `ChiroCardDB` class
3. Increment version number and update `.stores()` migration

### Adding UI Components
1. Create in `src/components/ui/`
2. Use `cn()` for class merging: `import { cn } from "../../lib/utils"`
3. Forward refs for interactive elements

### Icons
Use **Lucide React** exclusively:
```typescript
import { IconName } from "lucide-react";
<IconName className="w-5 h-5" />
```

## Assets
⚠️ **Do not modify** `/public/icon.svg` (brand logo) or `/public/chirocard-icon.png`
