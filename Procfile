web: gunicorn -b 0.0.0.0:5000 -k gevent -w 4 erigam:app
web-debug: gunicorn --debug --log-level=debug -b 0.0.0.0:5000 -k gevent -w 1 erigam:app
archiver: python3.10 erigam/archiver.py
matchmaker: python3.10 erigam/matchmaker.py
reaper: python3.10 erigam/reaper.py
live: python3.10 erigam/nado_istyping.py
spamless: python3.10 erigam/extras/usertrack.py
modsummon: python3.10 erigam/extras/modsummon.py
release: alembic upgrade head