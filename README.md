# eos-voter
Website for voting for EOS Block Producers

To set up this project

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

