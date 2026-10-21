# Gestión de Formación · Frontend (SENA)

Vue 3 + Vite + Quasar + Pinia (+ persistedstate) + Vue Router + Axios + SweetAlert2.

    Vue 3 + Quasar -> Axios -> Backend Express -> Mongoose -> MongoDB Atlas

El frontend solo conoce la URL de la API (`.env`). Nunca se conecta a MongoDB.

## Usar
    npm install
    npm run dev          # http://localhost:5173

`.env`:
    VITE_API_URL=http://localhost:4500/api

## Logo del SENA (opcional)
Copia tu imagen en `public/logo-sena.png`. Si existe, se muestra en el menú
lateral y en el login; si no existe, se muestra la sigla "SENA" en texto.

## Reglas del proyecto
- Todas las alertas y validaciones usan SweetAlert2 (`src/utils/alert.js`).
- No hay `alert()`, `confirm()`, `required`, ni `type="email"`.
