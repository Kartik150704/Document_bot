n=1

data=1
with open('./reader.txt', 'r') as file:
    data=(file.read())
    

fdata=data.split("\n")
print(fdata)
dest=fdata[0]
n=int(fdata[1])
filename=fdata[2]
file_type=fdata[3]
n=n-1
images=[]

for i in range(0,n):
    s=f'{dest}/{file_type}{i+1}.jpg'
    images.append(s)

print(images)
import aspose.words as aw

# fileNames = [ "./Image1.jpg", "./image2.jpg" ,"./image3.jpg"]

fileNames=images

doc = aw.Document()
builder = aw.DocumentBuilder(doc)

for fileName in fileNames:
    builder.insert_image(fileName)
    # Insert a paragraph break to avoid overlapping images.

save_dest=f'{dest}/{filename}.pdf'
doc.save(save_dest)