import os

url = "http://localhost:8002"

os.system("start msedge " + url)
os.system("start firefox " + url)
os.system("start chrome " + url)

os.system("py -m http.server 8002")