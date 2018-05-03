from fabric.api import abort, lcd, local, task, warn_only
from fabric.colors import green, red, yellow
from sys import platform
import os

local_pwd = os.path.realpath(
    os.path.join(os.path.dirname(os.path.realpath(__file__)), '..'))

project_name = os.path.split(local_pwd)[-1]

@task
def build():
    print(yellow('Building docker image...'))
    with lcd('.'):
        local('docker build --tag="{0}" .'.format(project_name))

@task
def setup():
    build()

@task
def bash():
    print(yellow('Running docker process...'))
    with lcd('.'):
        local('docker run --tty --interactive --volume "${PWD}":/opt/project --entrypoint="bash" --publish=3000:3000 "${PWD##*/}"')

