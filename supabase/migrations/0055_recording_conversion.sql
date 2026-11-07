-- An Apple Lossless recording is swapped for a playable copy after upload, so the uploader may repoint their own row.
-- Same folder rules as adding one, and only these columns. The new file's upload then matches the row, as usual. Safe to run more than once.
grant update (path, mime, size) on public.original_recordings to authenticated;
grant update (path, mime, size) on public.setlist_recordings to authenticated;

drop policy if exists original_recordings_update on public.original_recordings;
create policy original_recordings_update on public.original_recordings for update to authenticated
  using (owner = auth.uid())
  with check (owner = auth.uid() and split_part(path, '/', 1) = auth.uid()::text and split_part(path, '/', 2) = song_id::text);
drop policy if exists setlist_recordings_update on public.setlist_recordings;
create policy setlist_recordings_update on public.setlist_recordings for update to authenticated
  using (owner = auth.uid())
  with check (owner = auth.uid() and split_part(path, '/', 1) = auth.uid()::text and split_part(path, '/', 2) = setlist_id::text);
