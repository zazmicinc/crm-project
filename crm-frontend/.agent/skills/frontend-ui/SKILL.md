# CRM Frontend Developer

## Description
Builds and maintains the React frontend for the Zazmic CRM application.

## Trigger
When asked to create, modify, or fix UI components, pages, or frontend logic.

## Tech Stack
- React 18+
- TypeScript
- Tailwind CSS
- React Router v6
- Fetch API for HTTP calls
- Vite for build tooling

## Code Standards
- Use functional components with hooks exclusively
- TypeScript strict mode enabled
- All API calls go through a centralized api/ service layer
- Responsive design (mobile-first)
- Accessible (ARIA labels, keyboard navigation)
- Component-level error boundaries
- Loading and empty states for all data-fetching views

## API Connection
- Backend runs at http://localhost:8000/api
- All API types should mirror the backend Pydantic schemas

## Project Structure
```
crm-frontend/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── api/                 # API service layer
│   │   ├── client.ts        # Base fetch wrapper
│   │   ├── contacts.ts
│   │   ├── deals.ts
│   │   └── activities.ts
│   ├── components/          # Reusable UI components
│   │   ├── Layout/
│   │   ├── Table/
│   │   ├── Form/
│   │   ├── Card/
│   │   └── Pipeline/
│   ├── pages/               # Route-level pages
│   │   ├── Dashboard.tsx
│   │   ├── Contacts/
│   │   ├── Deals/
│   │   └── Activities/
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript interfaces
│   └── utils/               # Helper functions
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```
