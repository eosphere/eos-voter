import datetime

def log(*args):
    print(datetime.datetime.utcnow().replace(microsecond=0).replace(tzinfo=datetime.timezone.utc).isoformat(), *args)
