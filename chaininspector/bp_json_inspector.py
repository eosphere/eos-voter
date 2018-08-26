import time
import re
import requests
import sys

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
    try:
        global producers
        while True:
            prods = producers
            print("inpsect_bp_json id(prods)", id(prods))
            print("type(prods)=", type(prods))
            for k, bp in prods.items():
                #print("dir(bp)=", bp)
                print('Connecting to {} is valid = {}'.format(bp['url'], valid_url(bp['url'])))
                if valid_url(bp['url'].lower()):
                    print('Getting bp.json')
                    try:
                        r = requests.get(trailing_slash(bp['url'].lower()) + 'bp.json')
                        print('Result status code={}'.format(r.status_code))
                        if r.status_code == 200:
                            print('Json returned=', r.json())
                    except Exception as ex:
                        print("an EXCEPTION OCCURERD    ex=", ex)

            time.sleep(10)
    except Exception as ex:
        sys.exit(-1)
