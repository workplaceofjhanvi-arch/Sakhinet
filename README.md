# Sakhinet

Sakhinet is a verified, anonymous help network for girls inside schools and colleges. With one tap, a girl who needs a pad or is dealing with period cramps alerts trusted volunteers from her own campus. It includes a washroom planner, a rewards system for helpers, and a dashboard that shows colleges where shortages happen.

## Status

Working prototype built for the Hack Social challenge.

Implemented:
- Per-college communities (each college has its own data)
- Pad and cramp help requests, volunteer accept, two-sided confirmation
- Points and badges for volunteers, leaderboard
- Washroom list with ratings, filters and problem reports
- College dashboard with anonymous totals
- Mobile app (Expo, React Native) for requests, washrooms and rewards

Planned (not built yet):
- SMS fallback when there is no data connection
- Bluetooth mesh for phone-to-phone alerts when there is no network
- Offline storage of the washroom map and private pain tracker
- Login with college ID or email verification

## Tech stack

- Backend: Node.js, Express
- Database: Supabase (PostgreSQL)
- Mobile app: React Native with Expo

## Project structure

```
Sakhinet/
  backend/
    server.js
    supabaseClient.js
    routes/
    tests/
    .env.example
  frontend/
  database/
    schema.sql
    sample-data.sql
  docs/
    TECHNICAL_DESIGN.md
  LICENSE
  README.md
```

## Setup

Requirements: Node.js 18 or newer, Git, a free Supabase account, and the Expo Go app on your phone.

1. Clone the repository

```
git clone https://github.com/workplaceofjhanvi-arch/Sakhinet.git
cd Sakhinet
```

2. Create the database

Create a free project at supabase.com. Open the SQL Editor, paste the contents of `database/schema.sql`, and run it. Then run `database/sample-data.sql` to add demo data.

3. Set up the backend

```
cd backend
npm install
copy .env.example .env
```

Open the new `.env` file and fill in your own values (see the table below).

4. Start the backend

```
npm run dev
```

The server runs at http://localhost:5000. Open http://localhost:5000/api/health to check it.

5. Start the mobile app

```
cd ../frontend
npm install
npx expo start
```

In `frontend/App.js`, set `API_URL` to your laptop's IP address (for example `http://192.168.1.5:5000`), and set `COLLEGE_ID` and `VOLUNTEER_ID` to ids from your sample data. Scan the QR code with Expo Go. Your phone and laptop must be on the same Wi-Fi.

## Environment variables

Set these in `backend/.env`. A template is in `backend/.env.example`. Never commit the real `.env` file.

| Variable | Description |
|---|---|
| PORT | Port the API runs on (default 5000) |
| NODE_ENV | development or production |
| SUPABASE_URL | Project URL from Supabase, Project Settings, API |
| SUPABASE_KEY | Supabase API key (keep it private) |
| JWT_SECRET | Long random text, reserved for login tokens |

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/health | Server status |
| GET | /api/colleges | List colleges |
| POST | /api/requests | Create a pad or cramp request |
| GET | /api/requests?college_id= | Open requests for a college |
| POST | /api/users | Create a user |
| GET | /api/users/:id | Get a user |
| POST | /api/responses | Volunteer accepts a request |
| POST | /api/responses/:id/confirm | Requester or volunteer confirms help; points are given when both confirm |
| GET | /api/washrooms?college_id= | List washrooms (filters: has_water, has_dustbin, has_pads) |
| POST | /api/washrooms | Add a washroom |
| POST | /api/washrooms/:id/report | Report a problem |
| GET | /api/rewards/leaderboard?college_id= | Top helpers and badges |
| GET | /api/dashboard?college_id= | Anonymous request statistics |

## Tests

Start the backend, then in a second terminal run:

```
cd backend
npm test
```

The tests use the sample data in `database/sample-data.sql`. See `docs/TECHNICAL_DESIGN.md` for the test cases.

## Known limitations

This is a prototype. Login is not enforced yet, and row level security is turned off for the demo database. Before real use, add authentication and enable row level security.

## License

MIT, see the LICENSE file.