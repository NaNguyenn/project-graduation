#!/bin/bash

USERNAME=$1

sudo useradd $USERNAME -m -s /bin/bash

sudo usermod -a -G sudo $USERNAME

echo "$USERNAME:$USERNAME" | sudo chpasswd

echo "Linux user created."
exit 0