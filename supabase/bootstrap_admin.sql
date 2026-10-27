-- 1. First create/confirm the admin account in Supabase Dashboard > Authentication > Users.
-- 2. Replace the example address below with that exact account email, then run this query.
-- Never place an administrator password in this SQL file or in the repository.

insert into public.admin_users (user_id, email, display_name, role, is_active)
select id, email, split_part(email, '@', 1), 'admin', true
from auth.users
where lower(email) = lower('pustakaalternatif@gmail.com')
on conflict (user_id) do update
set email = excluded.email,
    is_active = true;

-- If no row is returned/inserted, first create the user in Supabase Auth and verify its email.
