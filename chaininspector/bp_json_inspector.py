import time

producers = None

def set_producers(prods):
    global producers
    producers = prods

def inpsect_bp_json():
    global producers
    while True:
        prods = producers
        print("inpsect_bp_json id(prods)", id(prods))
        time.sleep(10)
