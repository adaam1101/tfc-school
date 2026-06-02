# Publish TFC School

This app can be published as one Render web service. Render runs the Express API and serves the built React app from the same live URL.

## 1. Add The Real Logo

Put the real school logo in:

```text
client/public/school-logo.png
```

Then set this in `client/.env` for local testing:

```env
VITE_SCHOOL_LOGO=/school-logo.png
```

For Render, set the same environment variable:

```env
VITE_SCHOOL_LOGO=/school-logo.png
```

Restart the app after changing the logo.

## 2. Create The Online Database

Use MongoDB Atlas for the live database.

1. Create a free Atlas cluster.
2. Create a database user.
3. Allow network access for your hosting provider.
4. Copy the `mongodb+srv://...` connection string.

Official docs:

- MongoDB Atlas free cluster: https://www.mongodb.com/quickstart/free-atlas-cluster
- MongoDB connection strings: https://www.mongodb.com/docs/current/reference/connection-string/

## 3. Push The Project To GitHub

Create a private GitHub repository named `tfc-school`.

If Git is installed:

```bash
git init
git add .
git commit -m "Initial TFC School platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tfc-school.git
git push -u origin main
```

If Git is not installed, upload this project folder through the GitHub website.

## 4. Deploy On Render

1. Go to Render.
2. Create a new Blueprint or Web Service from the GitHub repo.
3. Render can use the included `render.yaml`.
4. Add the required environment variable:

```env
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/tfc-school
```

For real work, keep:

```env
DEMO_MODE=false
VITE_API_URL=/api
```

Official Render docs:

- Node/Express deployment: https://render.com/docs/deploy-node-express-app
- Environment variables: https://render.com/docs/environment-variables

## 5. Create Real Accounts

After the site is live, seed the database once from your computer with `DEMO_MODE=false` and the Atlas `MONGO_URI`, or create accounts from the Admin dashboard.

For the first live setup, you can temporarily set `DEMO_MODE=true` on Render to show the manager a quick demo, but do not use demo mode for real school data because demo data is not permanent.

## 6. Share The Manager Link

The manager should use:

```text
https://YOUR-RENDER-SITE.onrender.com/admin/login
```

After the manager logs in, change the default admin password by editing the admin user or creating a new admin account and deleting the test one.
