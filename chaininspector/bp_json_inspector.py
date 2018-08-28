import time
import re
import requests
import sys
from pymongo import MongoClient
import os

producers = None

def set_producers(prods):
    global producers
    producers = prods

def valid_url(url):
    if url == '' or url is None:
        return False
    pattern = re.compile('^(https?:\\/\\/)'+ # protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ # domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ # OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ # port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ # query string
    '(\\#[-a-z\\d_]*)?$')
    return pattern.match(url) is not None

def trailing_slash(s):
    if len(s) == 0 or s[-1] != '/':
        return s + '/'
    else:
        return s

def inpsect_bp_json():
    mongo_client = MongoClient('mongodb://mongo:27017/')
    db = mongo_client.eos_producers
    bp_info = db.bp_info
    try:
        global producers
        while True:
            prods = producers
            for bp_name, bp in prods.items():
                print('Connecting to bp.json url for {}'.format(bp['owner']))
                if valid_url(bp['url'].lower()):
                    try:
                        r = requests.get(trailing_slash(bp['url'].lower()) + 'bp.json')
                        if r.status_code == 200:
                            bp_info.update_one({'_id': bp_name}, {"$set": r.json()}, upsert=True)

                    except Exception as ex:
                        print("an EXCEPTION OCCURERD    ex=", ex)

            time.sleep(10)
    except Exception as ex:
        os._exit(1)
