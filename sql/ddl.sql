USE vaccia;

DROP TABLE IF EXISTS family;
DROP TABLE IF EXISTS taken;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS vaccines;
DROP TABLE IF EXISTS animalVaccines;
DROP TABLE IF EXISTS appointments;

CREATE TABLE users
(
	userId INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    salt VARCHAR(200) NOT NULL,

    PRIMARY KEY (userId)
);

CREATE TABLE family
(
	familyId INT NOT NULL,
	name VARCHAR(50) NOT NULL,
    birthday DATETIME NOT NULL,
    email VARCHAR(50) NOT NULL,
    role VARCHAR(20)
);

CREATE TABLE vaccines
(
    name VARCHAR(50) NOT NULL,
    ages VARCHAR(100),
    frequency INT,

	PRIMARY KEY (name)
);

CREATE TABLE animalVaccines
(
	name VARCHAR(50) NOT NULL,
    animal VARCHAR(50) NOT NULL
);

CREATE TABLE appointments
(
    familyId INT NOT NULL,
	userEmail VARCHAR(50) NOT NULL,
    userName VARCHAR(50) NOT NULL,
    vaccName VARCHAR(50) NOT NULL,
    dateTaken DATETIME NOT NULL
);


CREATE TABLE taken
(
	familyId INT NOT NULL,
	userEmail VARCHAR(50) NOT NULL,
    userName VARCHAR(50) NOT NULL,
    vaccName VARCHAR(50) NOT NULL,
    dateTaken DATETIME NOT NULL
)