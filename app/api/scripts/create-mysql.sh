#!/bin/bash

MySQLAccount=$1
MySQLDatabaseName=$2

tmpfile=$(mktemp)

echo "CREATE DATABASE IF NOT EXISTS $MySQLDatabaseName;" >> $tmpfile

echo "CREATE USER IF NOT EXISTS '$MySQLAccount'@'%' IDENTIFIED BY '$MySQLAccount';" >> $tmpfile

echo "GRANT ALL PRIVILEGES ON $MySQLDatabaseName.* TO '$MySQLAccount'@'%';" >> $tmpfile

echo "FLUSH PRIVILEGES;" >> $tmpfile

sudo mysql -uroot < $tmpfile

rm -f $tmpfile

echo "MySQL database created."
exit 0
