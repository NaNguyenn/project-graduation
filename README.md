<!-- Must start the server as root -->

sudo -i
apt update
apt install nodejs
apt install npm
npm install --global yarn

yarn
yarn dev

<!-- Test created MySQL resources -->

sudo mysql -u root
SHOW DATABASES;
SELECT User, Host FROM mysql.user;
