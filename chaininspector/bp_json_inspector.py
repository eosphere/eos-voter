import time
import re
import requests
import sys
from pymongo import MongoClient
import os
from chainlogger import log
from urllib.parse import urlparse

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

def get_root_url(s):
    u = urlparse(s)
    return u.scheme + '://' + u.netloc + '/'

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
                        r = requests.get(get_root_url(bp['url'].lower()) + 'chains.json', timeout=30)
                        print('statuscode=',  r.status_code)
                        if r.status_code == 200:
                            try:
                                chains = r.json()
                                chain_file = chains["chains"][chain_id]
                                using_default_file = False
                                print('Found chain_file=', chain_file)
                            except Exception as ex:
                                chain_file = default_chain_file
                                using_default_file = True
                        else:
                            chain_file = default_chain_file
                            using_default_file = True
                        log("Getting bp.json file=", bp['url'],'=', chain_file)
                        r = requests.get(get_root_url(bp['url'].lower()) + remove_leading_slash(chain_file), timeout=30)
                        if r.status_code == 200:
                            #log("BP json file contains=", r.content)
                            try:
                                result = r.json()
                            except:
                                # Goodblock doesn't give a 404 on this URL very embarrasing
                                r = requests.get(get_root_url(bp['url'].lower()) + remove_leading_slash('bp.json'), timeout=30)
                                result = r.json()
                        elif using_default_file:
                            r = requests.get(get_root_url(bp['url'].lower()) + remove_leading_slash('bp.json'), timeout=30)
                            result = r.json()
                        else:
                            print('url=',trailing_slash(bp['url'].lower()) + remove_leading_slash(chain_file), 'status code=', r.status_code)
                        """
                        r = requests.get(trailing_slash(bp['url'].lower()) + 'bp.json', timeout=30)
                        if r.status_code == 200:
                            result = {**r.json(), **result}
                        """
                        if len(result) > 0:
                            bp_info.update_one({'_id': bp_name}, {"$set": result}, upsert=True)

                    except Exception as ex:
                        log("an EXCEPTION OCCURERD    ex=", ex)

            time.sleep(10)
    except Exception as ex:
        log("bp.json Exception ex=", ex)
        os._exit(1)
    finally:
        log("Finally called")
