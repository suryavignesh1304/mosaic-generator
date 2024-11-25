import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex flex-col justify-center items-center text-white">
            <motion.h1
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-6xl font-bold mb-8 text-center"
            >
                Welcome to Mosaic Magic
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-2xl mb-12 text-center max-w-2xl"
            >
                Transform your photos into stunning mosaics with our cutting-edge technology
            </motion.p>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
                className="flex gap-4"
            >
                <Link
                    to="/generate"
                    className="bg-white text-purple-600 px-8 py-4 rounded-full text-xl font-semibold hover:bg-purple-100 transition duration-300"
                >
                    Upload Image
                </Link>
                
                <Link
                    to="/camera"
                    className="bg-white text-purple-600 px-8 py-4 rounded-full text-xl font-semibold hover:bg-purple-100 transition duration-300"
                >
                    Use Camera
                </Link>
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="mt-16 grid grid-cols-3 gap-8"
            >
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white rounded-lg shadow-lg overflow-hidden"
                    >
                        <img
                            src={`./demo${i}.jpg`}
                            alt={`Mosaic example ${i}`}
                            className="w-full h-48 object-cover"
                        />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default HomePage;

