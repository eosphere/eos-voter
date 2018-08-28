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

Create the deployment user

```
sudo adduser deployment --shell=/bin/false --disabled-password
```

### Install the code

Create the directory for the code to reside in

```
cd /srv
sudo mkdir eos-voter
```

Change the ownership of the bitcoinhex directory. The deployment user owns it
but the www-data user will be able to read it.
```
sudo chown deployment:www-data eos-voter
```

Check out the repo

```
cd /srv
sudo -u deployment git clone https://github.com/eosphere/eos-voter.git eos-voter
```

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

### Finalise the application file set up

Change the ownership of all files in the directory
```
sudo chown deployment:www-data /srv/eos-voter -R
```

### Configure nginx

sudo cp /srv/eos-voter/config/nginx/eos-voter.conf /etc/nginx/sites-available
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

Create the pm2 log directory and make it writable by the www-data user
```
mkdir ~/.pm2
chmod 775 ~/pm2
chown deployment:www-data ~/.pm2
```

Start the application with pm2
```
sudo -u www-data pm2 start /srv/eos-voter/eos-voter/bin/www
```

Set the application to auto start
```
sudo -u www-data pm2 startup systemd
```

It will return to you a command you need to enter into the prompt to run as sudo.

### Run webpack to compress javascript

Run webpack to generate the static files

```
cd /srv/eos-voter/eos-voter/
sudo -u deployment nodejs node_modules/webpack/bin/webpack.js src/votefrontend.js --output public/bin/app.js -d --mode production
sudo -u deployment chown deployment:www-data /srv/eos-voter -R
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
sudo -u deployment git pull
```

Install any updated npm requirements

```
cd /srv/eos-voter/eos-voter
sudo -u deployment npm install
```

Run webpack to regenerate the client side javascript

```
cd /srv/eos-voter/eos-voter
sudo -u deployment nodejs node_modules/webpack/bin/webpack.js src/votefrontend.js --output public/bin/app.js --mode production -d
```

Change the ownership of all files in the directory
```
sudo chown deployment:www-data eos-voter -R
```

Restart the app
```
sudo -u www-data pm2 restart all
```
