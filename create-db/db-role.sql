CREATE USER tuti_owner NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;
CREATE USER tuti_node NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;
  
CREATE DATABASE tutifruti_db
  WITH OWNER = tuti_owner
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       LC_COLLATE = 'Spanish_Spain.1252'
       LC_CTYPE = 'Spanish_Spain.1252'
       CONNECTION LIMIT = -1;
GRANT CONNECT, TEMPORARY ON DATABASE tutifruti_db TO public;

GRANT ALL ON DATABASE tutifruti_db TO tuti_owner;
GRANT CREATE ON DATABASE tutifruti_db TO tuti_node;

