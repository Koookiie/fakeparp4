FROM ubuntu:22.04

# Update packages and install setup requirements.
RUN DEBIAN_FRONTEND=noninteractive apt-get update -y && apt-get -y install build-essential curl libpq-dev libffi-dev git-core software-properties-common
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
RUN DEBIAN_FRONTEND=noninteractive add-apt-repository -y ppa:deadsnakes/ppa && apt-get update && apt-get install -y python3.10 python3.10-dev

# Set WORKDIR to /src
WORKDIR /src

# Add and install Python modules
ADD requirements.txt /src/requirements.txt
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10
RUN python3.10 -m pip install -r requirements.txt

# Bundle app source
ADD . /src

# Install NPM packages
RUN npm install -g grunt-cli
RUN npm install

# Compile CSS and JS
RUN grunt

# Install main module
RUN python3.10 setup.py install

# Expose web port
EXPOSE 5000
