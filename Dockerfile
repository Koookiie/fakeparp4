FROM ubuntu:14.04

# Update packages and install setup requirements.
RUN DEBIAN_FRONTEND=noninteractive apt-get update -y && apt-get -y install python3.5 python3.5-setuptools python3.5-dev libpq-dev libffi-dev git-core

# Set WORKDIR to /src
WORKDIR /src

# Add and install Python modules
ADD requirements.txt /src/requirements.txt
RUN python3.5 easy_install.py  pip
RUN python3.5 -m pip install --upgrade setuptools
RUN python3.5 -m pip install -r requirements.txt

# Bundle app source
ADD . /src

# Install main module
RUN python3.5 setup.py install

# Expose web port
EXPOSE 5000
