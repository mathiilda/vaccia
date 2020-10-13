#!/usr/bin/env bash

echo "-- Sets up vaccia-database, please input your root password."
mysql -uroot -p vaccia < setup.sql > /dev/null

echo "-- Create tables for the vaccia-database"
mysql -uuser -ppass vaccia < ddl.sql > /dev/null

echo "-- Insert information into tables."
mysql -uuser -ppass vaccia < insert.sql > /dev/null