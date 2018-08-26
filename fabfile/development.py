# This file licenced under the Apach 2.0 licence

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
    npm_install()

@task
def bash():
    print(yellow('Running docker process bash...'))
    with lcd('.'):
        local('docker run --tty --interactive --volume "{local_pwd}":/opt/project '
              '--entrypoint="bash" --publish=3000:3000 '
              '--network={project_name}-network '
              '--network-alias=webserver '
              '--user=$(id -u):$(id -g) "{project_name}"'.format(
                    local_pwd=local_pwd, project_name=project_name))

@task
def npm_install():
    print(yellow('Running docker process npm_install...'))
    with lcd('.'):
        local('docker run --tty --interactive --volume "{local_pwd}":/opt/project '
              '--entrypoint="/opt/project/run-npm-install" '
              '--user=$(id -u):$(id -g) "{project_name}"'.format(
                    local_pwd=local_pwd, project_name=project_name))

@task
def runserver():
    print(yellow('Running docker process webserver...'))
    with lcd('.'):
        ret = local('docker ps --quiet --filter "label={project_name}-webpack"'.format(project_name=project_name), capture=True)
        if len(ret) == 0:
            abort(red('Could not runserver. Have you run '
                      '\'fab development.webpack\'?'))
        with warn_only():
            result = local('docker start {project_name}-mongo'.format(
                project_name=project_name))
        if result.failed:
            abort(red('Could not start mongodb. Have you run \'setup_mongodb\'?'))
        local('docker run --tty --interactive --volume "{local_pwd}":/opt/project '
              '--entrypoint="/opt/project/run-eos-voter" --publish=3000:3000 '
              '--network={project_name}-network '
              '--network-alias=webserver '
              #'--user=$(id -u):$(id -g) '
              '"{project_name}"'.format(
                    local_pwd=local_pwd, project_name=project_name))

@task
def webpack():
    print(yellow('Running docker process...'))
    with lcd('.'):
        local('docker run --tty --interactive '
              '--label {project_name}-webpack '
              '--volume "{local_pwd}":/opt/project '
              '--entrypoint="/opt/project/run-webpack" '
              #'--user=$(id -u):$(id -g) '
              '"{project_name}"'.format(
                    local_pwd=local_pwd, project_name=project_name))

@task
def setup_network():
    print(yellow('Launching docker network...'))
    with lcd('.'):
        local('docker network create --driver bridge {project_name}-network'
              ''.format(project_name=project_name))

@task
def setup_mongodb():
    print(yellow('Launching detached mongodb docker process...'))
    with lcd('.'):
        with warn_only():
            result = local('docker run --detach --name={project_name}-mongo '
                           '--network={project_name}-network '
                           '--network-alias=mongo '
                           '-d mongo '.format(
                            project_name=project_name))
            if result.failed:
                abort(red('Could not setup mongodb. Have you run '
                    '\'setup_network\'?'))

@task
def chaininspector():
    print(yellow('Running docker process...'))
    with lcd('.'):
        with warn_only():
            result = local('docker start {project_name}-mongo'.format(
                project_name=project_name))
        if result.failed:
            abort(red('Could not start mongodb. Have you run \'setup_mongodb\'?'))
        local('docker run --tty --interactive '
              '--label {project_name}-chaininspector '
              '--volume "{local_pwd}":/opt/project '
              '--entrypoint="/opt/project/run-chain-inspector" '
              '--network={project_name}-network '
              #'--user=$(id -u):$(id -g) '
              '"{project_name}"'.format(
                    local_pwd=local_pwd, project_name=project_name))
