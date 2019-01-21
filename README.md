# eos-voter
Website for voting for EOSIO Block Producers

To set up this project

```
virtualenv venv -p python3

source venv/bin/activate

pip install --upgrade pip

pip install --upgrade setuptools urllib3[secure]

pip install fabric3==1.14.post1  # We use fabric3 to automate tasks

fab development.setup_network

fab development.setup

fab development.setup_mongodb
```

To resume developing. Cd to the eos-voter project directory
```
source venv/bin/activate
```

To run the voter in development we need three docker containers to be running.
The chain inspector, webpack and the web server.

To start them run each of the following commands in a seperate console window.
Dont forget to set up the venv before hand

```
fab development.webpack
```

```
fab development.chaininspector
```

```
fab development.runserver
```

To run the bash console inside the docker container (eg to do npm install)
```
fab development.bash
```
