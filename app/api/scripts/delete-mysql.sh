#!/bin/bash

MySQLAccount=$1
MySQLDatabaseName=$2

tmpfile=$(mktemp)

echo "DROP DATABASE IF EXISTS $MySQLDatabaseName;" >> $tmpfile

echo "DROP USER IF EXISTS '$MySQLAccount'@'%';" >> $tmpfile

echo "FLUSH PRIVILEGES;" >> $tmpfile

sudo mysql -uroot < $tmpfile

rm -f $tmpfile

echo "MySQL user and database deleted."
exit 0