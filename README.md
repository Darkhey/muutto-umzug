# muutto

**muutto** is a modular relocation assistant for the German market. It helps households organise every step of moving house with shared tasks, reminders and checklists. The app is built with React, TypeScript and Vite on the frontend and uses Supabase for authentication and data storage.

![Navigation overview](public/placeholder.svg)

## Project info

**URL**: https://lovable.dev/projects/5408f1d3-0599-4d20-b60a-e9dc3f50050e

## Prerequisites

- Node.js 18 or later
- npm
- A Supabase project for storing user data

## Environment variables

The application requires access to your Supabase instance. Create a `.env.local` file in the project root and provide your credentials:

```bash
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
STRIPE_SECRET_KEY=<your-stripe-secret>
STRIPE_PRICE_ONE_TIME=<price-id-one-time>
STRIPE_PRICE_MONTHLY=<price-id-monthly>
STRIPE_WEBHOOK_SECRET=<webhook-secret>
FRONTEND_URL=<http://localhost:5173>
```

These variables are read by the Supabase client and Stripe edge functions. Ensure they are set in your environment before running the app.

## Quick setup

To automatically install dependencies and prepare the local environment, run:

```bash
./scripts/setup.sh          # install deps and apply migrations
./scripts/setup.sh --fresh  # additionally reset the local database
```

The script installs Node.js (via `nvm` if necessary), downloads npm packages, installs the Supabase CLI and creates a `.env.local` file with placeholder values. Pass `--fresh` to wipe and recreate the local Supabase database before applying migrations.

## Available scripts

`package.json` exposes several npm scripts that help during development:

- `npm run dev` – start the Vite development server
- `npm run build` – create a production build
- `npm run build:dev` – build with development mode
- `npm run preview` – preview a production build locally
- `npm run lint` – run ESLint over the project

## Running the dev server

Install the dependencies and start the server:

```bash
npm install
npm run dev
```

## Linting

To check the codebase with ESLint run:

```bash
npm run lint
```

## How can I edit this code?

There are several ways of editing your application.

### Use Lovable

Simply visit the [Lovable Project](https://lovable.dev/projects/5408f1d3-0599-4d20-b60a-e9dc3f50050e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

### Use your preferred IDE

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd muutto-umzug

# Step 3: Install the necessary dependencies.
npm install

# Step 4: Start the development server.
npm run dev
```

### Edit a file directly in GitHub

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

### Use GitHub Codespaces

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5408f1d3-0599-4d20-b60a-e9dc3f50050e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

