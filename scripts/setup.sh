#!/usr/bin/env bash
set -euo pipefail

# muutto setup script for local development and Codex environments

# 1. Ensure Node.js >=18 is available
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found. Installing via nvm..."
  if ! command -v nvm >/dev/null 2>&1; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \ . "$NVM_DIR/nvm.sh"
  fi
  nvm install 18
  nvm use 18
fi

# If Node is installed but old, upgrade using nvm
NODE_MAJOR=$(node -v | cut -d'.' -f1 | tr -d 'v')
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Upgrading Node.js to v18 using nvm..."
  if ! command -v nvm >/dev/null 2>&1; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \ . "$NVM_DIR/nvm.sh"
  fi
  nvm install 18
  nvm use 18
fi

# 2. Install npm dependencies
if [ ! -d node_modules ]; then
  echo "Installing npm packages..."
  npm install
fi

# 3. Install Supabase CLI if missing
if ! command -v supabase >/dev/null 2>&1; then
  echo "Installing Supabase CLI globally..."
  npm install -g supabase
fi

# 4. Prepare local environment variables
if [ ! -f .env.local ]; then
  cat <<'EOV' > .env.local
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
EOV
  echo "Created .env.local. Please fill in your Supabase and OpenAI credentials."
fi

# 5. Apply database migrations if Supabase CLI is available
if command -v supabase >/dev/null 2>&1; then
  echo "Applying Supabase migrations..."
  supabase db reset --no-verify-auth > /dev/null
fi

cat <<'EOM'
Setup complete! You can now run:
  npm run dev       # start development server
  npm run lint      # check code style
  npm run build     # create production build
EOM
