web: gunicorn -b 0.0.0.0:5000 -k gevent -w 4 erigam:app
web-debug: gunicorn --debug --log-level=debug -b 0.0.0.0:5000 -k gevent -w 1 erigam:app
archiver: python erigam/archiver.py
matchmaker: python erigam/matchmaker.py
reaper: python erigam/reaper.py
live: python erigam/nado_istyping.py
