#!/bin/bash

USERNAME=$1
PASSWORD=$2

sudo useradd $USERNAME -m -s /bin/bash

sudo usermod -a -G sudo $USERNAME

echo "$USERNAME"
echo "$PASSWORD"

echo "$USERNAME:$PASSWORD" | sudo chpasswd

echo "Linux user created."
exit 0