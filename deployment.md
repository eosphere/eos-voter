# Deployment for eos-voter

### About

This document describes how to deploy the eos-voter app.

We use aws and will run on a EC2 instance

## Create the server

### Set up the server

We will install the Telos voter alongside the EOSvoter. Install the EOSvoter on
a server as per the instructions in the EOSvoter deployment.md file.


### Install the code

Create the directory for the code to reside in

```
cd /srv
sudo mkdir telos-voter
```

Change the ownership of the eos-voter directory. The deployment user owns it
but the www-data user will be able to read it.
```
sudo chown deployment:www-data telos-voter
```

Check out the repo

```
cd /srv
sudo -u deployment git clone https://github.com/eosphere/eos-voter.git telos-voter --branch master-telos
```

### Set up nodejs

Install the npm requirements

```
cd /srv/telos-voter/eos-voter
sudo npm install
```

### Set up the python block chain inspector

```
cd /srv/telos-voter/chaininspector
sudo virtualenv venv -p python3
sudo ./venv/bin/pip install -r requirements.txt
```

### Finalise the application file set up

Change the ownership of all files in the directory
```
sudo chown deployment:www-data /srv/telos-voter -R
```

### Configure nginx

```
sudo cp /srv/telos-voter/config/nginx/telos-voter.conf /etc/nginx/sites-available
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/telos-voter.conf /etc/nginx/sites-enabled/telos-voter.conf
sudo service nginx restart
```


### Start the chaininspector program

Tell supervisor to start the chaininspector and keep it alive
```
sudo cp /srv/telos-voter/config/supervisord/telos-chaininspector.conf /etc/supervisor/conf.d/
sudo supervisorctl update
```

### Set up the log rotation for our application
```
sudo cp /srv/telos-voter/config/logrotate/* /etc/logrotate.d/
```

### Start the nodejs frontend
Start the application with pm2
```
sudo -u www-data pm2 start /srv/telos-voter/eos-voter/bin/www
```

Set the application to auto start
```
sudo -u www-data pm2 save
sudo -u www-data pm2 startup systemd
```

It may return to you a command you need to enter into the prompt to run as sudo.

### Run webpack to compress javascript

Run webpack to generate the static files

```
cd /srv/telos-voter/eos-voter/
sudo -u deployment nodejs node_modules/webpack/bin/webpack.js src/votefrontend.js --output public/bin/app.js -d --mode production
sudo chown deployment:www-data /srv/telos-voter -R
```

### Server is set up

You are now up and running with your own telos-voter install

## Upgrade the server

First merge all necessary changes into the master branch of the git repo and push to github.

ssh into the server. Then change to the software directory and pull the updates

```
cd /srv/telos-voter
sudo -u deployment git pull
```

Install any updated npm requirements
```
cd /srv/telos-voter/eos-voter
sudo npm install
```

Run webpack to regenerate the client side javascript
```
cd /srv/telos-voter/eos-voter
sudo -u deployment nodejs node_modules/webpack/bin/webpack.js src/votefrontend.js --output public/bin/app.js --mode production -d
```

Update the chain inspector's requirements
```
cd /srv/telos-voter/chaininspector
sudo ./venv/bin/pip install -r requirements.txt
```

Change the ownership of all files in the directory
```
sudo chown deployment:www-data /srv/telos-voter -R
```

Restart the chain inspector
```
sudo service supervisor restart
```

Restart the app
```
sudo -u www-data pm2 restart all
```

If the operating system packages need an upgrade do the following
Type in

```
sudo apt-get update

sudo apt-get dist-upgrade

sudo apt-get autoremove
```

If it updated then kernel you will need to reboot

```
sudo reboot
```
