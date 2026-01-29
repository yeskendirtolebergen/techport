# Teacher Portfolio Platform - Deployment Guide

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- A Vercel account for deployment
- SMTP credentials (Gmail, SendGrid, etc.) for email delivery

---

## Step 1: Set Up Supabase Project

### 1.1 Create a New Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and API keys

### 1.2 Run Database Migrations

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and execute the SQL script
4. Verify all tables, policies, and functions are created

### 1.3 Create Storage Bucket

1. Navigate to Storage in Supabase dashboard
2. Create a new bucket named `profile-photos`
3. Make it **public**
4. Add the storage policies (commented in the migration file)

### 1.4 Create an Admin User (Initial Setup)

Run this SQL in the Supabase SQL Editor to create your first admin:

```sql
-- Insert admin teacher record
INSERT INTO teachers (
  iin,
  email,
  first_name,
  last_name,
  role
) VALUES (
  '000000000001',  -- Replace with actual IIN
  'admin@school.kz',  -- Replace with actual email
  'Admin',
  'User',
  'admin'
);

-- Create auth user (you'll need to do this via Supabase Auth UI or API)
-- Or use the Supabase dashboard Authentication > Users > Invite user
```

Then use the Supabase Authentication dashboard to create the corresponding auth user.

---

## Step 2: Deploy Edge Function

### 2.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 2.2 Link Your Project

```bash
cd teacher-portfolio
supabase login
supabase link --project-ref your-project-ref
```

### 2.3 Set Edge Function Secrets

```bash
# Set SMTP credentials
supabase secrets set SMTP_HOSTNAME=smtp.gmail.com
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_USERNAME=your-email@gmail.com
supabase secrets set SMTP_PASSWORD=your-app-password
supabase secrets set SMTP_FROM=noreply@teacherportfolio.kz
supabase secrets set APP_URL=https://your-domain.com
```

### 2.4 Deploy the Function

```bash
supabase functions deploy send-welcome-email
```

---

## Step 3: Configure Next.js Application

### 3.1 Set Environment Variables

Create or update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**⚠️ Security Note:** Never commit `.env.local` to version control!

### 3.2 Test Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and verify:
- Login page loads
- Can login with admin credentials
- Dashboard displays correctly

---

## Step 4: Deploy to Vercel

### 4.1 Connect Repository

1. Push your code to GitHub (or GitLab/Bitbucket)
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository

### 4.2 Configure Environment Variables

In Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
```

### 4.3 Deploy

1. Vercel will automatically deploy your main branch
2. Wait for the build to complete
3. Visit your deployment URL

---

## Step 5: Set Up Google Form Integration

### 5.1 Create Google Form

Create a Google Form with these fields matching the registration data structure:

**Personal Information:**
- First Name (Short answer)
- Last Name (Short answer)
- IIN (12-digit number)
- Email
- Phone
- Date of Birth
- Graduated School
- Total Experience (number)
- Current Workplace (dropdown)
- Subject (dropdown)
- Category (dropdown)
- etc.

### 5.2 Create Google Apps Script

1. In your Google Form, click the three dots > Script editor
2. Add this script:

```javascript
function onFormSubmit(e) {
  var form = FormApp.getActiveForm();
  var formResponses = form.getResponses();
  var latestResponse = formResponses[formResponses.length - 1];
  var itemResponses = latestResponse.getItemResponses();
  
  var data = {
    firstName: getResponseByTitle(itemResponses, 'First Name'),
    lastName: getResponseByTitle(itemResponses, 'Last Name'),
    iin: getResponseByTitle(itemResponses, 'IIN'),
    email: getResponseByTitle(itemResponses, 'Email'),
    phone: getResponseByTitle(itemResponses, 'Phone'),
    // Add all other fields...
  };
  
  var url = 'https://your-domain.com/api/register';
  
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(data)
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log('Registration successful: ' + response.getContentText());
  } catch (error) {
    Logger.log('Error: ' + error.toString());
  }
}

function getResponseByTitle(itemResponses, title) {
  for (var i = 0; i < itemResponses.length; i++) {
    if (itemResponses[i].getItem().getTitle() === title) {
      return itemResponses[i].getResponse();
    }
  }
  return null;
}
```

3. Save the script
4. Add a trigger: Edit > Current project's triggers > Add trigger
   - Choose function: `onFormSubmit`
   - Event source: From form
   - Event type: On form submit

---

## Step 6: Testing

### 6.1 Test Registration Flow

1. Fill out your Google Form with test data
2. Check that:
   - Teacher record is created in database
   - Welcome email is sent
   - Teacher can login with IIN and password

### 6.2 Test Authentication

1. Login as teacher
2. Login as admin
3. Verify role-based redirects work correctly

### 6.3 Test Permissions

1. As teacher: try to access admin routes (should be blocked)
2. As admin: verify access to all routes
3. Test that teachers can only edit their own profile

---

## Step 7: Production Checklist

- [ ] Database migrations applied
- [ ] RLS policies enabled on all tables
- [ ] Storage bucket created and configured
- [ ] Edge function deployed with secrets
- [ ] Environment variables set in Vercel
- [ ] Google Form connected and tested
- [ ] Admin user created
- [ ] Email delivery tested
- [ ] SSL certificate configured (Vercel does this automatically)
- [ ] Custom domain configured (optional)
- [ ] Backup strategy established
- [ ] Monitoring setup (Vercel Analytics, Sentry, etc.)

---

## Ongoing Maintenance

### Database Backups

Supabase provides automatic backups. For critical data:
- Enable Point-in-Time Recovery (PITR) in Supabase dashboard
- Consider additional backup solutions

### Monitoring

Set up monitoring for:
- Application errors (Sentry)
- Performance (Vercel Analytics)
- Database usage (Supabase dashboard)
- Email delivery rates

### Updates

To deploy updates:
```bash
git push origin main  # Vercel auto-deploys
```

For database changes:
```bash
# Create new migration file
# Apply via Supabase SQL editor
```

---

## Troubleshooting

### Login Issues

**Problem:** Cannot login with IIN
**Solution:** 
1. Verify IIN exists in teachers table
2. Check Supabase auth user is created
3. Ensure email matches between tables

### Email Not Sent

**Problem:** Welcome email not delivered
**Solution:**
1. Check Edge Function logs in Supabase dashboard
2. Verify SMTP credentials are correct
3. Check spam folder
4. Test SMTP connection separately

### Permission Errors

**Problem:** "Error fetching data" or "Unauthorized"
**Solution:**
1. Verify RLS policies are enabled
2. Check user's role in database
3. Ensure JWT token is valid

### Build Errors

**Problem:** Vercel build fails
**Solution:**
1. Check environment variables are set
2. Verify all dependencies are in package.json
3. Check build logs for specific errors

---

## Support

For technical issues:
- Check Supabase documentation: https://supabase.com/docs
- Check Next.js documentation: https://nextjs.org/docs
- Review application logs in Vercel dashboard
- Check Supabase logs for database/auth issues

---

## Security Best Practices

1. **Never commit secrets** to version control
2. **Rotate passwords** regularly
3. **Monitor auth logs** for suspicious activity
4. **Keep dependencies updated**
5. **Use strong passwords** for admin accounts
6. **Enable 2FA** on critical accounts (Supabase, Vercel)
7. **Regular security audits** of RLS policies
8. **Limit service role key** usage to necessary operations only

---

## Next Steps

Once deployed, consider these enhancements:
- Add more admin management pages
- Implement data export functionality
- Add analytics dashboard
- Create mobile app version
- Implement notification system
- Add document upload functionality
- Create public portfolio views
