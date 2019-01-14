#! /usr/bin/python3
import time
from pymongo import MongoClient
from eosapi import Client
import json
import bp_json_inspector
import threading
import sys
import os
from chainlogger import log
import datetime

mongodb_prefix = ''
bp_json_inspector.set_mongodb_prefix(mongodb_prefix)

c = Client(nodes=['https://telos.eosphere.io'])

if len(sys.argv) != 2:
    raise Exception("You must provide the IP address of the mongodb server on the commandline")

mongodb_server = sys.argv[1]

client = MongoClient('mongodb://{}:27017/'.format(mongodb_server))
db = client.eos_producers
producers = db[mongodb_prefix + 'producers']
owners = {}
last_owner = ''
more = None
bp_json_thread_running = False
chain_id = ''

def auto_retry(fn, retries=10, delay=10):
    # If run fn and return the result. If exception retry up to retries times
    # and waiting delay seconds between attempts
    try:
        return fn()
    except Exception as e:
        log('auto_retry exception e =',e,' retries=', retries)
        time.sleep(delay)
        if retries > 0:
            return auto_retry(fn, retries=retries-1, delay=delay)
        else:
            raise

def download_producers(start_producer):
    global owners
    global more
    d = auto_retry(lambda: c.get_table_rows(json= True, code= 'eosio', scope= 'eosio',
                     table= 'producers', limit=100, table_key=1,
                     lower_bound=start_producer, upper_bound=-1))

    rows = d['rows']
    more = d['more']

    owners = {**owners, **{bp['owner']:bp for bp in rows }}
    if len(rows) > 0:
        last_owner = [bp['owner'] for bp in rows ][-1]
        if more:
            download_producers(last_owner)

log('Chain inspector starting')
try:
    while True:
        chain_id = auto_retry(lambda: c.get_info()['chain_id'])
        d = auto_retry(lambda: c.get_table_rows(json= True, code= 'eosio', scope= 'eosio',
                         table= 'global', limit=100, table_key=1,
                         lower_bound=0, upper_bound=-1))
        total_activated_stake = d['rows'][0]['total_activated_stake']
        download_producers('')

        owners = {k: v for (k, v) in owners.items() if v['is_active'] == 1}

        bp_json_inspector.set_producers(owners, mongodb_server, chain_id)
        #total_votes = sum([float(producer['total_votes']) for producer in owners.values() if producer['is_active'] == True])
        total_votes = d['rows'][0]['total_producer_vote_weight']
        #print('total_votes=', total_votes)
        producers.update_one({'_id': 1}, {'$set': {'_id': 1,
                                                   'chain_id': chain_id,
                                                   'total_activated_stake': total_activated_stake,
                                                   'total_votes' : total_votes,
                                                   'producers': owners,
                                                   'updatetime': datetime.datetime.utcnow()}}, upsert=True)

        log('Producer list downloaded')

        if bp_json_thread_running is False:
            threading.Thread( target=bp_json_inspector.inpsect_bp_json ).start()
            bp_json_thread_running = True

        time.sleep(5)
except Exception as ex:
    log("Chain inspector Exception ex=", ex)
    os._exit(1)
finally:
    log("Finally called")
    os._exit(1)
