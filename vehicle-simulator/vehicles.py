import csv
import time
import requests

file_path = './traffic.csv'

def format_row(row: dict):
    for key in row:
        if key == 'vehicle_id' or key == 'vehicle_type' or key == 'vehicle_lane':
            continue
        row[key] = float(row[key])
    
    return row

with open(file_path, 'r') as file:
    csv_reader = csv.DictReader(file, delimiter=';')
    vehicle_values = []
    for row in csv_reader:
        row = format_row(row)
        requests.post("http://localhost:8000/", json=row)
        time.sleep(0.2)


        