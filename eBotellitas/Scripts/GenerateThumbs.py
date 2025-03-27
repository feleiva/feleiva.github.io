
import os
import argparse
from PIL import Image

def create_image_thumbs(image_dir, thumbs_dir):
    image_paths = [os.path.join(image_dir, f) for f in os.listdir(image_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]
    if not image_paths:
        print(f"No images found in {image_dir}")
        return

    if not os.path.exists(thumbs_dir):
        try:
            os.makedirs(thumbs_dir)  # Create the destination directory if it doesn't exist
            print(f"Created destination directory '{thumbs_dir}'.")
        except OSError as e:
            print(f"Error creating destination directory: {e}")
            return

    for image_path in image_paths:
        try:
            img = Image.open(image_path)
            img.thumbnail((256, 256))
            img.save(os.path.join(thumbs_dir, os.path.basename(image_path)))
            print(f"Processed {image_path}")
        except Exception as e:
            print(f"Error processing {image_path}: {e}")

    return


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a thumbnails for all the images on the source folder.")
    parser.add_argument("images_directory", help="Path to the source images")
    parser.add_argument("destination_directory", help="Path to the target thumb folder")

    args = parser.parse_args()

    create_image_thumbs(args.images_directory, args.destination_directory)
    
