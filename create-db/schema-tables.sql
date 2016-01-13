-- SCHEMA

CREATE SCHEMA tuti
  AUTHORIZATION tedede_php;

GRANT ALL ON SCHEMA tuti TO tedede_php;
GRANT USAGE ON SCHEMA tuti TO tuti_users;

-- TABLES

CREATE TABLE tuti.partidas
(
  partida integer NOT NULL,
  estado_partida character varying(50),
  CONSTRAINT partidas_pkey PRIMARY KEY (partida)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE tuti.partidas
  OWNER TO tedede_php;
GRANT ALL ON TABLE tuti.partidas TO tedede_php;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE tuti.partidas TO tuti_users;


CREATE TABLE tuti.jugadores
(
  partida integer NOT NULL,
  jugador character varying(50),
  puntos integer NOT NULL,
  CONSTRAINT jugadores_pkey PRIMARY KEY (partida,jugador)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE tuti.jugadores
  OWNER TO tedede_php;
GRANT ALL ON TABLE tuti.jugadores TO tedede_php;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE tuti.jugadores TO tuti_users;

CREATE TABLE tuti.categorias
(
  partida integer NOT NULL,
  categoria integer NOT NULL,
  cate_desc character varying(50),
  CONSTRAINT categorias_pkey PRIMARY KEY (partida,categoria)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE tuti.categorias
  OWNER TO tedede_php;
GRANT ALL ON TABLE tuti.categorias TO tedede_php;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE tuti.categorias TO tuti_users;

CREATE TABLE tuti.manos
(
  partida integer NOT NULL,
  mano integer NOT NULL,
  letra character varying(50),
  estado_mano character varying(50),
  CONSTRAINT manos_pkey PRIMARY KEY (partida,mano)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE tuti.manos
  OWNER TO tedede_php;
GRANT ALL ON TABLE tuti.manos TO tedede_php;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE tuti.manos TO tuti_users;

CREATE TABLE tuti.jugadas
(
  partida integer NOT NULL,
  mano integer NOT NULL,
  jugador character varying(50),
  categoria integer NOT NULL,
  palabra character varying(50),
  CONSTRAINT jugadas_pkey PRIMARY KEY (partida,mano,jugador,categoria,palabra)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE tuti.jugadas
  OWNER TO tedede_php;
GRANT ALL ON TABLE tuti.jugadas TO tedede_php;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE tuti.jugadas TO tuti_users;



