# Documentation Site Implementation Plan

Build a full-featured documentation site using Next.js 16 (App Router), Tailwind CSS v4, SQLite with Prisma, NextAuth.js, and TipTap editor.

## Configuration Decisions
- SQLite database in `.gitignore` (not committed)
- Admin credentials loaded from environment variables
- 50MB max video upload size
- Image formats: jpg, jpeg, png, webp
- Pure Tailwind CSS (no shadcn/ui) for minimal dependencies
- Local development focused

## Implementation Phases

### Phase 1: Project Setup & Dependencies
- Install Prisma, NextAuth.js, TipTap, DOMPurify, bcrypt
- Configure Tailwind CSS v4 properly
- Set up environment variables
- Create Prisma schema with all models
- Set up seed script with admin user

### Phase 2: Database Layer
- Initialize Prisma client singleton
- Create slugify utility with uniqueness check
- Set up database seed with 2 sections, 3 docs
- Test database connection

### Phase 3: Authentication
- Configure NextAuth.js with credentials provider
- Create admin middleware for route protection
- Build login page with form
- Set up session handling

### Phase 4: API Routes
- Sections CRUD API
- Docs CRUD API
- Suggestions API (public submit, admin manage)
- Feedback API (public submit, admin manage)
- Upload API for images/videos
- NextAuth handler

### Phase 5: Public Pages
- Homepage with hero, search, sections list
- Section page listing docs
- Doc view page with TipTap-rendered HTML
- Suggestion modal component
- Feedback modal component
- Sidebar navigation component

### Phase 6: Admin Panel
- Dashboard with stats cards
- Sections management page
- Docs list page with filters
- Doc create/edit form with TipTap editor
- Suggestions management table
- Feedback management table
- Admin sidebar layout

### Phase 7: TipTap Editor Integration
- Install TipTap extensions
- Build toolbar with bold, italic, headings, lists, code
- Image upload button (calls /api/upload)
- Video embed (YouTube iframe + MP4 upload)
- Editor component for admin doc forms

### Phase 8: Polish & Security
- DOMPurify HTML sanitization
- File upload validation
- Error handling
- Responsive design verification
- Final testing

## File Structure
```
/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── docs/[sectionSlug]/page.tsx
│   │   └── docs/[sectionSlug]/[docSlug]/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── sections/page.tsx
│   │   ├── docs/page.tsx
│   │   ├── docs/new/page.tsx
│   │   ├── docs/[id]/edit/page.tsx
│   │   ├── suggestions/page.tsx
│   │   └── feedbacks/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── sections/route.ts
│       ├── docs/route.ts
│       ├── suggestions/route.ts
│       ├── feedbacks/route.ts
│       └── upload/route.ts
├── components/
│   ├── Sidebar.tsx
│   ├── DocViewer.tsx
│   ├── TipTapEditor.tsx
│   ├── SuggestionModal.tsx
│   ├── FeedbackModal.tsx
│   ├── SearchBar.tsx
│   └── admin/
│       ├── AdminSidebar.tsx
│       ├── AdminLayout.tsx
│       └── DataTable.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
├── middleware.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── public/uploads/
```

## Environment Variables
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

## Dependencies to Install
```
# Database & ORM
npm install @prisma/client prisma

# Auth
npm install next-auth bcrypt
npm install -D @types/bcrypt

# Rich Text Editor
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link

# Security & Utilities
npm install dompurify sanitize-html
npm install -D @types/dompurify

# Additional
npm install date-fns
```

## Key Implementation Notes

### TipTap Editor Features
- Bold, italic, headings (H1-H3), bullet lists, ordered lists, code blocks
- Image: upload → POST /api/upload → insert `<img>` tag
- Video: YouTube embed via iframe, or MP4 upload → insert `<video>` tag

### Approval Flow
When approving a suggestion:
1. Update suggestion status to "approved"
2. In same transaction, update doc.content with suggestion.content

### Slug Generation
```typescript
async function generateUniqueSlug(title: string, model: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let counter = 1;
  // Check uniqueness, append counter if needed
}
```

### Security Checklist
- getServerSession on all admin API routes
- DOMPurify on all HTML content before storage
- File type validation on uploads
- File size limits enforced
