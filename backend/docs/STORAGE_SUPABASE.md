# Storage Guide

## Storage Bucket Setup

### 1. Create Storage Bucket

In your Supabase dashboard:

1. Go to **Storage** → **Buckets**
2. Click **"New bucket"**
3. Configure the bucket:
   - **Name**: `contracts`
   - **Public bucket**: ✅ **Enable** (for development)
   - **File size limit**: 50MB (or your preference)
   - **Allowed MIME types**: `application/pdf` (or leave empty for all)

### 2. Configure Storage Policies

In the Supabase dashboard:

1. Go to **Storage** → **Policies**
2. Click **"New Policy"** for the `contracts` bucket
3. Create these policies:

#### Policy 1: Allow Public Uploads
```sql
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'contracts');
```

#### Policy 2: Allow Public Access
```sql
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'contracts');
```

#### Policy 3: Allow Public Updates
```sql
CREATE POLICY "Allow public updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'contracts');
```

#### Policy 4: Allow Public Deletes
```sql
CREATE POLICY "Allow public deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'contracts');
```

### 3. Alternative: Run Migration

If you prefer to run the SQL directly, execute this in your Supabase SQL editor from the `migrations/003_storage_bucket.sql` file.

### 4. Verify Setup

After creating the bucket and policies:

1. **Check bucket exists**: Go to Storage → Buckets and verify `contracts` bucket is listed
2. **Check policies**: Go to Storage → Policies and verify the 4 policies are created
3. **Test upload**: Try uploading a file through the frontend

## 🔧 Alternative Solutions

### Option 1: Disable RLS (Development Only)

If you want to disable RLS for development:

```sql
-- Disable RLS on storage.objects (NOT RECOMMENDED FOR PRODUCTION)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

### Option 2: Use Service Role Key

For development, you can use the service role key instead of the anonymous key:

1. Go to **Settings** → **API**
2. Copy the **service_role** key (not the anon key)
3. Update your `.env` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Then update the backend to use the service role key for file uploads.

## 🚀 Production Considerations

For production deployment:

1. **Enable RLS**: Always keep RLS enabled
2. **Authenticated Uploads**: Require user authentication for uploads
3. **File Validation**: Add server-side file type and size validation
4. **Access Control**: Implement proper user-based access controls
5. **Audit Logging**: Log all file operations

## 📝 Quick Fix Commands

If you want to run the setup via SQL:

```bash
# Connect to your Supabase project and run:
psql -h your-db-host -U postgres -d postgres -f migrations/003_storage_bucket.sql
```

Or copy-paste the SQL from `migrations/003_storage_bucket.sql` into your Supabase SQL editor.
