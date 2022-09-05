rp.terminallycapricio.us
======

Code for [rp.terminallycapricio.us](http://rp.terminallycapricio.us). Used to be erigam but domain changed. It's available under the MIT license. It is based off of MSPARP and Charat, which is the code for [msparp.com](http://msparp.com).

It's driven by Python, Redis and Postgres.

Disclaimer: This code is literal garbage and you shouldn't use any parts of it seriously.

# Dev testing

```
virtualenv env
source env/bin/activate
python setup.py develop
export REDIS_HOST=127.0.0.1
export REDIS_PORT=6379
export REDIS_DB=0
export DATABASE_URL=postgres://yourusername:yourpassword@yourhost/yourdatabase
python erigam
```