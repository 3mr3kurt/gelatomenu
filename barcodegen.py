import json
import os
from PIL import Image, ImageOps
from barcode import Code128
from barcode.writer import ImageWriter

def generate_barcodes(json_file, output_dir):
    with open(json_file, 'r') as file:
        data = json.load(file)

    os.makedirs(output_dir, exist_ok=True)

    for flavor in data.keys():
        try:
            barcode = Code128(flavor, writer=ImageWriter())
            img = barcode.render()
            width, height = img.size
            diff = abs(width - height)
            padding = (0, 0, 0, diff) if width > height else (0, 0, diff, 0)
            new_img = ImageOps.expand(img, padding, fill='white')
            filename = os.path.join(output_dir, '{}_barcode.jpg'.format(flavor))
            new_img.save(filename)
        except Exception as e:
            print(f"Error processing key '{flavor}': {e}")

    print('Barcodes saved in directory {}.'.format(output_dir))

generate_barcodes('flavors.json', 'barcodes')
