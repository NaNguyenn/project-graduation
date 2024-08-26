#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Invalid inputs"
    exit 1
fi

USERNAME=$1

sudo useradd $USERNAME -m -s /bin/bash

sudo usermod -a -G sudo $USERNAME

echo "Linux user created."
exit 0