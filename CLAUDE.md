# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**hlmobile** is a Next.js 14 TypeScript application for offshore wind farm equipment maintenance management (離岸風電保養回報系統). It integrates with Maximo EAM for enterprise asset management and uses Ollama AI for generating repair suggestions.

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **State Management**: React Context API + localStorage
- **Backend Integration**: Maximo EAM (http://hl.webtw.xyz)
- **AI Service**: Ollama (mistral-small:latest)

### Directory Structure
```
src/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes (proxy, AI suggestions, health)
│   ├── pm/                   # Preventive Maintenance module
│   ├── cm/                   # Corrective Maintenance module
│   └── layout.tsx            # Root layout with providers
├── components/               # Reusable UI components
├── contexts/                 # React Contexts (Language, User)
├── hooks/                    # Custom React hooks
├── services/
│   └── api.ts               # 1452-line API service layer
└── utils/                   # Utilities (file, workorder helpers)
```

### Key Modules

#### 1. PM (Preventive Maintenance) Module
- **Location**: `src/app/pm/`
- **Features**: Workorder list with 4 status tabs (Current Work, In Progress, Wait for Approval, Others), search/filter, detail pages with Info/ActualCheck/WorkReport tabs
- **Components**: `pm/page.tsx` (list), `pm/[id]/page.tsx` (detail), `ActualCheck.tsx`, `WorkReport.tsx`

#### 2. CM (Corrective Maintenance) Module
- **Location**: `src/app/cm/`
- **Features**: Workorder list with same tab structure, create new CM report modal, detail pages with Info/Actual/Report tabs, **AI-powered repair suggestions**
- **Components**: `cm/page.tsx` (list with creation), `cm/[id]/page.tsx` (detail), `CMActual.tsx` (with AI suggestions)

#### 3. API Service Layer
- **File**: `src/services/api.ts` (1,452 lines)
- **Pattern**: All external API calls use `buildApiUrl()` + `apiRequest()` wrapper
- **Mock Mode**: Toggle via `NEXT_PUBLIC_USE_MOCK_DATA` env var (uses `/public/api/data.json`)
- **Modules**:
  - `pmApi`: PM workorder CRUD operations
  - `cmApi`: CM workorder CRUD + equipment options
  - `user`: User authentication & permissions
  - `health`: System health checks

### Data Flow Patterns

#### API Request Flow
```
Component → api.pm.getWorkOrders()
  → Check NEXT_PUBLIC_USE_MOCK_DATA flag
  → If true: fetch('/api/data.json')
  → If false: apiRequest(buildApiUrl('MOBILEAPP_GET_PM_WORKORDERS'))
    → /api/proxy?url=http://hl.webtw.xyz/maximo/oslc/script/...
    → Adds maxauth header
    → Returns response
```

#### AI Suggestion Flow
```
User types in CM Actual form (failureDetails)
  → Debounce 500ms
  → POST /api/cm/generate-suggestion
    → POST http://ollama.webtw.xyz:11434/api/generate
    → model: 'mistral-small:latest'
    → prompt: "Based on [equipment] with [abnormality]..."
  → Display suggestion in UI
```

## Important Configuration

### Environment Variables
```bash
# Required for production
NEXT_PUBLIC_API_BASE_URL=http://hl.webtw.xyz
NEXT_PUBLIC_MAX_API_PATH=/maximo/oslc/script
NEXT_PUBLIC_MAX_AUTH=bWF4YWRtaW46emFxMXhzVzI=  # base64: maxadmin:zaq1xsW2
NEXT_PUBLIC_USE_PROXY=true

# Optional for development
NEXT_PUBLIC_USE_MOCK_DATA=false  # Set to 'true' for offline development
```

### Next.js Configuration
- **React Strict Mode**: Enabled (double-renders in dev to detect side effects)
- **SWC Minification**: Enabled (fast JS minification)
- **Rewrites**: Disabled (using `/api/proxy` instead)

### TypeScript Configuration
- **Path Alias**: `@/*` maps to `./src/*` (use `import api from '@/services/api'`)
- **Target**: ES2017
- **Strict Mode**: Enabled

## API Integration

### Maximo EAM Scripts
All API calls use Maximo OSLC scripts via `/api/proxy`. Key scripts:
- `MOBILEAPP_GET_PM_WORKORDERS` - Get PM list
- `MOBILEAPP_GET_CM_WORKORDERS` - Get CM list
- `MOBILEAPP_GET_EQUIPMENT` - Get equipment options
- `MOBILEAPP_UPDATE_PM_WORKORDER` - Update PM workorder
- `MOBILEAPP_UPDATE_CM_WORKORDER` - Update CM workorder

### API Authentication
All requests to Maximo include the `maxauth` header (Base64 encoded credentials). The `/api/proxy` route automatically adds this header to prevent exposing credentials to the client.

### Mock Data Mode
For offline development or testing:
1. Set `NEXT_PUBLIC_USE_MOCK_DATA=true` in `.env.local`
2. Mock data is served from `/public/api/data.json`
3. All component code works identically with both mock and real APIs

## State Management

### React Context
- **LanguageContext**: i18n support (`zh` | `en`)
- **UserContext**: Authentication, permissions, profile
  - Methods: `hasPermission(perm)`, `isInGroup(group)`

### localStorage Usage
- **Tab Persistence**: `localStorage.setItem('pmActiveTab', activeTab)` - Persists active tab across navigation
- **Form State**: `localStorage.setItem('cmActual_${id}', JSON.stringify(formData))` - Saves CM Actual form data
- **Auth Status**: `localStorage.setItem('isLoggedIn', 'true')` - Client-side login flag

### Component State Pattern
All pages follow this pattern:
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await api.pm.getWorkOrders();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

## UI/UX Patterns

### Responsive Design
- Mobile-first with Tailwind CSS
- Sidebar collapses to overlay on mobile
- Touch-friendly button sizes
- Flexible card layouts

### Loading States
- Skeleton loaders shown during initial fetch (`Skeleton.tsx`)
- Button loading states (Save/Submit buttons)
- Attachment deletion loading states

### Form Submission Flow
```
User fills form → Click Save/Submit
  → Show SubmitModal (confirmation)
  → User confirms
  → api.updateWorkOrder(id, data)
  → Success: Navigate back to list
  → Error: Show error message
```

### Tab State Persistence
Both PM and CM detail pages save the active tab to localStorage:
```typescript
useEffect(() => {
  localStorage.setItem('pmActiveTab', activeTab);
}, [activeTab]);

// On mount
useEffect(() => {
  const saved = localStorage.getItem('pmActiveTab');
  if (saved) setActiveTab(saved);
}, []);
```

## Special Features

### AI-Powered Repair Suggestions (CM Module)
- **Location**: `CMActual.tsx` component
- **Trigger**: User types in failure description textarea (debounced 500ms)
- **Model**: Ollama `mistral-small:latest` via `/api/cm/generate-suggestion`
- **Prompt Format**: "Based on [Equipment Name] with [Abnormal Type] abnormality, the reported issue is: [Failure Description]. Suggest a repair method."
- **UI**: Displays suggestion below repair method textarea, user can accept or edit

### Attachment Management
- **Upload**: File input for images, media input for videos
- **Storage**: Converted to Base64 via `fileToBase64()` utility
- **Proxy**: External images fetched via `/api/image-proxy?url=...`
- **Deletion**: Supports attachment deletion with loading state
- **Current Limitation**: Attachments stored in localStorage (not yet persisted to server)

### Multilingual Support
- **Languages**: Chinese (zh) / English (en)
- **Toggle**: Available in Settings page
- **Context**: `LanguageContext` provides current language and setter
- **Usage**: Import translations and switch based on `language` value

## Testing & Development

### Mock Data Development
1. Create/edit `/public/api/data.json` with test data
2. Set `NEXT_PUBLIC_USE_MOCK_DATA=true`
3. All API calls will use mock data
4. Same component code works with both mock and real APIs

### Debugging
- **Debug Page**: `/debug` - Shows environment variables, API config
- **Health Check**: `/admin/health` - System health status
- **Console Logs**: API service logs requests/responses in dev mode

### Common Development Workflow
```bash
# 1. Start dev server
npm run dev

# 2. Make changes to components in src/app/ or src/components/

# 3. Changes auto-reload via Fast Refresh

# 4. Test with mock data (set NEXT_PUBLIC_USE_MOCK_DATA=true)

# 5. Test with real APIs (set NEXT_PUBLIC_USE_MOCK_DATA=false)

# 6. Build and test production bundle
npm run build
npm start
```

## Code Patterns to Follow

### API Calls
Always use the API service layer (`src/services/api.ts`):
```typescript
// ✅ Good
import api from '@/services/api';
const workOrders = await api.pm.getWorkOrders();

// ❌ Bad
const response = await fetch('/api/proxy?url=...');
```

### Path Imports
Use the `@/*` path alias:
```typescript
// ✅ Good
import api from '@/services/api';
import { Sidebar } from '@/components/Sidebar';

// ❌ Bad
import api from '../../../services/api';
```

### Client Components
All pages and components use client-side rendering. Always include:
```typescript
'use client'

import { useState, useEffect } from 'react';
```

### Error Handling
Wrap API calls in try/catch:
```typescript
try {
  setLoading(true);
  const data = await api.pm.getWorkOrders();
  setData(data);
} catch (error) {
  console.error('Error fetching data:', error);
  // Show error UI
} finally {
  setLoading(false);
}
```

## Known Limitations

1. **Authentication**: Client-side localStorage only (no JWT/session tokens)
2. **Attachment Persistence**: Attachments not yet uploaded to server (stored in localStorage)
3. **Real-time Updates**: No WebSocket support (manual refresh required)
4. **Offline Support**: No service worker or PWA capabilities
5. **Form Validation**: Minimal validation on forms (should be enhanced)
6. **Error Boundaries**: No global error boundary component
7. **Testing**: No unit tests or integration tests present

## Security Considerations

- **Credentials**: Never commit `.env.local` or expose `NEXT_PUBLIC_MAX_AUTH` value
- **API Proxy**: Always use `/api/proxy` to hide credentials from client
- **Input Validation**: Validate all form inputs before submission
- **XSS Prevention**: React's JSX escapes by default, but be careful with `dangerouslySetInnerHTML`

## Deployment

### Build Process
```bash
npm run build  # Creates optimized production build in .next/
npm start      # Starts production server on port 3000
```

### Environment Setup (Production)
1. Set all `NEXT_PUBLIC_*` environment variables
2. Set `NODE_ENV=production`
3. Ensure Maximo EAM endpoint is accessible
4. Ensure Ollama service is running (for AI suggestions)

### Deployment Targets
- **Vercel**: Zero-config deployment (recommended)
- **Docker**: Use Node.js base image
- **Traditional Server**: Run `npm start` after build

## Additional Notes

- **Git History**: Recent commits show PM/CM bug fixes, AI model updates, attachment management improvements, and state persistence enhancements
- **Main Branch**: `master` (use this for PRs)
- **Code Style**: TypeScript strict mode enabled, use ESLint for linting
- **Performance**: Next.js automatic code splitting, SWC minification, image optimization via `next/image`
