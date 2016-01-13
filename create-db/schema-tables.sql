-- SCHEMA

CREATE SCHEMA tuti
  AUTHORIZATION tuti_owner;

GRANT ALL ON SCHEMA tuti TO tuti_owner;
GRANT USAGE ON SCHEMA tuti TO tuti_node;

-- TABLES

CREATE TABLE tuti.partidas(
  partida integer NOT NULL,
  estado_partida character varying(50),
  CONSTRAINT partidas_pkey PRIMARY KEY (partida)
);
ALTER TABLE tuti.partidas OWNER TO tuti_owner;
GRANT ALL ON TABLE tuti.partidas TO tuti_owner;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE tuti.partidas TO tuti_node;


CREATE TABLE tuti.jugadores(
  partida integer NOT NULL,
  jugador character varying(50),
  puntos integer NOT NULL,
  CONSTRAINT jugadores_pkey PRIMARY KEY (partida,jugador)
);

ALTER TABLE tuti.jugadores OWNER TO tuti_owner;
GRANT ALL ON TABLE tuti.jugadores TO tuti_owner;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE tuti.jugadores TO tuti_node;

CREATE TABLE tuti.categorias(
  partida integer NOT NULL,
  categoria integer NOT NULL,
  cate_desc character varying(50),
  CONSTRAINT categorias_pkey PRIMARY KEY (partida,categoria)
);
ALTER TABLE tuti.categorias
  OWNER TO tuti_owner;
GRANT ALL ON TABLE tuti.categorias TO tuti_owner;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE tuti.categorias TO tuti_node;

CREATE TABLE tuti.manos(
  partida integer NOT NULL,
  mano integer NOT NULL,
  letra character varying(1),
  estado_mano character varying(50),
  CONSTRAINT manos_pkey PRIMARY KEY (partida,mano)
);
ALTER TABLE tuti.manos
  OWNER TO tuti_owner;
GRANT ALL ON TABLE tuti.manos TO tuti_owner;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE tuti.manos TO tuti_node;

CREATE TABLE tuti.jugadas(
  partida integer NOT NULL,
  mano integer NOT NULL,
  jugador character varying(50),
  categoria integer NOT NULL,
  palabra character varying(50),
  CONSTRAINT jugadas_pkey PRIMARY KEY (partida,mano,jugador,categoria,palabra)
);
ALTER TABLE tuti.jugadas
  OWNER TO tuti_owner;
GRANT ALL ON TABLE tuti.jugadas TO tuti_owner;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE tuti.jugadas TO tuti_node;



