# Deeksha Kriti — Portfolio

The existing cream, navy and rust editorial portfolio, updated with detailed hackathon stories and a Node.js/Express backend that stores project details in PostgreSQL. Frontend: HTML, CSS and JavaScript. No frontend build step is required.

## Start locally

Use Node.js 22 LTS and PostgreSQL 17. Run these commands from this folder:

```bash
npm ci
cp .env.example .env
```

Create a PostgreSQL database and application user using your preferred database tool, then set `DATABASE_URL` in `.env` to your own connection string. The example password is a placeholder; never commit your real `.env`.

```bash
npm run db:migrate
npm run db:seed
npm start
```

Open http://localhost:3000. The server checks that the database is reachable and seeded before accepting traffic. `npm run dev` restarts the server when backend files change.

## Deploy on Render

1. Upload this folder's contents to a GitHub repository, with `package.json` at its root.
2. In Render, create a new Blueprint from that repository and select `render.yaml`.
3. Review the service and PostgreSQL plans before creating resources. The supplied Blueprint uses paid persistent resources; it has not been deployed by this update.
4. Render installs production dependencies, runs the migration and seed before release, starts the server and checks `/health/ready`. Subsequent automatic deploys wait for GitHub checks to pass. Both resources use Singapore; public database connections are disabled.
5. After deployment, open the assigned HTTPS URL and confirm the Work page, project stories, certificate gallery, mobile menu and email links.

For manual setup, use build command `npm ci --omit=dev`, pre-deploy command `npm run db:migrate && npm run db:seed`, start command `npm start`, and health path `/health/ready`. Set `NODE_ENV=production`, `TRUST_PROXY_HOPS=1`, `DATABASE_URL` to the database's internal connection string and `DATABASE_SSL=disable` for that internal connection. Configure service/database region and network access together.

For a database reached over an external network, use `DATABASE_SSL=verify-full`. If your provider uses a private CA, set `DATABASE_CA_FILE` to its certificate path. Connection-string SSL options are deliberately removed so they cannot disable certificate verification. Use the database provider's backup and restore facilities.

## Docker alternative

Install Docker Desktop on your Mac. Add a strong URL-safe `POSTGRES_PASSWORD` to `.env` (letters, digits, `_` and `-` work without URL encoding), then run:

```bash
docker compose up --build -d
```

Open http://localhost:3000. PostgreSQL uses a persistent Docker volume and is not exposed on a public port. `docker compose down` preserves the volume. Before a public launch, serve the app behind an HTTPS reverse proxy and set `TRUST_PROXY_HOPS` to the exact number of trusted proxies.

## Changes after deployment

Project stories live in `public/data/projects.json`. Edit each project's `problem`, `solution`, `workflow`, `output`, `technologies` and links, commit the change, and redeploy. The seed command upserts existing stories by slug and updates their content without duplicating rows. It preserves rows absent from the file; remove retired entries explicitly from the database and the snapshot when needed.

The Work page reads `/api/projects`. If the API is temporarily unavailable, it displays the bundled snapshot. Update the snapshot with every release so this fallback remains current. Direct database edits take effect immediately in the API but will be overwritten for matching slugs on the next seed; keep release content in the JSON file.

- `public/assets/certifications.js`: certificate descriptions, records and gallery links.
- `public/assets/ui-hJOf-9t6.js`: original shared page copy, navigation, contact details and summary work list. Search for `_PC`, `ei` and `Dc`.
- `public/skills/skills.json`: Skills page and homepage skill content.
- `public/assets/projects.css`: responsive project story styles.
- `public/media/img/credentials-studio.svg`: certification-page illustration; no portrait appears in that page's banner.

The homepage About portrait remains in place. Resume links are hidden until a resume path is supplied in `_PC.resume`.

## API and security

`GET /api/projects` returns ordered stories. `GET /api/projects/:slug` returns one story. `/health/live` checks the process; `/health/ready` verifies the project table contains data. Unknown resources return 404.

The public API is read-only. Content updates run through repository changes and the database seed command, so no public admin login or write endpoint is exposed. The server serves only `public/`, validates project identifiers, uses parameterised SQL, escapes project content in the browser, sets security headers, limits API request frequency and avoids exposing database error details. Editable assets revalidate so future deployments do not remain cached for a year. Run one application instance with the supplied in-memory rate limiter; use a shared limiter store if horizontally scaling.

## Validation

```bash
npm ci
npm run verify
npm audit --omit=dev
```

The tests exercise database seeding/upserts, API reads, invalid input, health checks, protected files, error responses, schema validation and frontend DOM interactions. `npm run check` validates JavaScript syntax, local asset references and project records. Database tests use PGlite's embedded PostgreSQL engine; a live managed database connection, provider release and Docker image must be checked in the target deployment environment. The GitHub Actions workflow also runs Playwright against the real PostgreSQL-backed server in desktop and mobile configurations. Browser execution is blocked by socket restrictions in this workspace, so those browser checks must pass in GitHub before release. To run them locally after setting up PostgreSQL: `npx playwright install chromium`, then `npm run test:e2e`.

## Content accuracy

Project text distinguishes hackathon prototypes, challenge submissions, proposed workflows and participation. Meta is recorded as team participation without adding an unprovided award or project result. Jarvis AI and CivicShield use the repository URLs supplied by Deeksha. Those repositories could not be retrieved during this update, so the text does not certify that every described workflow is implemented. GeoVex is presented as a flood-intelligence concept. Original supplied certificate scans remain unchanged.

Official deployment and security references: https://render.com/docs/blueprint-spec and https://expressjs.com/en/advanced/best-practice-security/.

## GitHub upload

See [DEPLOY.md](DEPLOY.md) for the terminal commands and exact Render settings. The repository description is in [REPOSITORY_DESCRIPTION.txt](REPOSITORY_DESCRIPTION.txt).
