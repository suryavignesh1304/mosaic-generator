from flask import Flask, request, send_file, jsonify, send_from_directory
from flask_cors import CORS
import os
import tempfile
import shutil
import logging
import cv2
import numpy as np
import glob
from itertools import product
from types import SimpleNamespace

# Initialize the Flask app
app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)

# Helper function for component image extraction and resizing
def get_component_images(path, size):
    images = []
    avg_colors = []
    for image_path in glob.glob("{}/*.png".format(path)) + glob.glob("{}/*.jpg".format(path)):
        image = cv2.imread(image_path, cv2.IMREAD_COLOR)
        image = cv2.resize(image, (size, size))
        images.append(image)
        avg_colors.append(np.sum(np.sum(image, axis=0), axis=0) / (size ** 2))
    return images, np.array(avg_colors)

# Photomosaic generation logic
def generate_mosaic(input_image_path, pool_dir, output_path, stride, output_width):
    input_image = cv2.imread(input_image_path, cv2.IMREAD_COLOR)
    if input_image is None:
        raise ValueError(f"Failed to load the input image at {input_image_path}. Please check the file path.")
    
    height, width, num_channels = input_image.shape
    blank_image = np.zeros((height, width, 3), np.uint8)

    # Resize images in the pool and get their average colors
    images, avg_colors = get_component_images(pool_dir, stride)

    # Create the mosaic by matching the average colors of the components
    for i, j in product(range(int(width / stride)), range(int(height / stride))):
        partial_input_image = input_image[j * stride: (j + 1) * stride,
                                          i * stride: (i + 1) * stride, :]
        partial_avg_color = np.sum(np.sum(partial_input_image, axis=0), axis=0) / (stride ** 2)
        distance_matrix = np.linalg.norm(partial_avg_color - avg_colors, axis=1)
        idx = np.argmin(distance_matrix)
        blank_image[j * stride: (j + 1) * stride, i * stride: (i + 1) * stride, :] = images[idx]

    cv2.imwrite(output_path, blank_image)

# Route to generate the photomosaic
@app.route('/generate_mosaic', methods=['POST'])
def generate_mosaic_route():
    temp_dir = None
    try:
        # Check if input image is provided
        if 'input' not in request.files:
            return jsonify({'error': 'No input image provided'}), 400
        
        input_image = request.files['input']
        pool_images = request.files.getlist('pool')
        
        # Check if pool images are provided
        if not pool_images:
            return jsonify({'error': 'No pool images provided'}), 400

        # Get additional form parameters (default values if not provided)
        stride = int(request.form.get('stride', 30))
        output_width = int(request.form.get('output_width', 1000))

        # Create a temporary directory to store the input image and pool images
        temp_dir = tempfile.mkdtemp()
        input_path = os.path.join(temp_dir, 'input.jpg')
        input_image.save(input_path)

        # Create a pool directory and save pool images
        pool_dir = os.path.join(temp_dir, 'pool')
        os.makedirs(pool_dir)
        for img in pool_images:
            img.save(os.path.join(pool_dir, img.filename))

        # Define the output path for the mosaic
        output_path = os.path.join(temp_dir, 'output.jpg')

        logging.info(f"Generating mosaic with stride={stride}, output_width={output_width}")
        
        # Call the photomosaic generation function
        generate_mosaic(input_path, pool_dir, output_path, stride, output_width)

        # If the mosaic was generated successfully, return it
        if not os.path.exists(output_path):
            return jsonify({'error': 'Failed to generate mosaic'}), 500

        return send_file(output_path, mimetype='image/jpeg', as_attachment=True, download_name='mosaic.jpg')

    except Exception as e:
        logging.exception("An error occurred while generating the mosaic")
        return jsonify({'error': str(e)}), 500

    finally:
        # Clean up the temporary directory after processing
        if temp_dir and os.path.exists(temp_dir):
            try:
                shutil.rmtree(temp_dir)
            except Exception as e:
                logging.error(f"Error removing temporary directory: {e}")

# Serve the React frontend (index.html)
@app.route('/')
def serve():
    try:
        return send_from_directory(app.static_folder, 'index.html')
    except FileNotFoundError:
        logging.error("index.html not found in static folder")
        return jsonify({'error': 'Frontend not found'}), 404

# Serve any static file (JS, CSS, images, etc.)
@app.route('/<path:path>')
def serve_static(path):
    try:
        return send_from_directory(app.static_folder, path)
    except FileNotFoundError:
        logging.error(f"Static file {path} not found")
        return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    # Ensure the app runs in production mode by using debug only for local development
    app.run(debug=False, host='0.0.0.0', port=5000)
