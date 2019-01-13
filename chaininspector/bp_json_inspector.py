import time
import re
import requests
import sys
from pymongo import MongoClient
import os
from chainlogger import log

producers = None
mongodb_server = None
chain_id = None
_mongodb_prefix = ''
default_chain_file = 'telos/bp.json'

def set_mongodb_prefix(mongodb_prefix):
    global _mongodb_prefix
    _mongodb_prefix = mongodb_prefix

def set_producers(prods, srv, c):
    global producers
    producers = prods
    global mongodb_server
    mongodb_server = srv
    global chain_id
    chain_id = c

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

def remove_leading_slash(s):
    if len(s) == 0:
        return s
    if s[0] == '/':
        return s[1:]
    else:
        return s

def inpsect_bp_json():
    mongo_client = MongoClient('mongodb://{}:27017/'.format(mongodb_server))
    db = mongo_client.eos_producers
    bp_info = db[_mongodb_prefix + 'bp_info']
    try:
        global producers
        while True:
            prods = producers
            for bp_name, bp in prods.items():
                log("Connecting to bp.json url for {} url = {}".format(bp['owner'], bp['url']))
                if valid_url(bp['url'].lower()):
                    try:
                        result = {}
                        log("Getting chains file")
                        r = requests.get(trailing_slash(bp['url'].lower()) + 'chains.json', timeout=30)
                        if r.status_code == 200:
                            try:
                                chains = r.json()
                                chain_file = chains["chains"][chain_id]
                            except Exception as ex:
                                chain_file = default_chain_file
                        else:
                            chain_file = default_chain_file
                        log("Getting bp.json file=", bp['url'],'=', chain_file)
                        r = requests.get(trailing_slash(bp['url'].lower()) + remove_leading_slash(chain_file), timeout=30)
                        if r.status_code == 200:
                            #log("BP json file contains=", r.content)
                            result = r.json()
                        """
                        r = requests.get(trailing_slash(bp['url'].lower()) + 'bp.json', timeout=30)
                        if r.status_code == 200:
                            result = {**r.json(), **result}
                        """
                        bp_info.update_one({'_id': bp_name}, {"$set": result}, upsert=True)

                    except Exception as ex:
                        log("an EXCEPTION OCCURERD    ex=", ex)

            time.sleep(10)
    except Exception as ex:
        log("bp.json Exception ex=", ex)
        os._exit(1)
    finally:
        log("Finally called")
