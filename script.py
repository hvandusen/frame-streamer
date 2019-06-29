from google_images_download import google_images_download   #importing the library
import time
import random
import sys



word = "tent"
if(len(sys.argv)>1):
    word = sys.argv[1]
response = google_images_download.googleimagesdownload()   #class instantiation
for i in range(0,1):
    arguments = {"keywords":word,"limit":10,"offset":1,"print_urls":True,"no_directory":True,"no_numbering":True,
    "extract_metadata": True, "no_download": True,"size": "medium"}   #creating list of arguments
    paths = response.download(arguments)   #passing the arguments to the function
    # print(word)   #printing absolute paths of the downloaded images
    time.sleep(1)
