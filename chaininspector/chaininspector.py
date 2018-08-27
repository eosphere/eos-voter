#! /usr/bin/python3
import time
from pymongo import MongoClient
from eosapi import Client
import json
import bp_json_inspector
import threading
import sys

c = Client(nodes=['https://node2.eosphere.io'])

client = MongoClient('mongodb://mongo:27017/')
db = client.eos_producers
producers = db.producers
owners = {}
last_owner = ''
more = None
bp_json_thread_running = False
chain_id = ''

#print("collection names=", db.collection_names(include_system_collections=False))

def download_producers(start_producer):
    #print('download_producers start_producer=', start_producer)
    global owners
    global more
    d = c.get_table_rows(json= True, code= 'eosio', scope= 'eosio',
                     table= 'producers', limit=100, table_key=1,
                     lower_bound=start_producer, upper_bound=-1)

    rows = d['rows']
    more = d['more']

    owners = {**owners, **{bp['owner']:bp for bp in rows }}
    if len(rows) > 0:
        last_owner = [bp['owner'] for bp in rows ][-1]
        if more:
            download_producers(last_owner)

while True:
    try:
        chain_id = c.get_info()['chain_id']
        d = c.get_table_rows(json= True, code= 'eosio', scope= 'eosio',
                         table= 'global', limit=100, table_key=1,
                         lower_bound=0, upper_bound=-1)
        total_activated_stake = d['rows'][0]['total_activated_stake']
        download_producers('')

        bp_json_inspector.set_producers(owners)
        total_votes = sum([float(producer['total_votes']) for producer in owners.values()])
        print("total_votes=", total_votes)
        producers.update_one({'_id': 1}, {"$set": {'_id': 1,
                                                   "chain_id": chain_id,
                                                   "total_activated_stake": total_activated_stake,
                                                   "total_votes" : total_votes,
                                                   "producers": owners}}, upsert=True)

        #if bp_json_thread_running is False:
        #    threading.Thread( target=bp_json_inspector.inpsect_bp_json ).start()
        #    bp_json_thread_running = True

        #print('len(owners)=', len(owners))
        #print('more=', more)
        #print('producers.count=', producers.count())
        time.sleep(5)
    except Exception as ex:
        print("Exception ex=", ex)
        sys.exit(1)
