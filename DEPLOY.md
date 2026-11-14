# Push with Git and deploy

## 1. Create an empty GitHub repository

Sign in to GitHub as `DeekshaKriti07` and create a repository named `deeksha-portfolio`. Choose your preferred visibility. Leave “Add README”, `.gitignore` and license unchecked because this project already contains its files. Paste the description from `REPOSITORY_DESCRIPTION.txt`.

These instructions are for a new empty repository. If you already created the repository with another name, use its actual URL in the `git remote add` command.

## 2. Push from your Mac terminal

Extract the ZIP and open Terminal in the extracted `deeksha-portfolio` folder. `ls` should show `package.json`, `public`, `server` and `render.yaml`. Upload the project files, not the ZIP archive.

```bash
cd ~/Downloads/deeksha-portfolio
git init
git branch -M main
git add .
git diff --cached --name-only
git commit -m "Prepare portfolio for production deployment"
git remote add origin https://github.com/DeekshaKriti07/deeksha-portfolio.git
git push -u origin main
```

The ignore file excludes `node_modules`, real `.env` files, test reports, keys and logs. `.env.example` is safe to commit. Check the staged-file list before the commit. No actual database password or API key is supplied with this project.

GitHub requires an authenticated Git client. If you already push your other projects from this Mac, use your existing setup. If asked to authenticate, use GitHub's browser flow or GitHub CLI `gh auth login`; do not enter your GitHub account password into a token prompt. If Git asks for author details, configure your own name and GitHub verified or private email before repeating the commit.

## 3. Let GitHub checks run

Open the repository's Actions tab and wait for “Verify portfolio” to pass. It installs dependencies, checks source and assets, runs unit/integration tests, audits production dependencies, seeds a temporary PostgreSQL database and runs desktop/mobile browser checks. The temporary database password in that workflow is only a disposable CI credential.

## 4. Create the Render deployment

In https://dashboard.render.com, choose **New → Blueprint**, connect this repository and select `render.yaml`. Review the web-service and PostgreSQL plans shown by Render, then create the resources. This configuration uses paid persistent resources; no resources are created merely by pushing the code.

The Blueprint configures:

| Setting | Value |
| --- | --- |
| Runtime | Node.js 22 |
| Web plan | `0.5c-512mb` |
| PostgreSQL plan | `0.1c-256mb`, 1 GB storage |
| Region | Singapore for app and database |
| Build | `npm ci --omit=dev` |
| Pre-deploy | `npm run db:migrate && npm run db:seed` |
| Start | `npm start` |
| Health check | `/health/ready` |
| Subsequent auto-deploy | After GitHub checks pass |

The internal database URL is supplied automatically. You do not need to paste a database password into the repository. The database allows internal connections only.

## 5. Verify the live site

Open the HTTPS `onrender.com` URL assigned to the web service. Check Home, Work, Skills, Certifications, mobile navigation, certificate dialogs, and the CampusLink live button. Open `/health/ready`; it should return `{"status":"ready"}`. Open `/api/projects`; it should contain the project records.

## 6. Make later updates

Edit files, then run:

```bash
npm run verify
git add .
git diff --cached --name-only
git commit -m "Update portfolio content"
git push
```

GitHub checks run again. Render redeploys the linked branch after checks pass. Project stories are edited in `public/data/projects.json`; seeding updates existing records by slug. Keep JSON content in sync with any database edits because the next deployment reapplies the JSON version.

## Local preview with PostgreSQL

Install Node.js 22 and PostgreSQL 17. Run `npm ci`, copy `.env.example` to `.env`, and set `DATABASE_URL` to a database you created. Then run `npm run db:migrate`, `npm run db:seed` and `npm start`. Open http://localhost:3000.

## Troubleshooting

- **`src refspec main does not match any`:** the initial commit did not complete; check `git status` and finish the commit.
- **`remote origin already exists`:** check `git remote -v`. Keep the correct existing remote, or change it with `git remote set-url origin YOUR_REPOSITORY_URL`.
- **Push rejected because the remote contains work:** do not force-push. Use a new empty repository, or integrate that repository's changes in a proper checkout.
- **Render reports a missing project table:** confirm the pre-deploy command is configured and succeeded.
- **Database connection fails:** confirm the web service and database share a region, and `DATABASE_URL` references the internal connection string.
- **A change has not deployed:** open GitHub Actions first, then the Render deployment logs. Automatic deployments wait for checks to pass.

Official references: https://render.com/docs/blueprint-spec and https://docs.github.com/en/repositories/creating-and-managing-repositories/adding-locally-hosted-code-to-github.
