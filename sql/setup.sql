DROP USER IF EXISTS 'user'@'%';

CREATE USER 'user'@'%'
IDENTIFIED
WITH mysql_native_password
BY 'pass'
;

GRANT ALL PRIVILEGES
ON *.*
TO 'user'@'%'
WITH GRANT OPTION
;

CREATE DATABASE IF NOT EXISTS vaccia;

USE vaccia;