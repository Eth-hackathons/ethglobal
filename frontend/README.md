# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/6206cd26-88a9-4336-9585-6b68aa77b223

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6206cd26-88a9-4336-9585-6b68aa77b223) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Next.js
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (for comments storage)

## Supabase Setup

This project uses Supabase to store comments for events. Follow these steps to set up Supabase:

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up or log in
2. Click "New Project"
3. Fill in your project details:
   - Name: Choose a project name
   - Database Password: Set a strong password (save this!)
   - Region: Choose the closest region to your users
4. Click "Create new project" and wait for it to be set up

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need two values:
   - **Project URL**: Found under "Project URL" (starts with `https://`)
   - **Service Role Key**: Found under "Project API keys" → "service_role" key (⚠️ Keep this secret!)

### 3. Create the Comments Table

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New query"
3. Run the following SQL to create the comments table:

```sql
-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  community_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create composite index for efficient querying
CREATE INDEX IF NOT EXISTS idx_comments_event_community
ON comments(event_id, community_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_comments_created_at
ON comments(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

4. Click "Run" to execute the SQL

### 4. Set Up Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Replace:

- `your_project_url_here` with your Project URL from step 2
- `your_service_role_key_here` with your Service Role Key from step 2

**Important**:

- Never commit `.env.local` to version control (it should already be in `.gitignore`)
- The `NEXT_PUBLIC_` prefix makes the URL available to client-side code
- The `SUPABASE_SERVICE_ROLE_KEY` should only be used server-side (it's not prefixed with `NEXT_PUBLIC_`)

### 5. Verify Setup

1. Restart your development server if it's running:
   ```sh
   npm run dev
   ```
2. Navigate to an event page and try posting a comment
3. Check your Supabase dashboard → **Table Editor** → `comments` to see if comments are being stored

That's it! Your Supabase setup is complete and comments will now be stored in the database.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6206cd26-88a9-4336-9585-6b68aa77b223) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
