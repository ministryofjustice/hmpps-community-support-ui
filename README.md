# hmpps-community-support-ui

[![Ministry of Justice Repository Compliance Badge](https://github-community.service.justice.gov.uk/repository-standards/api/hmpps-community-support-ui/badge?style=flat)](https://github-community.service.justice.gov.uk/repository-standards/hmpps-community-support-ui)
[![Docker Repository on ghcr](https://img.shields.io/badge/ghcr.io-repository-2496ED.svg?logo=docker)](https://ghcr.io/ministryofjustice/hmpps-community-support-ui)

The front end repository for the HMPPS Community Support service, also know as CRS Recommissioning.

## Instructions

## Running the app via docker-compose

The easiest way to run the app is to use docker compose to create the service and all dependencies.

`docker compose pull`

`docker compose up`

This builds `hmpps-community-support-api` from a sibling `../hmpps-community-support-api`
checkout. If you don't have that checkout, or just want the latest published API instead,
use `docker-compose-api-ghcr.yml` instead (see below).

### Running the app for development

Create an environment file by copying `.env.example` -> `.env`
Environment variables set in here will be available when running `start:dev`

Install dependencies using `npm install`, ensuring you are using `node v24`

Note: Using `nvm` (or [fnm](https://github.com/Schniz/fnm)), run `nvm install --latest-npm` within the repository folder
to use the correct version of node, and the latest version of npm. This matches the `engines` config in `package.json`
and the github pipeline build config.

And then, to build the assets and start the app with esbuild:

`npm run start:dev`

The UI itself always runs on the host this way (never in a container) - the compose files
below only ever provide its dependencies, plus optionally a copy of the API.

### Choosing how the API runs

There are three ways to run `hmpps-community-support-api` alongside the UI, depending on
what you're working on. Each has its own `npm run` script that starts the right dependency
stack in Docker and then starts the UI itself with hot reload (esbuild watch mode) - no
manual `docker compose` commands needed for day-to-day use.

| Scenario | Command | Compose file used | API |
| --- | --- | --- | --- |
| Developing a UI-only feature, don't need real API responses | `npm run start:dev` | `docker-compose.yml` (builds API from `../hmpps-community-support-api`) | wiremock stub |
| Developing a UI feature against the latest published API | `npm run start:dev:local` | `docker-compose-api-ghcr.yml` | latest GHCR image, no sibling checkout needed |
| Developing a feature across both repos at once | `npm run start:dev:api-feature` | `docker-compose-localapi.yml` | run separately, e.g. IntelliJ with the `local` Spring profile |

```bash
# UI-only work, full stack built from source (default docker-compose.yml)
npm run start:dev

# UI-only work against the latest published API (no sibling API checkout needed)
npm run start:dev:local

# Feature work across both repos - start the API yourself first (e.g. IntelliJ,
# `local` Spring profile, listening on :8080), then:
npm run start:dev:api-feature
```

Each script brings up its dependency stack with `docker compose -f <file> up -d`, then runs
`node esbuild/esbuild --watch` against a matching env file (`local.env` /
`api-feature.env`) so `COMMUNITY_SUPPORT_API_URL` points at the right place. The UI keeps
hot-reloading on file changes exactly as with plain `start:dev`. The underlying Docker stacks
stay up between runs - stop them yourself with `docker compose -f <file> down` when you're
done, or `docker compose down` for the default stack.

For the `start:dev:api-feature` scenario, the API's `local` Spring profile uses
`http://hmpps-auth:8090/auth`, so ensure `hmpps-auth` resolves to `127.0.0.1` on your machine
(for example via `/etc/hosts`).

### Logging in with a test user

`AUTH_USER` / `password123456` has no roles and will be rejected by this app's role check
(`allowedRoles`). Use the delius-sourced wiremock test user instead, which is granted
`ROLE_PROBATION` by HMPPS Auth:

username: bernard.beaks
password: secret

Note: `.env.example`'s `AUTH_CODE_CLIENT_ID`/`CLIENT_CREDS_CLIENT_ID` must match real clients
seeded in HMPPS Auth's `auth-db` (`hmpps-community-support-ui-1` and
`hmpps-community-support-ipb-ui-client-1`), not the placeholder `clientid`.

### Creating local test users with custom roles

Once any of the stacks above is up, `script/local-user-setup` creates a fully working local
HMPPS Auth user (password set, no email step required) with whichever roles you need,
entirely offline (no GOV.UK Notify/real Delius/Nomis dependency):

```bash
script/local-user-setup [email] [ROLE1,ROLE2,...]
# defaults: local.tester@digital.justice.gov.uk / password123456 /
#           COMMUNITY_SUPPORT_REFERRER,COMMUNITY_SUPPORT_PROVIDER
```

It works no matter which of the three stacks above you're running, and is safe to re-run
(idempotent) - useful for local development and as a repeatable way to seed e2e test users.
On first login you'll see a one-off "verify your email" nag - skip it to continue.

### Run linter

- `npm run lint` runs `eslint`.
- `npm run typecheck` runs the TypeScript compiler `tsc`.

### Run unit tests

`npm run test`

### Running integration tests

For local running, start a wiremock instance by:

`docker compose -f docker-compose-test.yml up`

Then run the server in test mode by:

`npm run start-feature` (or `npm run start-feature:dev` to run with auto-restart on changes)

After first install ensure playwright is initialised:

`npm run int-test-init`

And then either, run tests in headless mode with:

`npm run int-test`

Or run tests with the UI:

`npm run int-test-ui`

### Slack channel for pipeline security notifications

Ths channel should be specific to your team and is for daily / weekly security scanning job results. It is your team's
responsibility to keep up-to-date with security issues and update your application so that these jobs pass. You will
only be notified if the jobs fail. The scan results can always be found in GitHub actions and results are sent to the GitHub security tab. This is
configured by setting GitHub actions environment variable called `SECURITY_ALERTS_SLACK_CHANNEL_ID`.

## Change log

A changelog for the service is available [in this document.](./CHANGELOG.md)

## Content Middleware

A content middleware is setup to inject content from the content file in ./assets/content/content.json where the request
path or subpath matches a defined path in the content file. i.e a request to the path /home/help would inject content from both "/home" and "/home/help"

Where the path includes a path param such as a UUID or Case Reference the content middleware will strip this to find the
relevant match and maintain consistency between the defined express route. This means that all requests whether generating by the service
or added via integration tests must use params that match the format of the intended param and not a random string otherwise the content middleware
will not parse this correctly and will fail.
