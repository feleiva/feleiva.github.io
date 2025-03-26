
import os
import argparse
import imagehash
import annoy
import json
from PIL import Image

def create_bottle_database(image_dir, database_dir):
    image_paths = [os.path.join(image_dir, f) for f in os.listdir(image_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]
    if not image_paths:
        print(f"No images found in {image_dir}")
        return

    if not os.path.exists(database_dir):
        try:
            os.makedirs(database_dir)  # Create the destination directory if it doesn't exist
            print(f"Created destination directory '{database_dir}'.")
        except OSError as e:
            print(f"Error creating destination directory: {e}")
            return

    index_file = os.path.join(database_dir, "hashdb")
    json_file = os.path.join(database_dir, "fileDictionary.json")

    f = 64 # Length of item vector that will be indexed
    t = annoy.AnnoyIndex(f, 'hamming')  # Length of item vector that will be indexed
    
    counter = 0
    for image_path in image_paths:
        try:
            img = Image.open(image_path)
            hash_value = imagehash.phash(img)
            t.add_item(counter, list(hash_value.hash.flatten())) #flatten because .hash gives a 2D numpy array
            counter+=1
        except Exception as e:
            print(f"Error processing {image_path}: {e}")

    t.build(10) # 10 trees
    t.save(index_file) # Save the index to disk
    with open(json_file, 'w') as json_file_fd:
        json.dump(image_paths, json_file_fd, indent=4)  # Use indent for readability
    print(f"Created Annoy index: {index_file} with {len(image_paths)} items")

    return image_paths


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a database with preprocessed images.")
    parser.add_argument("images_directory", help="Path to the source images")
    parser.add_argument("destination_directory", help="Path to the database folder")

    args = parser.parse_args()

    bottle_hashes = create_bottle_database(args.images_directory, args.destination_directory)
    if not bottle_hashes:
        print("Failed to create bottle database. Check your image directory.")

