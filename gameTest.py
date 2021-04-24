import os

url = "http://localhost:8080"

os.system("start msedge " + url)
os.system("start firefox " + url)
os.system("start chrome " + url)