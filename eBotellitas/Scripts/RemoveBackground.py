
import os
import shutil
import argparse
from rembg import remove
from PIL import Image

def clean_jpg_files(source_dir, destination_dir):
    """
    Remove the background of all jpg files on the source directory and store them as PNGs at destination_dir.

    Args:
        source_dir (str): The path to the source directory.
        destination_dir (str): The path to the destination directory.
    """

    if not os.path.exists(source_dir):
        print(f"Source directory '{source_dir}' does not exist.")
        return

    if not os.path.exists(destination_dir):
        try:
            os.makedirs(destination_dir)  # Create the destination directory if it doesn't exist
            print(f"Created destination directory '{destination_dir}'.")
        except OSError as e:
            print(f"Error creating destination directory: {e}")
            return


    count = 0
    for filename in os.listdir(source_dir):
        if filename.lower().endswith(".jpg") or filename.lower().endswith(".jpeg") or filename.lower().endswith(".png"):  # Case-insensitive check for .jpg or .jpeg
            source_path = os.path.join(source_dir, filename)
            root, ext = os.path.splitext(filename)  # Split into filename and extension
            destination_path = os.path.join(destination_dir, root + ".png")
            try:
                input = Image.open(source_path)
                output = remove(input)  # Automatically removes the background
                bbox = output.getbbox() # get bounding box of non transparent area
                if bbox:
                    cropped_output = output.crop(bbox)
                    cropped_output.save(destination_path)
                else:
                    output.save(destination_path)
                count += 1
                print(f"Processed {destination_path}")
            except OSError as e:
                print(f"Error removing background on '{filename}': {e}")
    print(f"Processed {count} JPG file(s) from '{source_dir}' to '{destination_dir}'.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Copy JPG files from one directory to another.")
    parser.add_argument("source_directory", help="Path to the source directory")
    parser.add_argument("destination_directory", help="Path to the destination directory")

    args = parser.parse_args()

    clean_jpg_files(args.source_directory, args.destination_directory)

