# BitCrew Network website

React + Vite front end, Express API, MongoDB, Cloudinary image uploads, and an admin dashboard that controls the site's content.

```
bitcrew-network/
├─ client/   React + Vite (public site + /admin dashboard, GSAP animation)
└─ server/   Express API (auth, content, uploads, forms, SEO) + serves the built client
```

## 1. Set up

Requirements: Node 18.18+, a MongoDB database ([MongoDB Atlas](https://www.mongodb.com/atlas) free tier works), a free [Cloudinary](https://cloudinary.com) account.

```bash
npm install                      # installs client + server (npm workspaces)
cp server/.env.example server/.env
```

Edit `server/.env`:

| Variable | What it is |
|---|---|
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Long random string (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin login (password 10+ characters). Created automatically on first start |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | From the Cloudinary dashboard |
| `SMTP_*`, `NOTIFY_EMAIL` | Optional. Emails you when a form is submitted |

Load the starter services, programmes, outreach projects and founder profile (only fills empty collections):

```bash
npm run seed
```

## 2. Run

```bash
npm run dev
```

- Website: http://localhost:5173
- Dashboard: http://localhost:5173/admin
- API: http://localhost:5000/api

## 3. Production

```bash
npm run build     # builds client/dist
npm start         # Express serves the API AND the built site on one port
```

Set `NODE_ENV=production`, `SITE_URL=https://your-domain`, and a strong `JWT_SECRET`. Works on Render, Railway, Fly.io or any Node host. One service, one origin, so the login cookie needs no CORS setup.
Hosting the client separately (Netlify/Vercel)? Set `VITE_API_URL` at build time and `CLIENT_URL` on the server, and serve both over HTTPS.

## 4. Using the dashboard

| Section | Controls |
|---|---|
| **Page content** | Every heading, subtitle, paragraph, button label and link, header images, brand name/tagline/logo, contact details, social links, SEO description, share image, stats, privacy notice. "Reset to original" restores the brief's copy |
| **Services** | Name, description, image, and availability: *Available to clients / Community activity / Planned* |
| **Academy** | Programmes and webinars with status *Open / Coming soon / Planned / Past*, date, link |
| **Projects** | Outreach and projects, cover image, extra photos, impact figure with a *verified* switch |
| **Gallery** | Photos for the hero cards (tick *Show in hero*) and the rotating 3D gallery |
| **Team, Partners** | People and partner logos |
| **Inbox** | Contact, service, partnership and community-join submissions. Search, filter, archive, reply, export CSV |
| **Password** | Change your password |

Every list can be re-ordered, hidden without deleting, edited or removed. Replaced or deleted images are removed from Cloudinary automatically.

With no photos uploaded the site shows generated "bit-grid" tiles and uses your services in the rotating gallery, so it never looks empty.

## 5. Things to confirm before launch

- **Service availability.** Seeded as: design, web and media = *Available to clients*; education and collaboration = *Community activity*. The brief says to advertise only what the team can deliver. Confirm with the founder.
- **The 8,000+ students figure** is shown as *Founder-reported* until you tick *verified* on a project or change the note under Page content → Numbers.
- **TikTok link.** The brief gives the name but no URL. Add it under Page content → Brand, contact and social links.
- **Privacy notice** is a plain starter. Have it reviewed.
- Add a location and phone under Brand settings if you want them shown.

## 6. Security notes

Sessions are httpOnly, SameSite=Lax cookies (7 days). Passwords are bcrypt-hashed. Login, forms and uploads are rate limited. All admin input is validated and stripped against a schema; link fields reject `javascript:` URLs; uploads are image-only, 8 MB max; CSV export neutralises spreadsheet formulas; form spam gets a honeypot; Helmet sets a strict Content-Security-Policy.

## 7. How content editing works (for developers)

`server/src/content/schema.js` defines each editable section's fields; `defaults.js` holds the starting copy; `entities.js` defines repeatable collections. The dashboard builds its forms from that same schema, and the server validates against it. To make a new piece of text editable: add a field to the schema, add its default, read it with `useContent('section.key')`.
