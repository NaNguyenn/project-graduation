#!/bin/bash

USERNAME=$1

sudo userdel -r $USERNAME

echo "SSH user deleted."
exit 0