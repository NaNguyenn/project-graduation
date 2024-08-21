#!/bin/bash
read -p "Tên tài khoản đăng nhập máy chủ? " ACCOUNT_NAME </dev/tty

# Tạo tài khoản trên máy vật lý  
sudo useradd $ACCOUNT_NAME -m -s /bin/bash

sudo usermod -a -G sudo $ACCOUNT_NAME

echo "Kết thúc"