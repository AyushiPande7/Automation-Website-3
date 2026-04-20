import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, Send, ImagePlus, Trash2, File as FileIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import API from '../api/ideas';

const categories = ['Project engineering', 'Sales engineering', 'ASRS', 'Integration', 'Software engineering', 'Testing and deployment', 'Other'];

// Helper to determine if a URL/file is an image
export const isImage = (fileName) => {
  if (!fileName) return false;
  return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(fileName.toLowerCase());
};

export default function IdeaForm({ isOpen, onClose, onCreated, initialData }) {
  const [form, setForm] = useState({
    title: '',
    problemStatement: '',
    description: '',
    category: '',
    priority: 'Medium',
    technicalFeasibility: 'Moderate',
    businessImpact: 'Medium',
    expectedDeliveryDate: '',
    assignedReviewer: '',
    outcomesAndBenefits: '',
    hoursSaved: '',
    costSaved: '',
    submittedByEmail: '',
    createdAt: new Date().toISOString().split('T')[0]
  });

  const { user } = useAuth();
  const [images, setImages] = useState([]); // For preview & display
  const [previews, setPreviews] = useState([]);
  const [newFiles, setNewFiles] = useState([]); // New File uploads
  const [deletedImages, setDeletedImages] = useState([]); // Track deleted existing images
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize form & images on modal open
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          title: initialData.title || '',
          problemStatement: initialData.problemStatement || '',
          description: initialData.description || '',
          category: initialData.category || '',
          priority: initialData.priority || 'Medium',
          technicalFeasibility: initialData.technicalFeasibility || 'Moderate',
          businessImpact: initialData.businessImpact || 'Medium',
          expectedDeliveryDate: initialData.expectedDeliveryDate || '',
          assignedReviewer: initialData.assignedReviewer || '',
          outcomesAndBenefits: initialData.outcomesAndBenefits || '',
          hoursSaved: initialData.hoursSaved || '',
          costSaved: initialData.costSaved || '',
          submittedByEmail: initialData.submittedByEmail || '',
          createdAt: initialData.createdAt ? initialData.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
        });

        const existingImages = initialData.images || [];
        setImages(existingImages);
        setPreviews(existingImages);
        setNewFiles([]);
        setDeletedImages([]);
      } else {
        setForm({
          title: '',
          problemStatement: '',
          description: '',
          category: '',
          priority: 'Medium',
          technicalFeasibility: 'Moderate',
          businessImpact: 'Medium',
          expectedDeliveryDate: '',
          assignedReviewer: '',
          outcomesAndBenefits: '',
          hoursSaved: '',
          costSaved: '',
          submittedByEmail: user?.email || '',
          createdAt: new Date().toISOString().split('T')[0]
        });
        setImages([]);
        setPreviews([]);
        setNewFiles([]);
        setDeletedImages([]);
      }
    }
  }, [initialData, isOpen, user]);

  // Handle new image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 attachments allowed');
      return;
    }

    const validFiles = files.filter((f) => 
      f.type.startsWith('image/') || 
      f.type === 'application/pdf' || 
      f.name.endsWith('.doc') || 
      f.name.endsWith('.docx') ||
      f.name.endsWith('.exe') ||
      f.name.endsWith('.zip') ||
      f.name.endsWith('.py')
    );
    if (validFiles.length !== files.length) {
      toast.error('Only images, PDFs, Word, EXE, ZIP, and Python files are allowed');
    }

    setNewFiles((prev) => [...prev, ...validFiles]);
    const newPreviews = validFiles.map((file) => ({
      url: URL.createObjectURL(file), // temporary URL for preview
      name: file.name
    }));
    
    // We append the URL/name object onto our preview queue
    // but the `images` state array expects string URLs when editing existing ones
    // We can map them smoothly
    setPreviews((prev) => [...prev, ...newPreviews.map(p => p.url)]);
    // Pass fake paths containing the filename so we can parse extension for UI
    setImages((prev) => [...prev, ...newPreviews.map(p => p.url + '###' + p.name)]);
  };

  // Remove image (existing or new)
  const removeImage = (index) => {
    const removed = images[index];

    // If it's an existing image URL, mark for deletion
    if (initialData?.images?.includes(removed)) {
      setDeletedImages((prev) => [...prev, removed]);
    } else {
      // It's a new file, remove from newFiles
      setNewFiles((prev) =>
        prev.filter((f) => URL.createObjectURL(f) !== removed)
      );
      URL.revokeObjectURL(removed);
    }

    // Remove from images and previews
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || (!user && !form.submittedByEmail)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('problemStatement', form.problemStatement);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('priority', form.priority);
      formData.append('technicalFeasibility', form.technicalFeasibility);
      formData.append('submittedByEmail', form.submittedByEmail);
      formData.append('businessImpact', form.businessImpact);
      formData.append('expectedDeliveryDate', form.expectedDeliveryDate);
      formData.append('assignedReviewer', form.assignedReviewer);
      formData.append('outcomesAndBenefits', form.outcomesAndBenefits);
      formData.append('hoursSaved', form.hoursSaved);
      formData.append('costSaved', form.costSaved);
      formData.append('createdAt', form.createdAt);

      // Append new file uploads
      newFiles.forEach((file) => formData.append('images', file));

      // Include deleted existing images
      formData.append('deletedImages', JSON.stringify(deletedImages));

      let responseData;
      if (initialData) {
        const res = await API.updateIdea(initialData._id, formData);
        responseData = res.data;
        toast.success('🎉 Idea updated successfully!');
      } else {
        const res = await API.createIdea(formData);
        responseData = res.data;
        const displayId = responseData.customId || `WS-${String(responseData._id || responseData.id).toUpperCase().slice(-6)}`;
        toast.success(`🎉 Idea submitted successfully with ID: ${displayId}`, { duration: 6000 });
      }

      onCreated(responseData);

      // Reset form
      setForm({
        title: '',
        problemStatement: '',
        description: '',
        category: '',
        priority: 'Medium',
        technicalFeasibility: 'Moderate',
        businessImpact: 'Medium',
        expectedDeliveryDate: '',
        assignedReviewer: '',
        outcomesAndBenefits: '',
        hoursSaved: '',
        costSaved: '',
        submittedByEmail: user?.email || '',
        createdAt: new Date().toISOString().split('T')[0]
      });
      setImages([]);
      setPreviews((prev) => {
        prev.forEach(URL.revokeObjectURL);
        return [];
      });
      setNewFiles([]);
      setDeletedImages([]);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit idea');
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 p-6 rounded-t-3xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white
                           bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {initialData ? 'Edit Idea' : 'Submit New Idea'}
                  </h2>
                  <p className="text-primary-100 text-sm">
                    {initialData
                      ? 'Update details and add new attachments'
                      : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-120px)]">

               {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Function <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="select-field"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Idea Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Automated Invoice Processing"
                  className="input-field"
                  required
                />
              </div>

              {/* Submitter email (Visible for Guests) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Your Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="submittedByEmail"
                  value={form.submittedByEmail}
                  onChange={handleChange}
                  placeholder="Enter your Email"
                  className="input-field"
                  required
                />
              </div>

              {/* Submitted On Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Submitted On <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="createdAt"
                  value={form.createdAt}
                  onChange={handleChange}
                  className="input-field max-w-[200px]"
                  required
                />
              </div>

             

              {/* Priority & Feasibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="select-field"
                    required
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Technical Feasibility <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="technicalFeasibility"
                    value={form.technicalFeasibility}
                    onChange={handleChange}
                    className="select-field"
                    required
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Complex">Complex</option>
                  </select>
                </div>
              </div>

              {/* Business Impact & Assigned Reviewer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Business Impact <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="businessImpact"
                    value={form.businessImpact}
                    onChange={handleChange}
                    className="select-field"
                    required
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Assigned Reviewer <span className="text-xs text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    name="assignedReviewer"
                    value={form.assignedReviewer}
                    onChange={handleChange}
                    placeholder="Enter reviewer name"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Expected Delivery Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Expected Delivery Date <span className="text-xs text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  name="expectedDeliveryDate"
                  value={form.expectedDeliveryDate}
                  onChange={handleChange}
                  className="input-field max-w-[200px]"
                />
              </div>

              {/* Problem Statement */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Problem Statement <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="problemStatement"
                  value={form.problemStatement}
                  onChange={handleChange}
                  placeholder="What is the problem or pain point you're trying to solve?"
                  className="input-field min-h-[100px] resize-y"
                  required
                />
              </div>

              {/* Description / Proposed Solution */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description / Proposed Solution <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your idea in detail — what problem does it solve and how?"
                  rows={4}
                  className="input-field resize-none"
                  required
                />
              </div>

              {/* Outcomes and Benefits Section */}
              <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100">
                <h3 className="text-sm font-bold text-primary-700 mb-3 flex items-center gap-2">
                  📊 Outcomes and Benefits
                </h3>
                <textarea
                  name="outcomesAndBenefits"
                  value={form.outcomesAndBenefits}
                  onChange={handleChange}
                  placeholder="Describe the outcomes and benefits from this idea in terms of Efforts and Cost"
                  rows={3}
                  className="input-field min-h-[80px] resize-y"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-primary-600 mb-2 uppercase tracking-wider">
                      Est. Hours Saved
                    </label>
                    <input
                      type="number"
                      name="hoursSaved"
                      value={form.hoursSaved}
                      onChange={handleChange}
                      placeholder="e.g. 150"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary-600 mb-2 uppercase tracking-wider">
                      Est. Cost Savings 
                    </label>
                    <input
                      type="number"
                      name="costSaved"
                      value={form.costSaved}
                      onChange={handleChange}
                      placeholder="Enter value in USD"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Image / Document Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Attachments <span className="text-xs text-slate-400 font-normal">(max 5 files, images/pdfs/docs/exe/py)</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.exe,.zip,.py,.pptx"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 hover:border-primary-400
                             rounded-xl p-4 text-center transition-colors group cursor-pointer"
                >
                  <ImagePlus className="w-6 h-6 text-gray-400 group-hover:text-primary-500 mx-auto mb-1 transition-colors" />
                  <p className="text-sm text-gray-500 group-hover:text-primary-600">
                    Click to upload images or documents
                  </p>
                </button>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
                    {images.map((src, i) => {
                      const displaySrc = typeof src === 'string' ? src.split('###')[0] : src;
                      const originalName = typeof src === 'string' ? src.split('###')[1] || src : src;
                      const actualIsImg = isImage(originalName);

                      return (
                      <div key={i} className="relative group/img aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer">
                        {actualIsImg ? (
                          <img
                            src={displaySrc}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 text-primary-500">
                            <FileIcon className="w-8 h-8 mb-1" />
                            <span className="text-[10px] truncate w-full text-center px-1 font-semibold text-slate-500">
                              {originalName.split('/').pop().slice(0, 15)}
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                             e.stopPropagation();
                             e.preventDefault();
                             removeImage(i);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg
                                     opacity-0 group-hover/img:opacity-100 transition-opacity shadow-md z-10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {initialData ? 'Save Changes' : 'Submit Idea'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}