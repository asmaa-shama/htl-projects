CREATE TABLE Season(
   id integer GENERATED ALWAYS AS IDENTITY ,
   identifier varchar(255),
   PRIMARY KEY (id)
);
Create TABLE Activity(
	id integer GENERATED ALWAYS AS IDENTITY, 
    idSeason integer, 
	identifier varchar(255),
    PRIMARY KEY (id), 
    FOREIGN KEY (idSeason) REFERENCES Season(id)
); 
CREATE TABLE Person(
  id integer GENERATED ALWAYS AS IDENTITY,
  idActivity integer,
  firstname varchar(255), 
  lastname varchar(255),
  PRIMARY KEY (id),
  FOREIGN KEY (idActivity) REFERENCES Activity(id)
); 

INSERT INTO Season(  identifier) VALUES ( 'Sommer'); 
INSERT INTO Season( identifier) VALUES ( 'Winter'); 

INSERT INTO Activity(  idSeason, identifier) VALUES ( 1, 'Klettern' ); 
INSERT INTO Activity(  idSeason, identifier) VALUES ( 1, 'Segeln' ); 
INSERT INTO Activity( idSeason, identifier) VALUES ( 1, 'Tennis' ); 
INSERT INTO Activity( idSeason, identifier) VALUES ( 2, 'Schifahren' ); 
INSERT INTO Activity( idSeason, identifier) VALUES ( 2, 'Snowboarden' ); 
INSERT INTO Activity( idSeason, identifier) VALUES ( 2, 'Rodeln' ); 
INSERT INTO Activity( idSeason, identifier) VALUES ( 2, 'Eislaufen' ); 

INSERT INTO Person(  idActivity, firstname, lastname) VALUES (1, 'Adam', 'Auer' ); 
INSERT INTO Person(  idActivity, firstname, lastname) VALUES ( 1,'Berta', 'Berger' ); 
INSERT INTO Person(  idActivity, firstname, lastname) VALUES ( 2,'Chris', 'Chaos' ); 
INSERT INTO Person(  idActivity, firstname, lastname) VALUES ( 3, 'Doris', 'Dorfer' ); 
INSERT INTO Person(  idActivity, firstname, lastname)  VALUES ( 2,'Egon', 'Egger' ); 
INSERT INTO Person(  idActivity, firstname, lastname)  VALUES ( 3,'Frieda', 'Freitag' ); 
INSERT INTO Person(  idActivity, firstname, lastname)  VALUES ( 4,'Georg', 'Gans' ); 
INSERT INTO Person(  idActivity, firstname, lastname)  VALUES ( 5, 'Helga', 'Hofer' ); 
INSERT INTO Person(  idActivity, firstname, lastname)  VALUES ( 4,'ida', 'Innerhofer' ); 
INSERT INTO Person(  idActivity, firstname, lastname)  VALUES ( 5,'Jakob', 'Jelen' ); 
INSERT INTO Person(  idActivity, firstname, lastname) VALUES ( 6, 'Katharina', 'Kaiser' ); 
INSERT INTO Person(  idActivity, firstname, lastname) VALUES ( 7, 'Leon', 'Leitner' ); 
INSERT INTO Person(  idActivity, firstname, lastname) VALUES ( 6, 'Maria', 'Maurer' ); 
INSERT INTO Person(  idActivity, firstname, lastname) VALUES ( 7, 'Noah', 'Niederdorfer' ); 
INSERT INTO Person(  idActivity, firstname, lastname) VALUES ( 1, 'Olivia', 'Olsen' ); 
COMMIT;
