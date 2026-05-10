Backend for HEMS

## Quick API checks

- `GET http://localhost:4000/` — health text  
- `GET http://localhost:4000/api/devices` — device list (seed with `node seed.js`)  
- `GET http://localhost:4000/api/library` — media catalog (same seed shape as the mobile app’s `RawLibraryPayload`)
