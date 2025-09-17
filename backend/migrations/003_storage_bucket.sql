-- Create storage bucket for contracts
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', true);

-- Create policy to allow public uploads to contracts bucket
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'contracts');

-- Create policy to allow public access to contracts bucket
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'contracts');

-- Create policy to allow public updates to contracts bucket
CREATE POLICY "Allow public updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'contracts');

-- Create policy to allow public deletes to contracts bucket
CREATE POLICY "Allow public deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'contracts');
