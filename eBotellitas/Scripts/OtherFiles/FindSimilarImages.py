
import os
import argparse
import imagehash
import annoy
import json
from rembg import remove
from PIL import Image

def find_similar_images(image_path, count, database_dir):
    
    if not os.path.exists(image_path):
        print(f"Error search image does not exist: {e}")
        return []
    

    if not os.path.exists(database_dir):
        print(f"Database directory does not exist: {e}")
        return

    index_file = os.path.join(database_dir, "hashdb")
    json_file = os.path.join(database_dir, "fileDictionary.json")

    bottle_paths = []
    with open(json_file, 'r') as json_file_fd:
        bottle_paths = json.load(json_file_fd)

    results = []

    f = 64
    t = annoy.AnnoyIndex(f, 'hamming')
    t.load(index_file)
    try:
        img = Image.open(image_path)
        clean_img = remove(img)  # Automatically removes the background
        bbox = clean_img.getbbox() # get bounding box of non transparent area
        if bbox:
            clean_img = clean_img.crop(bbox)
        clean_img.save("output.png")
        image_hash = imagehash.phash(clean_img)
        nearest_neighbors, distances = t.get_nns_by_vector(list(image_hash.hash.flatten()), count, include_distances=True) # Only find the top count nearest neighbor
        
        for index in range(len(nearest_neighbors)):
            similarity = 1 - (distances[index] / f)
            results.append((bottle_paths[nearest_neighbors[index]], similarity))
        

    except Exception as e:
        print(f"Error processing uploaded image: {e}")
        results()
    
    return results


def generate_html_page(search_image, result_data, output_file="result.html"):
    """
    Generates an HTML page to display a list of images.

    Args:
        image_paths (list): A list of image file paths.
        output_file (str): The name of the HTML file to create (default: "images.html").
    """

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>My Images</title>
    <style>
        body {{
            font-family: sans-serif;
            text-align: center;
        }}
        .image-container {{
            display: inline-block; /* Display images horizontally */
            margin: 10px;        /* Add spacing between images */
            border: 1px solid #ccc;  /* Optional border */
            padding: 5px;         /* Optional padding */
        }}
        img {{
            max-width: 200px;      /* Adjust maximum image width */
            max-height: 200px;     /* Adjust maximum image height */
            display: block;       /* Remove extra spacing below images */
        }}
    </style>
</head>
<body>
    <h1>Image search</h1>
"""
    html_content += f"""
<div class="image-container">
    <img src="{search_image}" alt="Original">
    <p>Original</p>
</div>
<div class="image-container">
    <img src="output.png" alt="Clean">
    <p>Clean</p>
</div>
"""
    html_content += f"""
    <h1>closer images on the collection</h1>
"""
    for image_info in result_data:
            html_content += f"""
<div class="image-container">
    <img src="{image_info[0]}" alt="{image_info[0]}">
    <p>{image_info[1]}</p>
</div>
"""
    html_content += """
</body>
</html>
"""
    try:
        with open(output_file, "w") as f:
            f.write(html_content)
        print(f"HTML page generated successfully: {output_file}")

    except Exception as e:
        print(f"Error generating HTML page: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Final Similar images.")
    parser.add_argument("image_to_search", help="Path to the image to find")

    args = parser.parse_args()

    similar_images=find_similar_images(args.image_to_search, 5, "db")

    sorted_similar_images = sorted(similar_images, key=lambda x: x[1], reverse=True) #sort the tuples based on the element at index 1
    print(sorted_similar_images)  # Output: [(2, 'a'), (3, 'b'), (1, 'z')]
    generate_html_page(args.image_to_search, sorted_similar_images)

