
import os
import argparse
import json
from time import sleep
from PIL import Image
#import google.generativeai as genai
from google import genai
from pydantic import BaseModel

class Bottle(BaseModel):
  brand: str
  type: str
  description: str

def create_bottle_list(image_dir):
    image_paths = [os.path.join(image_dir, f) for f in os.listdir(image_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]
    if not image_paths:
        print(f"No images found in {image_dir}")
        return

    image_list = []
    client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

    if not client:
        print("Could not create AI Model, aborting")
        return

    prompt = "Please identify the bottle on this image and provide me the brand, type and a description with all the info you can extract"

    for image_path in image_paths:
        retry_count = 3
        while(retry_count > 0):
            try:
                img = Image.open(image_path)

                response = client.models.generate_content(
                    model='gemini-2.5-pro-experimental-03-25', # Check model name, this may not work when you run this
                    contents=[prompt, img],
                    config={
                        'response_mime_type': 'application/json',
                        'response_schema': Bottle,
                    },
                )

                print(f"Info for {image_path} = {response.text}")
                bottleInfo = json.loads(response.text)
                bottleInfo["file"]=image_path
                image_list.append(bottleInfo)
                break
            except Exception as e:
                print(f"Error processing {image_path}: {e}")
                retry_count-=1
                sleep(10)
                if retry_count == 0:
                    print(f"Failed to process {image_path} after 3 retries.")
                    image_list.append({"file": image_path, "brand": "PROCESS ERROR", "type": "PROCESS ERROR", "description": "PROCESS ERROR"})

    return image_list


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a database with a description for each image.")
    parser.add_argument("images_directory", help="Path to the source images")
    parser.add_argument("destination_directory", help="Path to the database folder")

    args = parser.parse_args()

    bottle_list = create_bottle_list(args.images_directory)
    if not bottle_list:
        print("Failed to create bottle list. Check your image directory.")
    
    if not os.path.exists(args.destination_directory):
        try:
            os.makedirs(args.destination_directory)  # Create the destination directory if it doesn't exist
            print(f"Created destination directory '{args.destination_directory}'.")
        except OSError as e:
            print(f"Error creating destination directory: {e}")

    if os.path.exists(args.destination_directory):
        json_file = os.path.join(args.destination_directory, "fileDictionary.json")
    
    with open(json_file, 'w') as json_file_fd:
        json.dump(bottle_list, json_file_fd, indent=4)  # Use indent for readability
    print(f"Created json list: {json_file} with {len(bottle_list)} items")

