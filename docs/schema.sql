create table if not exists profiles (
  id uuid primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  level integer default 1,
  points integer default 0,
  streak integer default 0,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table if not exists missions (
  id uuid primary key,
  title text not null,
  description text not null,
  object_name text not null,
  reward_xp integer not null,
  difficulty text not null,
  created_at timestamptz default now()
);

create table if not exists observations (
  id uuid primary key,
  user_id uuid references profiles(id),
  mission_id uuid references missions(id),
  object_name text not null,
  image_url text,
  status text default 'pending',
  points_earned integer default 0,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz
);

create table if not exists mission_progress (
  id uuid primary key,
  user_id uuid references profiles(id),
  mission_id uuid references missions(id),
  status text default 'pending',
  progress integer default 0,
  created_at timestamptz default now()
);

create table if not exists teams (
  id uuid primary key,
  name text not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists user_badges (
  id uuid primary key,
  user_id uuid references profiles(id),
  badge_name text not null,
  earned_at timestamptz default now()
);
