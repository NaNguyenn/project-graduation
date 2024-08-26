#!/bin/bash

if [ "$#" -ne 2 ]; then
    echo "Invalid inputs"
    exit 1
fi

FIRSTNAME=$1
LASTNAME=$2

sudo echo "Hello, $FIRSTNAME $LASTNAME"
exit 0