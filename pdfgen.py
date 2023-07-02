from PIL import Image
from fpdf import FPDF
import os

folder = 'barcodes'  
output_pdf = 'output.pdf'  
images_per_row = 2  
images_per_column = 3 
image_size_px = 560  
margin = 10  

files = sorted([f for f in os.listdir(folder) if f.endswith('.png') or f.endswith('.jpg')])

pdf = FPDF(orientation='P', unit='pt', format='A4')
pdf.add_page()  # add the first page

image_size_pt = min((pdf.w - 2 * margin) / images_per_row, (pdf.h - 2 * margin) / images_per_column)

for i, file in enumerate(files):
    if i != 0 and i % (images_per_row * images_per_column) == 0:
        pdf.add_page() 


    img = Image.open(os.path.join(folder, file))


    x = margin + (i % images_per_row) * (image_size_pt + margin)
    y = margin + ((i // images_per_row) % images_per_column) * (image_size_pt + margin)

    img = img.resize((image_size_px, image_size_px), Image.ANTIALIAS)
    img_path = f'tmp_{file}'
    img.save(img_path, 'JPEG')
    pdf.image(img_path, x=x, y=y, w=image_size_pt, h=image_size_pt)
    os.remove(img_path)

pdf.output(output_pdf)
