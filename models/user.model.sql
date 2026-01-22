create table public.users (
  id serial not null,
  document_number character varying(50) not null,
  first_name character varying(100) not null,
  last_name character varying(100) not null,
  email character varying(150) not null,
  phone character varying(20) not null,
  password character varying(255) not null,
  role character varying(50) null default 'client'::character varying,
  address character varying not null,
  legal_organization_id smallint not null,
  tribute_id smallint not null,
  status smallint not null default '0'::smallint,
  municipality_id integer null,
  company character varying null default ''::character varying,
  trade_name character varying null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint users_pkey primary key (document_number),
  constraint users_email_key unique (email)
) TABLESPACE pg_default;

create trigger users_set_updated_at BEFORE
update on users for EACH row
execute FUNCTION set_updated_at ();