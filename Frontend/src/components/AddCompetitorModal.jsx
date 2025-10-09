import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const AddCompetitorModal = ({ isOpen, onClose, onAdd }) => {
  const [handle, setHandle] = useState('');
  const [platform] = useState('YouTube'); // Hardcoded as per backend limitation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handle) {
      setError('Please enter a YouTube channel handle.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onAdd({ platform, handle });
      onClose(); // Close modal on success
      setHandle(''); // Reset form
    } catch (err) {
      setError(err.message || 'Failed to add competitor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Add New Competitor</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X />
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Enter the YouTube channel handle (e.g., "mkbhd", "mrbeast"). The system will fetch their latest videos.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-white mb-2" htmlFor="handle">
                  YouTube Handle
                </label>
                <input
                  id="handle"
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@handle"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-white bg-gray-600 hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-gray-500"
                >
                  {loading ? 'Adding...' : 'Add Competitor'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddCompetitorModal;