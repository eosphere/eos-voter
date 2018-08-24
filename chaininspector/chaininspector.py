#! /usr/bin/python3
import time
from pymongo import MongoClient
from eosapi import Client

c = Client(nodes=['https://node2.eosphere.io'])

client = MongoClient('mongodb://mongo:27017/')
db = client.eos_producers
producers = db.producers

while True:
    print(c.get_table_rows(json= True, code= 'eosio', scope= 'eosio',
                     table= 'producers', limit=1500, table_key=1,
                     lower_bound=0, upper_bound=-1))

    #print('Inspect chain')
    time.sleep(1)
