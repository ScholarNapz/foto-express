from PIL import Image
import sys
import sys

"""
Thumbnail Generator
Installation: pip3 install Pillow

Usage:
Write to specific image and path:
    - python3 thumbnail.py input.png output.png scale

Use defaults
    - python3 thumbnail.py input.png
"""

default_resize = 300
default_suffix = "_small"
default_path   = "./profileimages/"

def generate_thumbnail(target, output, scale):
    try:
        image = Image.open(target)
        image.thumbnail((int(scale),int(scale)))
        image.save(output)
        sys.exit()

    except Exception as e:
        print(e)

try:
    target_image = sys.argv[1]
    output_image = sys.argv[2]
    image_scale = sys.argv[3]
    generate_thumbnail(target_image, output_image, image_scale)
except Exception as e:
    try:
        print(e)
        target_image = sys.argv[1]
        print("Input:",target_image)
        target_image_processed = target_image.split('/')[-1]
        target_image_processed = target_image_processed.split('\\')[-1]

        output_image = target_image_processed.rsplit(".",1)[0]
        output_format = target_image_processed.rsplit(".",1)[-1]
        output_image = "{}{}{}.{}".format(
            default_path,
            output_image, 
            # default_suffix, 
            output_format
        )
        print("Input:",target_image)
        print("Processed:",target_image_processed)
        print("Output:",output_image)
        generate_thumbnail(target_image, output_image, default_resize)
    except Exception as e:
        print(e)