import React, { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

const CameraPage: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const navigate = useNavigate();

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
        }
    }, [webcamRef]);

    const retake = () => {
        setCapturedImage(null);
    };

    const proceedToMosaic = () => {
        if (capturedImage) {
            // Convert base64 to blob
            fetch(capturedImage)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "captured_image.jpg", { type: "image/jpeg" });
                    navigate('/generate', { state: { capturedImage: file } });
                });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex flex-col justify-center items-center text-white">
            <h1 className="text-4xl font-bold mb-8">Capture Your Image</h1>
            <div className="w-full max-w-md">
                {!capturedImage ? (
                    <>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full rounded-lg shadow-lg"
                        />
                        <button
                            onClick={capture}
                            className="mt-4 bg-white text-purple-600 px-6 py-3 rounded-full text-xl font-semibold hover:bg-purple-100 transition duration-300 w-full"
                        >
                            Capture Photo
                        </button>
                    </>
                ) : (
                    <>
                        <img src={capturedImage} alt="captured" className="w-full rounded-lg shadow-lg" />
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={retake}
                                className="bg-white text-purple-600 px-6 py-3 rounded-full text-xl font-semibold hover:bg-purple-100 transition duration-300 flex-1"
                            >
                                Retake
                            </button>
                            <button
                                onClick={proceedToMosaic}
                                className="bg-green-500 text-white px-6 py-3 rounded-full text-xl font-semibold hover:bg-green-600 transition duration-300 flex-1"
                            >
                                Use Photo
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CameraPage;
