INSERT INTO tuti.partidas VALUES (1,'fin');
INSERT INTO tuti.jugadores VALUES (1,'Meme',0);
INSERT INTO tuti.jugadores VALUES (1,'Bart',0);
INSERT INTO tuti.categorias VALUES (1,1,'teoremas');
INSERT INTO tuti.manos VALUES (1,1,'M','fin');
INSERT INTO tuti.jugadas VALUES (1,1,'Meme',1,'markov');

INSERT INTO tuti.partidas VALUES (2,'abierta');
INSERT INTO tuti.jugadores VALUES 
    (2,'Estefi',0),
    (2,'Elba',0),
    (2,'Guille',0),
    (2,'Miru',0),
    (2,'Emilio',0);


INSERT INTO tuti.categorias VALUES (2,1,'flores');
INSERT INTO tuti.categorias VALUES (2,2,'frutas');
INSERT INTO tuti.categorias VALUES (2,3,'colores');
INSERT INTO tuti.categorias VALUES (2,4,'países');
INSERT INTO tuti.categorias VALUES (2,5,'animales');
INSERT INTO tuti.categorias VALUES (2,6,'nombres');
INSERT INTO tuti.manos VALUES(2,1,'P','fin');
INSERT INTO tuti.manos VALUES(2,2,'S','fin');
INSERT INTO tuti.jugadas (partida, mano, jugador, categoria, palabra) VALUES 
    (2,1,'Estefi'  ,2,'Pera'),
    (2,1,'Emilio'  ,2,'Pomelo'),
    (2,1,'Emilio'  ,3,'Púrpura'),
    (2,1,'Estefi'  ,4,'Polonia'),
    (2,1,'Emilio'  ,4,'Pakistán'),
    (2,1,'Estefi'  ,5,'Pez'),
    (2,1,'Emilio'  ,5,'Perro'),
    (2,1,'Estefi'  ,6,'Paula'),
    (2,1,'Emilio'  ,6,'Pamela'),
    (2,1,'Guille'  ,6,'Pedro'),
    (2,2,'Estefi'  ,2,'Sandía'),
    (2,2,'Estefi'  ,3,'Salmón'),
    (2,2,'Estefi'  ,4,'Suecia'),
    (2,2,'Emilio'  ,4,'Suiza'),
    (2,2,'Guille'  ,4,'Somalía');
INSERT INTO tuti.manos VALUES(2,3,'A','abierta');
