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

### Configure nginx

sudo  /srv/eos-voter/config/nginx/eos-voter.conf /etc/nginx/sites-available
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/eos-voter.conf /etc/nginx/sites-enabled/eos-voter.conf
sudo service nginx restart

### Start the chaininspector program

sudo cp /srv/eos-voter/config/supervisord/chaininspector.conf /etc/supervisor/conf.d/
sudo supervisorctl update

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

Use pico to edit the file it makes

```
sudo pico /etc/logrotate.d/pm2-ubuntu
```
Change the line that says `weekly` to `daily`

### Server is set up

You are now up and running with your own eos-voter install

## Upgrade the server

First merge all necessary changes into the master branch of the git repo and push to github.

ssh into the server. Then change to the software directory and pull the updates

```
cd /srv/eos-voter
sudo git pull
```

Install any updated npm requirements

```
cd /srv/eos-voter/eos-voter
sudo npm install
```

Run webpack to regenerate the client side javascript

```
cd /srv/eos-voter/eos-voter
sudo nodejs node_modules/webpack/bin/webpack.js src/votefrontend.js --output public/bin/app.js --mode production -d
```

Restart the app
```
pm2 restart all
```
