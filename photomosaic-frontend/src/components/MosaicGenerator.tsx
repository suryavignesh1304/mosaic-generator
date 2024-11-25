import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const MosaicGenerator: React.FC = () => {
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [poolImages, setPoolImages] = useState<FileList | null>(null);
  const [stride, setStride] = useState(30);
  const [outputWidth, setOutputWidth] = useState(1000);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.capturedImage) {
      setInputImage(location.state.capturedImage);
    }
  }, [location.state]);

  const handleInputImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setInputImage(e.target.files[0]);
    }
  }, []);

  const handlePoolImagesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPoolImages(e.target.files);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputImage || !poolImages) {
      setError('Please select both an input image and pool images.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutputImage(null);

    const formData = new FormData();
    formData.append('input', inputImage);
    for (let i = 0; i < poolImages.length; i++) {
      formData.append('pool', poolImages[i]);
    }
    formData.append('stride', stride.toString());
    formData.append('output_width', outputWidth.toString());

    try {
      const response = await axios.post<Blob>('http://localhost:5000/generate_mosaic', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const url = URL.createObjectURL(new Blob([response.data]));
      setOutputImage(url);
    } catch (error) {
      console.error('Error generating mosaic:', error);
      setError('An error occurred while generating the mosaic. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold">Photomosaic Generator</h1>
            </div>
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex flex-col">
                  <label className="leading-loose">Input Image</label>
                  {inputImage ? (
                    <div className="flex items-center">
                      <span className="mr-2">Image selected</span>
                      <button
                        type="button"
                        onClick={() => setInputImage(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleInputImageChange}
                      className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                      required
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Pool Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePoolImagesChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Stride</label>
                  <input
                    type="number"
                    value={stride}
                    onChange={(e) => setStride(parseInt(e.target.value))}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    required
                    min="1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Output Width</label>
                  <input
                    type="number"
                    value={outputWidth}
                    onChange={(e) => setOutputWidth(parseInt(e.target.value))}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    required
                    min="100"
                  />
                </div>
              </div>
              <div className="pt-4 flex items-center space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-500 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none disabled:opacity-50"
                >
                  {isLoading ? 'Generating...' : 'Generate Mosaic'}
                </button>
              </div>
            </form>
            {error && <div className="mt-4 text-red-500">{error}</div>}
            {outputImage && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Generated Mosaic</h2>
                <img src={outputImage} alt="Generated Mosaic" className="w-full rounded-md shadow-lg" />
                <a
                  href={outputImage}
                  download="mosaic.jpg"
                  className="mt-4 inline-block bg-green-500 text-white px-4 py-2 rounded-md"
                >
                  Download Mosaic
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MosaicGenerator;

