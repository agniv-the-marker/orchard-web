import os
from PIL import Image, ExifTags

def correct_orientation(img):
    try:
        # Check if EXIF data exists and get the orientation key
        exif = img._getexif()
        if exif is not None:
            for tag, value in exif.items():
                if tag in ExifTags.TAGS and ExifTags.TAGS[tag] == 'Orientation':
                    orientation = value
                    if orientation == 3:
                        img = img.rotate(180, expand=True)
                    elif orientation == 6:
                        img = img.rotate(270, expand=True)
                    elif orientation == 8:
                        img = img.rotate(90, expand=True)
                    break
    except (AttributeError, KeyError, IndexError):
        # If there is no EXIF data or the orientation tag is missing, do nothing
        pass
    return img

def convert_images(input_dir, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    for filename in os.listdir(input_dir):
        lower_name = filename.lower()
        if lower_name.endswith(".jpeg") or lower_name.endswith(".jpg"):
            img_path = os.path.join(input_dir, filename)
            img = Image.open(img_path)
            img = correct_orientation(img)  # Correct orientation if needed
            output_path = os.path.join(output_dir, os.path.splitext(filename)[0] + '.webp')
            img.save(output_path, 'webp')
            print(f"Converted {img_path} to {output_path}")

def main():
    convert_images('./jpg/nighttime', './nighttime')
    convert_images('./jpg/daytime', './daytime')

if __name__ == "__main__":
    main()