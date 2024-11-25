from flask import Flask, request, send_file, jsonify, send_from_directory
from flask_cors import CORS
import os
import tempfile
import shutil
import logging
from Photomosaic import main
from types import SimpleNamespace

app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app)

logging.basicConfig(level=logging.INFO)

# Route to generate the photomosaic
@app.route('/generate_mosaic', methods=['POST'])
def generate_mosaic():
    temp_dir = None
    try:
        if 'input' not in request.files:
            return jsonify({'error': 'No input image provided'}), 400
        
        input_image = request.files['input']
        pool_images = request.files.getlist('pool')
        
        if not pool_images:
            return jsonify({'error': 'No pool images provided'}), 400

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
        
        # Create options for the photomosaic function
        options = SimpleNamespace(
            input=input_path,
            output=output_path,
            pool=pool_dir,
            stride=stride,
            output_width=output_width
        )
        
        # Call the photomosaic generation function
        main(options)

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
    return send_from_directory(app.static_folder, 'index.html')

# Serve any static file (JS, CSS, images, etc.)
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    # Ensure the app runs in production mode by using debug only for local development
    app.run(debug=True)
