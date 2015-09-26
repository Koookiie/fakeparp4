FROM ubuntu:14.04

# Update packages
RUN apt-get update -y

# Install pip
RUN DEBIAN_FRONTEND=noninteractive apt-get -y install python3 python3-pip python3-dev libpq-dev libffi-dev

# Set WORKDIR to /src
WORKDIR /src

# Add and install Python modules
ADD requirements.txt /src/requirements.txt
RUN pip install -r requirements.txt

# Bundle app source
ADD . /src

# Install main module
RUN python3 setup.py install

# Expose web port
EXPOSE 5000