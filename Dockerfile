# Build / run:
# docker build --tag="${PWD##*/}" .
# docker run --tty --interactive --volume "${PWD}":/opt/project --publish=8000:8000 "${PWD##*/}"
# docker run --tty --interactive --volume "${PWD}":/opt/project --entrypoint="bash" "${PWD##*/}"
# Cleanup:
# docker rm $(docker ps --all --quiet)
# docker rmi $(docker images --quiet --filter "dangling=true")
# docker volume rm $(docker volume ls --quiet)


FROM ubuntu:16.04

ENV last_update 20180503


# Install required packages

RUN apt-get update --quiet --yes && apt-get install --quiet --yes --force-yes curl \
    sudo

ADD config/installation/install_node_ubuntu /root/install_node_ubuntu

RUN /root/install_node_ubuntu

RUN sudo apt-get install -y nodejs build-essential

# Entrypoint
# Also need
EXPOSE 3000-3000
WORKDIR /opt/project/eos-voter
ENTRYPOINT ["/opt/project/run-eos-voter"]





