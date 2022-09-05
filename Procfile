web: gunicorn -b 0.0.0.0:5000 -k gevent -w 4 erigam:app
web-debug: gunicorn --debug --log-level=debug -b 0.0.0.0:5000 -k gevent -w 1 erigam:app
archiver: python3.5 erigam/archiver.py
matchmaker: python3.5 erigam/matchmaker.py
reaper: python3.5 erigam/reaper.py
live: python3.5 erigam/nado_istyping.py
spamless: python3.5 erigam/extras/usertrack.py
modsummon: python3.5 erigam/extras/modsummon.py