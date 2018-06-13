# eos-voter
Website for voting for EOS Block Producers

## Install Operating System Level packages

Install the necessary operation system packages - these instructions work only for Ubuntu

```
sudo apt-get install git docker.io python3-dev python3-pip python3-setuptools virtualenv
```

Set docker to start automatically

```
sudo systemctl start docker
sudo systemctl enable docker
```

Give your user full access to docker

```
sudo usermod -aG docker $USER
```

You should log out and back in to update group membership. You must completely end the session I had to reboot

## Set up the python environment

```
virtualenv venv -p python3 

source venv/bin/activate

pip install --upgrade pip 

pip install --upgrade setuptools urllib3[secure]

pip install fabric3==1.13.1.post1  # We use fabric3 to automate tasks

fab development.setup
```

To resume developing. Cd to the eos-voter project directory
```
source venv/bin/activate
```

To start the webserver in development

```
fab development.runserver
```

You also need webpack continually running in development. Open another console and cd to the eos-voter directory

```
fab development.webpack
```

To run the bash console inside the docker container (eg to do npm install)
```
fab development.bash
```

