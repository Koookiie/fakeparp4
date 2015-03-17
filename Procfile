main: gunicorn -b 0.0.0.0:5000 -k gevent -w 4 app:app
main-debug: gunicorn --debug --log-level=debug -b 0.0.0.0:5000 -k gevent -w 1 app:app
archiver: python archiver.py
matchmaker: python matchmaker.py
reaper: python reaper.py
live: python nado_istyping.py
initdb: python initdb.py