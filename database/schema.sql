create table if not exists colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email_domain text,
  created_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  college_id uuid references colleges(id),
  name text,
  email text unique,
  role text default 'student',
  has_stock boolean default false,
  points int default 0,
  created_at timestamptz default now()
);

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  college_id uuid references colleges(id),
  requester_id uuid references users(id),
  type text default 'pad',
  location_note text,
  status text default 'open',
  via text default 'internet',
  created_at timestamptz default now(),
  expires_at timestamptz
);

create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id),
  volunteer_id uuid references users(id),
  status text default 'accepted',
  confirmed_by_requester boolean default false,
  confirmed_by_volunteer boolean default false,
  created_at timestamptz default now()
);

create table if not exists points_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  request_id uuid references requests(id),
  points int,
  created_at timestamptz default now()
);

create table if not exists washrooms (
  id uuid primary key default gen_random_uuid(),
  college_id uuid references colleges(id),
  name text,
  latitude double precision,
  longitude double precision,
  has_water boolean default false,
  has_dustbin boolean default false,
  has_lock boolean default false,
  has_pads boolean default false,
  rating numeric default 0,
  last_verified timestamptz default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  washroom_id uuid references washrooms(id),
  reporter_id uuid references users(id),
  issue text,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists dispensers (
  id uuid primary key default gen_random_uuid(),
  college_id uuid references colleges(id),
  location text,
  stock_level int default 0,
  updated_at timestamptz default now()
);

-- Demo only: row level security is off. Turn it on before real use.
alter table colleges disable row level security;
alter table users disable row level security;
alter table requests disable row level security;
alter table responses disable row level security;
alter table points_log disable row level security;
alter table washrooms disable row level security;
alter table reports disable row level security;
alter table dispensers disable row level security;