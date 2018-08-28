# Deployment for eos-voter

### About

This document describes how to deploy the eos-voter app.

We use aws and will run on a EC2 instance

## Create the server

### Set up the server

Create an EC2 instance. I used a nano. The server doesn't do a lot of work so can be pretty small.
Use Ubuntu 18.04 as the operating system.

Log into the instance

We need to update the system packages. Type in

```
sudo apt-get update

sudo apt-get dist-upgrade

sudo apt-get autoremove
```

If it updated then kernel you will need to reboot

```
sudo reboot
```

Then reconnect

Install the required Ubuntu packages

```
sudo apt-get install git nginx mongodb python3-pip supervisor virtualenv
```

Check out the repo

cd /srv
sudo git clone https://github.com/eosphere/eos-voter.git

### Set up let's encrypt

Add the Let's Encrypt PPA (taken from DigitalOceans instructions https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04)

```
sudo add-apt-repository ppa:certbot/certbot
```

Update the repo

```
sudo apt-get update
```

Install the certbot

```
sudo apt-get install python-certbot-nginx
```

Copy in nginx configuration file to the /etc/nginx/sites-available directory

```
sudo cp /srv/eos-voter/config/nginx/eos-voter.conf /etc/nginx/sites-available/eos-voter.conf
```

Edit the /etc/nginx/sites-available/eos-voter.conf file and change the server name to your server's fully qualified domain name. It is in the file as eos-voter.example.com

Remove the default site from the active sites and add in the eos-voter site.

```
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/eos-voter.conf /etc/nginx/sites-enabled/eos-voter.conf
```

Restart nginx to get it to pick up the changes
```
sudo service nginx restart
```

Install the certbot

```
sudo mkdir /srv/certbot
sudo cp /srv/eos-voter/config/lets-encrypt/certbot.sh /srv/certbot/certbot.sh
sudo chmod 700 /srv/certbot/certbot.sh
```

Create the well know directory for the certbot's output files
```
sudo mkdir /srv/eos-voter/public
sudo mkdir /srv/eos-voter/public/.well-known
```

Edit the certbot file so it refers to the correct domain
```
sudo nano /srv/certbot/certbot.sh
```

Run the certbot for the first time

```
sudo /srv/certbot/certbot.sh
```

Accept all the prompts this should give us an SSL cert

Run the let's encrypt update every month
```
sudo crontab -e
```

Add the following entry to the crontab
```
0 0    1    *   *    /srv/certbot/certbot.sh
```
This will run the certbot on the first of every month you should check on the first of the next month that it ran.

### Set up nodejs

First download the nodejs executable from their ppa

```
sudo /srv/eos-voter/config/installation/install_node_ubuntu
sudo apt-get install nodejs build-essential
```

Install the npm requirements

```
cd /srv/eos-voter/eos-voter
sudo npm install
```

### Set up the python block chain inspector

cd /srv/eos-voter/chaininspector
sudo virtualenv venv -p python3
sudo ./venv/bin/pip install -r requirements.txt

### Start the chaininspector program

### Start the nodejs frontend
Install PM2 which will keep our program running
```
sudo npm install -g pm2
```

Start the application with pm2
```
pm2 start /srv/eos-voter/eos-voter/bin/www
```

Set the application to auto start
```
pm2 startup systemd
```

It will return to you a command you need to re-enter to the prompt to run as sudo.

### Run webpack to compress javascript

Run webpack to generate the static files

```
cd /srv/eos-voter/eos-voter/
sudo nodejs node_modules/webpack/bin/webpack.js src/votefrontend.js --output public/bin/app.js --mode production
```

#Set up the logrotation options

```
sudo pm2 logrotate -u ubuntu
```

As per the the pm2 instructions <http://pm2.keymetrics.io/docs/usage/log-management/#setting-up-a-native-logrotate>

### Server is set up

You are now up and running with your own eos-voter install

## Upgrade the server

First merge all necessary changes into the master branch of the git repo and push to github.

ssh into the server. Then change to the software directory and pull the updates

```
cd /srv/eos-voter
git pull
```

Install any updated npm requirements

```
cd /srv/eos-voter/eos-voter
npm install
```

Run webpack to regenerate the client side javascript

```
cd /srv/eos-voter/eos-voter
nodejs node_modules/webpack/bin/webpack.js src/votefrontend.js --output public/bin/app.js --mode production -d
```

Restart the app
```
pm2 restart all
```
