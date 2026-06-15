# TFC School

Full-stack school management platform for a small private school in Algeria. It includes separate access points for admins, teachers, and students, JWT authentication, role-based authorization, student and teacher profiles, attendance tracking, and parent email notification support for absences.

## Project Structure

```text
tfc-school-platform/
  client/                 React + Vite + Tailwind frontend
    public/
    src/
      api/
      components/
      context/
      layouts/
      pages/
      styles/
  server/                 Node.js + Express + MongoDB backend
    scripts/seed.js
    src/
      config/
      middleware/
      models/
      routes/
      utils/
      validators/
```

## Features

- `/admin` secure admin dashboard with totals, attendance stats, user management, profiles, and reports.
- `/teacher` secure teacher dashboard with assigned students, one-click Present/Absent attendance, and optional notes.
- `/student` secure student dashboard with profile details and attendance history.
- JWT login with role checks for every protected route.
- Password hashing with bcrypt.
- Input validation with Zod.
- MongoDB persistence with seed data.
- SMTP email notification hook when a student is marked absent.
- One-service deployment support with Render.
- Configurable school logo through `VITE_SCHOOL_LOGO`.
- RFID attendance station for card-based presence marking.

## Local Setup

Prerequisites:

- Node.js 20+
- MongoDB running locally, or a MongoDB Atlas connection string

Install dependencies:

```bash
npm install
npm run install:all
```

Check environment files:

- `server/.env`
- `client/.env`

The included development defaults use `DEMO_MODE=true`, so you can test immediately without MongoDB. For real storage, set `DEMO_MODE=false`, run MongoDB, then use `MONGO_URI=mongodb://127.0.0.1:27017/tfc-school`. Before real use, change `JWT_SECRET` and configure SMTP.

Seed test data when `DEMO_MODE=false`:

```bash
npm run seed
```

Run the app:

```bash
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:5000/api/health`

## School Logo

To use the real school logo, place it in `client/public/school-logo.png`, then set:

```env
VITE_SCHOOL_LOGO=/school-logo.png
```

Restart the app after changing the logo.

## Publish Online

See [DEPLOYMENT.md](DEPLOYMENT.md) for the live deployment steps.

## Test Accounts

| Role | Login URL | Email | Password |
| --- | --- | --- | --- |
| Admin | `/admin/login` | `admin@tfcschool.dz` | `Admin@12345` |
| Teacher | `/teacher/login` | `teacher.english@tfcschool.dz` | `Teacher@12345` |
| Student | `/student/login` | `student.amine@tfcschool.dz` | `Student@12345` |

## RFID Attendance

The app supports USB RFID readers that work in keyboard-wedge / HID mode. The reader types the card code into the active field.

Routes:

- `/rfid-attendance` for admin/teacher card scans
- `POST /api/rfid/scan` for marking a card as Present

Demo card codes:

```text
TFC1001
TFC1002
TFC1003
```

To register a real card, log in as Admin, edit a student profile, focus the `RFID card` field, tap the card, then save. The platform stores a hashed card value and only displays the last 4 characters.

## Notifications

Absence emails are sent via the **SendGrid HTTP API** (not Nodemailer/SMTP). This works reliably on Render free tier because it uses HTTPS port 443 rather than SMTP ports that are often blocked.

### Required environment variables on Render

```env
NOTIFICATIONS_ENABLED=true
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx   # Your SendGrid API key
SMTP_USER=no-reply@yourdomain.com          # Sender email — must be verified in SendGrid
SCHOOL_NAME="TFC Training Formation Center"
SCHOOL_SHORT="TFC"
SCHOOL_PHONE="+213 561 502 098"
```

### How to get a SendGrid API key

1. Create a free account at sendgrid.com
2. Go to Settings → API Keys → Create API Key (Mail Send permission)
3. Verify your sender email under Settings → Sender Authentication
4. Add the key and sender email to your Render environment variables

### Test email without marking a student absent

POST to `/api/admin/test-email` (admin auth required):

```json
{ "to": "your@email.com" }
```

The response includes a config status object so you can see exactly which env vars are missing.

### SMS notifications (optional)

SMS absence alerts are supported via Infobip. Add these vars to enable:

```env
INFOBIP_API_KEY=your_key
INFOBIP_BASE_URL=your_hostname.api.infobip.com
SMS_SENDER=TFCSchool
```

## Security Notes

- Replace the development `JWT_SECRET` before real deployment.
- Use HTTPS in production.
- Use strong passwords for all real accounts.
- Keep `.env` files out of source control.
- Create a backup plan for MongoDB before storing real student data.
