# Build / run:
# docker build --tag="${PWD##*/}" .
# docker run --tty --interactive --volume "${PWD}":/opt/project --publish=8000:8000 "${PWD##*/}"
# docker run --tty --interactive --volume "${PWD}":/opt/project --entrypoint="bash" "${PWD##*/}"
# Cleanup:
# docker rm $(docker ps --all --quiet)
# docker rmi $(docker images --quiet --filter "dangling=true")
# docker volume rm $(docker volume ls --quiet)


FROM ubuntu:18.04

ENV last_update 20180823


# Install required packages

RUN apt-get update --quiet --yes && apt-get install --quiet --yes --force-yes \
    curl \
    sudo \
    python3-pip \
    mongodb \
    git

# Install required packages
ADD chaininspector/requirements.txt /root/requirements.txt
RUN pip3 install --upgrade pip
RUN pip3 install --upgrade setuptools urllib3[secure]
RUN pip3 install -r /root/requirements.txt

# Configure environment
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONWARNINGS d

ADD config/installation/install_node_ubuntu /root/install_node_ubuntu

RUN /root/install_node_ubuntu

RUN sudo apt-get install -y nodejs build-essential

RUN mkdir /.config
RUN chmod 777 /.config -R

RUN mkdir /.npm
RUN chmod 777 /.npm -R

# Entrypoint
# Also need
EXPOSE 3001-3001
WORKDIR /opt/project/eos-voter
ENTRYPOINT ["/opt/project/run-eos-voter"]
