# ACT E‑Learning Frontend (Login Page)

This is a Vite + React + TailwindCSS frontend. It starts with the Login page design inspired by the provided Figma.

## Quick start

```bash
# from the workspace root
cd act-frontend
npm install
npm run dev
```

Then open the URL shown in the terminal (usually http://localhost:5173). You should see the login screen and a branded left panel on large screens.

## Structure
- `src/pages/Login.jsx` – Login screen
- `src/components/Logo.jsx` – Simple placeholder logo
- Tailwind configured in `tailwind.config.js` and `src/index.css`

This is a starter; wire real authentication later by replacing the submit handler in `Login.jsx`.