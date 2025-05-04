"""
Just does image stuff
"""

import json
import os
from datetime import datetime

from PIL import ExifTags, Image

# Define directories
input_dirs = ['daytime', 'nighttime']  # Folders containing images
OUTPUT_FILE = "./images.js" # "../images.js"  # Output JS file

# Dictionaries to store images categorized by date
day_images_by_date: dict[str, list[str]] = {}  # {date: [image_paths]}
night_images_by_date: dict[str, list[str]] = {}  # {date: [image_paths]}

# Function to extract the date an image was taken
def get_image_date(image_path):
    """
    Takes an image file path and returns the date the image was taken.
    """
    try:
        img = Image.open(image_path)
        exif = img._getexif()
        if exif:
            for tag, value in exif.items():
                tag_name = ExifTags.TAGS.get(tag, tag)
                if tag_name == "DateTimeOriginal":
                    return datetime.strptime(value, "%Y:%m:%d %H:%M:%S").date()
        return None
    except (IOError, OSError, ValueError) as e:
        print(f"Error reading {image_path}: {e}")
        return None


# Process images from each directory
for dir_name in input_dirs:
    for file in os.listdir(dir_name):
        if file.lower().endswith(("jpg", "jpeg", "png")):
            file_path = os.path.join(dir_name, file)
            file_url = f"/images/{dir_name}/{file}"
            date_taken = get_image_date(file_path)

            if date_taken:
                # Add image to the appropriate dictionary based on directory
                if dir_name == "daytime":
                    day_images_by_date.setdefault(str(date_taken), []).append(file_url)
                elif dir_name == "nighttime":
                    night_images_by_date.setdefault(str(date_taken), []).append(file_url)
            else:
                print(f"Could not determine date for {file}")

# Save categorized images to a JavaScript file
# Save categorized images to a JavaScript file
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("const dayDates = " + json.dumps(sorted(day_images_by_date.keys()), indent=4) + ";\n")
    f.write("const nightDates = " + json.dumps(sorted(night_images_by_date.keys()), indent=4) + ";\n\n")
    f.write("const dayImagesByDate = " + json.dumps(day_images_by_date, indent=4) + ";\n")
    f.write("const nightImagesByDate = " + json.dumps(night_images_by_date, indent=4) + ";\n")

print(f"Images categorized by date and saved to {OUTPUT_FILE}.")