-- Storage only deletes a file you can read, and a replaced recording no longer has a row naming it. Let uploaders read their
-- own folder, so the original can be removed once its playable copy is in. Everything else stays as 0053 and 0054 set it.
drop policy if exists original_recordings_read on storage.objects;
create policy original_recordings_read on storage.objects for select to authenticated
  using (bucket_id = 'original-recordings' and (split_part(name, '/', 1) = auth.uid()::text
    or exists (select 1 from public.original_recordings r where r.path = objects.name)));
drop policy if exists setlist_recordings_read on storage.objects;
create policy setlist_recordings_read on storage.objects for select to authenticated
  using (bucket_id = 'setlist-recordings' and (split_part(name, '/', 1) = auth.uid()::text
    or exists (select 1 from public.setlist_recordings r where r.path = objects.name)));
