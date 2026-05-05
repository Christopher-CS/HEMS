# HEMS Backend + Mobile Integration Plan

This document describes how to connect the **Apps/Mobile** app to the presumed **Backend** so that all local-first features remain available while using the server as the source of truth for reads, writes, and real-time updates.

It is grounded in the state of the repo on the **`Chris`** branch (mobile fully local-first; backend on that branch was minimal at time of writing) and the unmerged **`dev-matt-backend`** branch (devices, profiles, scenes, commands over HTTP). Merge and extend as described below.

---

## 0. Prerequisites & branch strategy

### 0.1 Branch baseline

- **`Chris` (current)**: Mobile app is local-first with mock/HTTP/socket layers, repositories, and domain stores.
- **`dev-matt-backend` (unmerged)**: Adds `controllers/{device,command,profile,scene}Controller.js`, `routes/*`, `models/{Profile,Scene}.js`, and wires them in `server.js`. Controllers assume `req.user._id` but ship **no auth middleware** and **no socket layer**.
- **Assumption**: One merge of **`dev-matt-backend` into `Chris` (or `main`)** with conflict resolution on `server.js`, `package.json`, and models. Everything below is incremental on that merge.

### 0.2 Decisions to lock first (small, reversible)

1. **Device ID type**: Prefer **string `_id`** end-to-end (mobile already uses slugs like `light-office-…`). After merge, remove or fix any controller code that assumes Mongo `ObjectId` for device/owner everywhere.
2. **Auth for v1**: Add a **`devAuth` middleware** that sets `req.user = { _id: process.env.DEV_USER_ID }` for all `/api` routes. Replace with Clerk/JWT in a later phase.
3. **Transport split**: **HTTP** for CRUD + initial reads; **Socket.io** for low-latency commands and live `device:state` pushes (mobile already expects a socket path when `transportMode === 'socket'`).
4. **Source of truth**: **Backend wins**. Mobile may update optimistically; **reconcile** when the server echoes state (HTTP response or socket `device:state`).

---

## 1. API contract (single source of truth)

Mobile and backend should implement the same contract. Suggested locations: `Backend/README.md`, `Apps/Mobile/services/transport/types.ts`, and this repo’s `docs/` (this file + a future `docs/api-contract.md` if you split details out).

### 1.1 REST (`/api`)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/devices` | List devices for current user |
| `POST` | `/devices` | Connect device (Add device flow) |
| `GET` | `/devices/:id` | Single device |
| `GET` | `/devices/:id/state` | State subset |
| `PUT` | `/devices/:id` | Update metadata/capabilities |
| `PATCH` | `/devices/:id/status` | Online flag |
| `DELETE` | `/devices/:id` | Disconnect device |
| `GET` | `/profiles` | List profiles |
| `POST` | `/profiles` | Create profile (guest) |
| `PUT` | `/profiles/:id` | Update profile |
| `DELETE` | `/profiles/:id` | Delete profile |
| `GET` | `/scenes` | List scenes (optional `?profile=:id`) |
| `POST` | `/scenes` | Create scene |
| `PUT` | `/scenes/:id` | Update scene |
| `DELETE` | `/scenes/:id` | Delete scene |
| `POST` | `/scenes/:id/execute` | Apply scene (batch commands) |
| `POST` | `/commands` | Single command over HTTP (fallback when socket down) |
| `GET` | `/library` | Media catalog |

**Note:** Mobile HTTP clients already target **`/api/devices`** and **`/api/library`**. Backend routes on `dev-matt-backend` use singular paths (`/api/device`, etc.); **standardize on plural** to match the app.

### 1.2 Socket.io

| Direction | Event | Purpose |
|-----------|-------|---------|
| client → server | `client:identify` | Join profile room (`{ profileId }`) |
| client → server | `command:issue` | Issue command with ack (`{ id, envelope, backend }`) |
| server → client | `device:state` | Push reconciled device snapshot |
| server → client | `scene:applied` | Optional: scene execution summary |
| server → client | `library:updated` | Optional: later for recents/catalog changes |

Mobile `socket-transport.ts` emits `command:issue` and expects an ack with `ok` / `error`. The **`id`** in the payload should be echoed in the ack for correlation.

---

## 2. Backend work

### 2.1 Dependencies

- `socket.io` (HTTP server + same port)
- Dev: `jest`, `supertest` (and optionally `mongodb-memory-server` for CI)

### 2.2 Auth middleware

- `Backend/middleware/devAuth.js`: attach `req.user` from `DEV_USER_ID`.
- Mount **before** all protected `/api` routers.

### 2.3 Model extensions (align with mobile `DeviceSnapshot`)

**Device** — add or align:

- `kind`: `tv` | `light` | `speaker` | `generic` (display / defaults; capability checks still use `capabilities`).
- **Capabilities**: e.g. `colorable`, `inputSelectable`, plus existing `playbackControllable` / `navigatable` as used by command handlers.
- **Color** (lights): `mode` (`white` | `color`), `kelvin`, `hue`, `saturation`.
- **Input**: `current` + `available[]` for TV/speaker.
- **Playback**: ensure `playbackState` (and `level.step` if `incrementLevel` / `decrementLevel` reference it) exist in schema where handlers expect them.
- **`subtitle`**: optional string for UI.

**Profile** — add:

- `role`: `main` | `guest`
- `parent`: ref to another profile (guest under main)

**Scene** — add:

- `profile`: ref to `Profile` (per-profile scene lists)

**Library (Phase A)** — static seed module or JSON; **Phase B** — optional Mongo collections for music/movies/podcasts/recents.

### 2.4 Command controller (`commandController.js`)

Extend **`capabilityMap`**, **`payloadValidators`**, **`applyPayload`** for anything the mobile mapper sends today that is missing, for example:

- `seekTo` → `{ positionSeconds }`
- `setColorMode`, `setColorTemperature`, `setHue`, `setSaturation`
- `setInputSource`
- `playMedia`, `queueMedia`, `previewMedia` (library commands)

Prefer **reusing** existing backend command types (`navigate`, `playback`, `togglePower`, `setLevel`, …) instead of inventing parallel vocabularies.

**Do not** implement `CONNECT_DEVICE` / `DISCONNECT_DEVICE` as socket commands — use **`POST /devices`** and **`DELETE /devices/:id`**.

### 2.5 Refactor for reuse

Extract core of single-command execution into something like **`runCommand({ deviceId, type, payload }, user)`** used by:

- `POST /api/commands`
- Socket handler for `command:issue`

### 2.6 `server.js`

- Create Node `http.Server` from Express `app`.
- Attach `socket.io` to that server.
- Register API routes + CORS + JSON body parser.
- Seed / health route as needed.

### 2.7 Seed scripts

- User + main profile matching `DEV_USER_ID` / optional `DEV_PROFILE_ID`
- Default devices mirroring mobile seed IDs where possible (`living-room-tv`, `ambiance`, `sound-system`)
- Library seed (port from mobile `data/media-library` or equivalent)

---

## 3. Mobile work

### 3.1 Runtime config (`services/config/runtime.ts`)

Already has `backendUrl`, `transportMode`, `librarySource`, `devicesSource`. Add as needed:

- `profilesSource`, `scenesSource` (`mock` | `http`)
- Optional env for **default profile** or **socket identify** payload

### 3.2 Repositories

Add the same pattern as devices/library:

- `profiles-repository` (+ mock + HTTP)
- `scenes-repository` (+ mock + HTTP)

Extend **`mappers.ts`** so `mapDevice` maps server device → full `DeviceSnapshot` (kind, color fields, input sources, enabled/level).

### 3.3 State

- **`devices`**: keep optimistic updates; add **reconciliation** from socket `device:state` or refetch after writes.
- **Profiles**: extract from devices store if still embedded; hydrate from `/api/profiles`; **persist `activeProfileId`** (e.g. AsyncStorage).
- **Scenes**: replace hardcoded `PROFILE_SCENES` with hydrated data; **apply scene** calls `POST /api/scenes/:id/execute` (or equivalent) instead of only local reducer merge.

### 3.4 Transport (`socket-transport.ts` + `command-mapping.ts`)

- On connect: emit **`client:identify`** with active profile.
- Subscribe to **`device:state`** (and optionally `scene:applied`) and feed stores.
- **HTTP fallback** for commands when socket is disconnected (optional but recommended).

**Command mapping audit** — align mobile tokens with backend `type` + `payload` (examples):

| Mobile | Backend type | Notes |
|--------|----------------|-------|
| `POWER_TOGGLE` | `togglePower` | |
| `PLAY` / `PAUSE` | `playback` | `{ action }` |
| `SEEK_TO` | `seekTo` | `{ positionSeconds }` |
| `VOLUME_*` / `CHANNEL_*` | `incrementLevel` / `decrementLevel` | Include `target` if backend expects it |
| D-pad / back / home | `navigate` | `{ direction }` |
| Color / input / library | dedicated types above | |
| Connect / disconnect | **HTTP only** | not command tokens |

### 3.5 Screens

- **Home**: connect “Add device” / “Disconnect” to HTTP; scene cards to scene execute endpoint; keep UI the same.
- **Library**: already uses `librarySource`; verify response shape vs `mapLibraryPayload`.
- **Remote**: benefits from corrected `command-mapping`.
- **Settings / TopBar**: profiles from server when `profilesSource=http`.

---

## 4. Feature matrix (every local feature → backend)

| Feature | Local store | Backend |
|---------|-------------|---------|
| Power toggle | `devices` | Command: `togglePower` / `power` |
| Level (volume/brightness) | `devices` | Command: `setLevel` (or increment/decrement) |
| Light white/color, temp, hue/sat | `devices` | Commands: `setColorMode`, `setColorTemperature`, `setHue`, `setSaturation` |
| Input source | `devices` | Command: `setInputSource` |
| Add / remove device | `devices` | `POST` / `DELETE` `/devices` |
| Apply scene | `devices` / scenes | `POST` `/scenes/:id/execute` + `device:state` |
| Switch profile | profiles | Persist locally + `client:identify`; optional refetch scenes |
| Library lists | `library` | `GET` `/library` |
| Play / queue / preview | playback + library | Commands: `playMedia`, `queueMedia`, `previewMedia` |
| Remote (DPad, etc.) | transport | `navigate`, `playback`, level commands |
| Debug mock / latency / fail | `debug` | No backend (mock only) |
| Command log | `debug` | Populated by transport `onCommand` |

---

## 5. Phased rollout

**Phase A — Backend stand-up**

1. Merge `dev-matt-backend`.
2. Add `devAuth`, plural routes, library route, schema fixes, `runCommand` extraction.
3. Add Socket.io + `command:issue` handler + `device:state` broadcast.
4. Seeds + manual `curl`/socket smoke.

**Phase B — Mobile read path**

5. Extend mappers; set `devicesSource=http`, `librarySource=http` in a dedicated build/extra config.
6. Verify Home + Library render from API.

**Phase C — Mobile write path**

7. Fix `command-mapping`; wire add/remove device to HTTP; enable `transportMode=socket` for live profile.
8. Reconcile state from socket pushes.

**Phase D — Profiles & scenes**

9. Repositories + stores; replace hardcoded scenes; scene execute from server.

**Phase E — Hardening**

10. Reconnect UX, HTTP command fallback, persistence of active profile (and optional device snapshot cache).
11. Replace `devAuth` with real auth when ready.

---

## 6. Tests & safety

**Backend**

- Unit tests per command type (validate + apply + persist).
- Integration: `POST /commands` and socket `command:issue` produce same device state.
- Contract: `GET /library` matches mobile `RawLibraryPayload` expectations.

**Mobile**

- Extend transport / repository tests for new mappings and endpoints.
- Keep **mock mode** as instant rollback (`transportMode=mock`, `*_Source=mock` in config).

---

## 7. Open questions

1. **IDs**: Strict string IDs vs Mongo `ObjectId` for devices/users — pick one and make controllers consistent.
2. **Color API**: Two commands (`setHue`, `setSaturation`) vs one `setColor` — pick for fewer round trips vs simpler validation.
3. **Remote extras** (`OPEN_NUMBER_PAD`, `OPEN_LIVE_GUIDE`): map to `navigate`, new type, or drop for v1.
4. **Library**: static seed first vs Mongo from day one.
5. **Auth**: Clerk vs custom JWT — affects user id shape and middleware.

---

## Document history

- **Created**: Integration plan distilled from implementation discussion; intended to stay in version control for sharing with teammates and tracking execution.
