# Shoudagor Documentation Site - Agent Context

> **Quick Summary**: A Next.js 16 documentation site with admin panel, TipTap rich-text editor, SQLite database via Prisma, and NextAuth.js authentication. Built with pure Tailwind CSS v4 (no shadcn/ui).

<!-- BEGIN:nextjs-agent-rules -->
## ⚠️ Next.js 16 Breaking Changes

This project uses **Next.js 16.2.4** which has significant breaking changes from older versions:
- Always check `node_modules/next/dist/docs/` before using APIs from your training data
- Heed deprecation notices in the codebase
- React 19.2.4 is used (not React 18)
<!-- END:nextjs-agent-rules -->

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 16 App Router                    │
├─────────────────────────────────────────────────────────────┤
│  Public Site        │  Admin Panel          │  API Routes      │
│  ─────────────      │  ──────────         │  ─────────       │
│  /                  │  /admin/dashboard   │  /api/sections   │
│  /docs/[section]    │  /admin/sections    │  /api/docs       │
│  /docs/[s]/[doc]    │  /admin/docs        │  /api/suggestions│
│                     │  /admin/suggestions │  /api/feedbacks  │
│                     │  /admin/feedbacks   │  /api/upload     │
│                     │  /admin/login       │  /api/auth/...   │
├─────────────────────────────────────────────────────────────┤
│  TipTap Editor (Rich Text)  │  Sidebar Navigation            │
│  Search Component           │  Feedback/Suggestion Modals    │
├─────────────────────────────────────────────────────────────┤
│  Prisma ORM + SQLite (better-sqlite3 adapter)               │
│  NextAuth.js (Credentials Provider)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| Framework | Next.js | 16.2.4 | App Router, React 19.2.4 |
| Styling | Tailwind CSS | v4 | `@import "tailwindcss"` in globals.css |
| Database | SQLite | 3 | Via `better-sqlite3` |
| ORM | Prisma | 7.8.0 | With `PrismaBetterSqlite3` adapter |
| Auth | NextAuth.js | 4.24.14 | Credentials provider, JWT strategy |
| Editor | TipTap | 3.22.5 | Rich text with custom extensions |
| Security | DOMPurify | 3.10.0 | HTML sanitization |
| Utils | date-fns | 4.1.0 | Date formatting |

---

## Database Schema (Prisma)

**File**: `prisma/schema.prisma`

```prisma
model Section {
  id        Int      @id @default(autoincrement())
  title     String
  slug      String   @unique
  order     Int      @default(0)
  docs      Doc[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Doc {
  id          Int          @id @default(autoincrement())
  title       String
  slug        String       @unique
  content     String       // HTML content from TipTap
  order       Int          @default(0)
  section     Section      @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  sectionId   Int
  suggestions Suggestion[]
  feedbacks   Feedback[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Suggestion {
  id          Int      @id @default(autoincrement())
  name        String
  phone       String?
  content     String   // Proposed HTML content
  status      String   @default("pending") // pending, approved, rejected
  doc         Doc      @relation(fields: [docId], references: [id], onDelete: Cascade)
  docId       Int
  createdAt   DateTime @default(now())
}

model Feedback {
  id        Int      @id @default(autoincrement())
  name      String
  phone     String?
  message   String
  doc       Doc      @relation(fields: [docId], references: [id], onDelete: Cascade)
  docId     Int
  createdAt DateTime @default(now())
}

model AdminUser {
  id       Int    @id @default(autoincrement())
  email    String @unique
  password String // bcrypt hashed
}
```

---

## File Structure

```
app/
├── (public)/                 # Public-facing routes (group)
│   ├── page.tsx             # Homepage with sections grid
│   └── docs/
│       └── [sectionSlug]/
│           ├── page.tsx      # Section page (lists docs)
│           └── [docSlug]/
│               └── page.tsx  # Individual doc viewer
├── admin/                    # Admin panel routes
│   ├── layout.tsx           # Admin layout with sidebar
│   ├── login/page.tsx       # Login page
│   ├── dashboard/page.tsx   # Stats dashboard
│   ├── sections/page.tsx    # Section CRUD
│   ├── docs/                # Document management
│   │   ├── page.tsx         # Doc list
│   │   ├── new/page.tsx     # Create doc
│   │   └── [id]/edit/       # Edit doc with TipTap
│   ├── suggestions/page.tsx # Approve/reject suggestions
│   └── feedbacks/page.tsx   # View feedback
├── api/                     # API routes
│   ├── auth/[...nextauth]/  # NextAuth handler
│   ├── sections/route.ts    # GET (public), POST (auth)
│   ├── docs/route.ts        # GET (public), POST (auth)
│   ├── suggestions/route.ts # POST (public), PATCH/DELETE (auth)
│   ├── feedbacks/route.ts   # POST (public), GET (auth)
│   └── upload/route.ts      # File upload (auth required)
├── layout.tsx               # Root layout
├── page.tsx                 # Homepage
└── globals.css              # Tailwind v4 config

components/
├── Sidebar.tsx              # Navigation sidebar (public)
├── SearchBar.tsx            # Search input
├── TipTapEditor.tsx         # Rich text editor (~1000 lines)
├── SuggestionModal.tsx      # Submit suggestion modal
├── FeedbackModal.tsx        # Submit feedback modal
└── admin/
    ├── AdminSidebar.tsx     # Admin navigation
    └── DataTable.tsx        # Reusable data table

lib/
├── auth.ts                  # NextAuth configuration
├── prisma.ts                # Prisma client singleton
└── utils.ts                 # slugify, date formatting

prisma/
├── schema.prisma            # Database schema
└── seed.ts                  # Seed admin + sample data
```

---

## Key Configuration Files

### Tailwind CSS v4 (`app/globals.css`)
```css
@import "tailwindcss";  /* v4 syntax - no @tailwind directives */

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
}
```

### Prisma with better-sqlite3 (`lib/prisma.ts`)
```typescript
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
export const prisma = new PrismaClient({ adapter });
```

### NextAuth (`lib/auth.ts`)
- Credentials provider (email/password)
- JWT session strategy
- Admin users stored in `AdminUser` table
- Passwords hashed with bcrypt

### Middleware (`middleware.ts`)
- Protects `/admin/*` routes (except `/admin/login`)
- Checks for `next-auth.session-token` cookie

---

## API Route Patterns

All API routes follow these conventions:

| Route | Methods | Auth Required | Description |
|-------|---------|---------------|-------------|
| `/api/sections` | GET | No | List all sections with docs |
| `/api/sections` | POST | Yes | Create new section |
| `/api/docs` | GET | No | List docs (optional `?sectionId=` filter) |
| `/api/docs` | POST | Yes | Create new doc (sanitizes HTML) |
| `/api/suggestions` | POST | No | Submit suggestion |
| `/api/suggestions` | GET | Yes | List suggestions |
| `/api/suggestions` | PATCH | Yes | Update status (approve/reject) |
| `/api/feedbacks` | POST | No | Submit feedback |
| `/api/feedbacks` | GET | Yes | List feedback |
| `/api/upload` | POST | Yes | Upload image/video |

**Auth Check Pattern**:
```typescript
import { getServerSession } from 'next-auth/next';
const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

---

## TipTap Editor (`components/TipTapEditor.tsx`)

A comprehensive rich-text editor with these features:

### Extensions Used
- `StarterKit` - Basic formatting (bold, italic, headings, lists, etc.)
- `Image` - Custom image with alignment support
- `Video` - Custom video extension (MP4/WebM upload)
- `Iframe` - YouTube embed support
- `Link` - Hyperlinks
- `TextAlign` - Left/center/right/justify alignment
- `Underline`, `Color`, `Highlight` - Text styling
- `Subscript`, `Superscript` - Scientific notation
- `Table` - Tables with row/column operations
- `HorizontalRule` - Divider lines

### Custom Extensions

**Video Node** (lines 42-82):
```typescript
const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  // Supports: src, controls, width, height, autoplay, loop, muted, poster
});
```

**Iframe Node** (lines 111-147):
- For YouTube embeds
- Default: 560x315px
- Supports allowfullscreen

**Image Extension** (lines 84-108):
- Extended from `@tiptap/extension-image`
- Adds alignment class support (`mx-auto`, `ml-0`, `ml-auto`)

### Upload Flow
1. User clicks image/video button in toolbar
2. File input opens → user selects file
3. POST to `/api/upload` with FormData
4. Server saves to `public/uploads/`
5. Returns `{ url: "/uploads/filename.ext" }`
6. Editor inserts node with returned URL

### Markdown Mode
- Toggle between WYSIWYG and markdown editing
- Simple markdown→HTML parser included
- Not full-featured markdown support

---

## Upload Constraints (`app/api/upload/route.ts`)

| Type | Max Size | Allowed Formats |
|------|----------|-----------------|
| Images | 5MB | JPEG, PNG, WebP, GIF |
| Videos | 50MB | MP4, WebM |

Files saved to: `public/uploads/{timestamp}-{random}.{ext}`

---

## Security Considerations

1. **HTML Sanitization**: All content saved via `/api/docs` is sanitized with DOMPurify:
   ```typescript
   DOMPurify.sanitize(content, {
     ADD_TAGS: ['iframe', 'video'],
     ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'controls'],
   });
   ```

2. **Authentication**: All admin operations require session via `getServerSession()`

3. **File Uploads**: Type and size validation on server

4. **Environment Variables**:
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ADMIN_EMAIL="admin@example.com"
   ADMIN_PASSWORD="admin123"
   ```

---

## Component Conventions

### Styling Pattern
- Pure Tailwind CSS (no shadcn/ui components)
- Consistent color scheme: `indigo-600` for primary actions
- Gray scale: `gray-50` backgrounds, `gray-900` text
- Spacing: `p-4`, `p-6`, `p-8` for containers

### Data Fetching
- Server Components: Use `prisma` directly (e.g., `app/page.tsx`)
- Client Components: `fetch()` from API routes (e.g., `components/Sidebar.tsx`)

### Props Pattern
```typescript
interface Props {
  params: Promise<{ sectionSlug: string; docSlug: string }>;
}
// Usage: const { sectionSlug, docSlug } = await params;
```

---

## Important Utilities (`lib/utils.ts`)

```typescript
// URL-friendly slugs
slugify("Hello World") // "hello-world"

// Date formatting
formatDate(new Date()) // "Jan 1, 2024"
formatDateTime(new Date()) // "Jan 1, 2024, 12:00 PM"
```

---

## Common Tasks Reference

### Adding a New API Route
1. Create `app/api/new-feature/route.ts`
2. Export `GET`/`POST`/`PATCH`/`DELETE` handlers
3. Use `getServerSession(authOptions)` for protected routes
4. Return `NextResponse.json(data, { status: 201 })`

### Adding a New Page
1. Create `app/admin/new-page/page.tsx` or `app/(public)/new/page.tsx`
2. Server components can use `prisma` directly
3. Wrap in layout if needed

### Modifying the Editor
1. Edit `components/TipTapEditor.tsx`
2. Add extensions to the `extensions` array (line ~174)
3. Add toolbar buttons in the JSX (after line 434)

### Database Changes
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Update seed script if needed
4. Regenerate client: `npx prisma generate`

---

## Gotchas & Edge Cases

1. **Prisma Singleton**: Always import from `@/lib/prisma`, not `@prisma/client` directly

2. **Better-sqlite3 Adapter**: The adapter must be passed to PrismaClient

3. **TipTap SSR**: Uses `immediatelyRender: false` to avoid hydration issues

4. **Image Alignment**: Custom CSS in `globals.css` handles `.mx-auto`, `.ml-0`, `.ml-auto`

5. **Session Token Names**:
   - Development: `next-auth.session-token`
   - Production: `__Secure-next-auth.session-token`
   - Both checked in middleware

6. **DOMPurify**: Must allow `iframe` and `video` tags explicitly for embeds to work

7. **React 19**: Some patterns from React 18 may not work (e.g., certain hook behaviors)

---

## Environment Setup

```bash
# Install dependencies
npm install

# Set up database
npx prisma migrate dev --name init
npx prisma db seed

# Development
npm run dev

# Production build
npm run build
npm start
```

Default admin credentials from `.env`:
- Email: `ADMIN_EMAIL` (default: admin@example.com)
- Password: `ADMIN_PASSWORD` (default: admin123)

---

## External References

- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Original project plan
- [README.md](./README.md) - Basic setup instructions
- [CLAUDE.md](./CLAUDE.md) - Points to this file
