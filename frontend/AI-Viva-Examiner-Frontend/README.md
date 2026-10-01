# Viva — AI Viva Examiner

Responsive React + TypeScript mock frontend. The app runs without a backend.

## Setup
```bash
npm i
npm run dev
```
Open the Vite URL, usually http://localhost:5173. For a production build run `npm run build`.

Chrome or Edge on desktop is recommended. Camera, microphone and screen sharing require browser permission; HTTPS is required in production (localhost is allowed). Speech recognition is browser-dependent and typing remains available.

## Backend integration
Replace the mock implementations in `src/services.ts` while keeping the service interfaces and event contract in `docs/events.md`. `VITE_API_URL` and `VITE_WS_URL` are reserved for the API/WebSocket transport.
