# Portfolio update

- Added detailed Work-page stories for Jarvis AI, CivicShield, both HackerRank Orchestrate challenge editions, GeoVex and Meta participation.
- Added problem statements, proposed solutions, workflows, outputs, technology tags and source/certificate navigation where information is available.
- Linked Jarvis AI to the IBM event and CivicShield to HACKDAY 1.0 using the supplied repositories.
- Added Meta team participation to the certification gallery without presenting the decorative image as a certificate.
- Replaced the certification-page portrait with an editable vector illustration matching the cream, navy and rust palette.
- Changed student-year wording to “2nd Year” throughout editable text.
- Added Node/Express, PostgreSQL schema, transactional repeatable seed, read-only project APIs, health endpoints, security headers and deployment configuration.
- Removed exported editor runtime scripts and corrected editable-file caching.
- Added certificate dialog focus containment and responsive project styles.

This package is prepared for deployment; it has not been published or connected to a managed production database.

- Added CampusLink to Work and project stories, with the live application link https://campuslink-rz6d.onrender.com.

## Deployment hardening

- Updated Render compute plan identifiers, colocated the app/database in Singapore and restricted the database to private networking.
- Added schema validation shared by browser and seed command, fallback for malformed API data, and safe handling of malformed URL fragments.
- Added source/asset checks and real-database desktop/mobile browser checks in GitHub Actions; subsequent Render releases wait for passing checks.
- Added Git upload instructions, a repository description, Node version selection and favicon.
