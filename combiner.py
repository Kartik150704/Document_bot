from PIL import Image
from reportlab.pdfgen import canvas
import os

n = 1

data = 1
with open('./reader.txt', 'r') as file:
    data = (file.read())

fdata = data.split("\n")
print(fdata)
dest = fdata[0]
n = int(fdata[1])
filename = fdata[2]
file_type = fdata[3]
n = n - 1
images = []

for i in range(0, n):
    s = f'{dest}/{file_type}{i + 1}.jpg'
    images.append(s)

print(images)

# Function to convert images to PDF
def images_to_pdf(image_paths, pdf_path):
    c = canvas.Canvas(pdf_path)
    for image_path in image_paths:
        img = Image.open(image_path)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        c.drawInlineImage(img, 0, 0, width=c._pagesize[0], height=c._pagesize[1])
        c.showPage()
    c.save()

# Call the function to convert images to PDF
save_dest = f'{dest}/{filename}.pdf'
images_to_pdf(images, save_dest)

print(f"PDF file created successfully: {save_dest}")
