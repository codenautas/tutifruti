
CREATE DATABASE tutifruti_db
  WITH OWNER = tedede_owner
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       LC_COLLATE = 'Spanish_Spain.1252'
       LC_CTYPE = 'Spanish_Spain.1252'
       CONNECTION LIMIT = -1;
GRANT CONNECT, TEMPORARY ON DATABASE tutifruti_db TO public;
GRANT ALL ON DATABASE tutifruti_db TO tedede_owner;
GRANT CREATE ON DATABASE tutifruti_db TO tedede_php;

CREATE ROLE tuti_users
  NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;