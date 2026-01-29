# Quick Setup Guide for Your Supabase Project

Your Supabase Project: https://supabase.com/dashboard/project/vzscroldgkcpdeetcccs

## Step 1: Get Your Supabase Credentials

1. **Go to your Supabase project settings:**
   - Navigate to: https://supabase.com/dashboard/project/vzscroldgkcpdeetcccs/settings/api

2. **Copy these values:**
   - **Project URL** (looks like: `https://vzscroldgkcpdeetcccs.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - click to reveal)

## Step 2: Update Environment Variables

Update the `.env.local` file with your credentials:

```bash
# Open the file
cd ~/Desktop/sparse-expanse/teacher-portfolio
nano .env.local
```

Replace the values with your actual credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://vzscroldgkcpdeetcccs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Run Database Migration

1. **Go to SQL Editor in Supabase:**
   - Navigate to: https://supabase.com/dashboard/project/vzscroldgkcpdeetcccs/sql/new

2. **Copy and paste the SQL from:**
   - File: `supabase/migrations/001_initial_schema.sql`
   - Or I can open it and you can copy the entire contents

3. **Click "Run" to execute the SQL**

This will create:
- All 7 database tables
- Row Level Security policies
- Database indexes
- Triggers for updated_at fields
- Helper functions

## Step 4: Create Storage Bucket for Photos

1. **Go to Storage:**
   - Navigate to: https://supabase.com/dashboard/project/vzscroldgkcpdeetcccs/storage/buckets

2. **Create new bucket:**
   - Name: `profile-photos`
   - Public: **Yes** (check the box)
   - Click "Create bucket"

3. **Add storage policies:**
   - Click on the `profile-photos` bucket
   - Go to "Policies" tab
   - Add these three policies (click "New Policy" for each):

   **Policy 1: Teachers can upload own photo**
   ```sql
   CREATE POLICY "Teachers can upload own photo"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'profile-photos' AND
     (storage.foldername(name))[1] = (SELECT id::text FROM teachers WHERE email = auth.jwt()->>'email')
   );
   ```

   **Policy 2: Teachers can update own photo**
   ```sql
   CREATE POLICY "Teachers can update own photo"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (
     bucket_id = 'profile-photos' AND
     (storage.foldername(name))[1] = (SELECT id::text FROM teachers WHERE email = auth.jwt()->>'email')
   );
   ```

   **Policy 3: Anyone can view photos**
   ```sql
   CREATE POLICY "Anyone can view profile photos"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'profile-photos');
   ```

## Step 5: Create Your First Admin User

1. **In SQL Editor, run this to create admin teacher record:**

```sql
INSERT INTO teachers (
  iin,
  email,
  first_name,
  last_name,
  role
) VALUES (
  '000000000001',
  'admin@example.com',  -- Change to your email
  'Admin',
  'User',
  'admin'
);
```

2. **Then go to Authentication > Users:**
   - Navigate to: https://supabase.com/dashboard/project/vzscroldgkcpdeetcccs/auth/users
   - Click "Add user" > "Create new user"
   - Email: Same as above (e.g., `admin@example.com`)
   - Password: Choose a strong password
   - Auto Confirm User: **Yes** (check the box)
   - Click "Create user"

## Step 6: Test Locally

```bash
# Make sure you're in the project directory
cd ~/Desktop/sparse-expanse/teacher-portfolio

# Install dependencies if not already done
npm install

# Run the development server
npm run dev
```

Then:
1. Open http://localhost:3000
2. You should be redirected to `/login`
3. Try logging in with:
   - IIN: `000000000001`
   - Password: (the password you set in Supabase Auth)

## Step 7: Verify Everything Works

After logging in, you should:
- ✅ Be redirected to `/admin/dashboard` (since you're an admin)
- ✅ See your name in the header
- ✅ See dashboard statistics
- ✅ Be able to navigate using quick actions

---

## Troubleshooting

**If login fails:**
1. Check the browser console for errors
2. Verify your email is exactly the same in both the teachers table and Auth users
3. Verify the IIN is correct (12 characters: `000000000001`)

**If you see "Error fetching data":**
1. Check that RLS policies were created (Step 3)
2. Verify your Supabase credentials in `.env.local` are correct
3. Restart the dev server: `Ctrl+C` then `npm run dev`

**If "unauthorized" errors:**
1. Make sure the user in Auth has the same email as in the teachers table
2. Check that the role in teachers table is set to 'admin'

---

## Next Steps After Testing

Once local testing works:
1. Deploy Edge Function for emails
2. Deploy to Vercel
3. Set up Google Form integration
4. Add more teachers via Google Form

Let me know if you encounter any issues with any of these steps!
