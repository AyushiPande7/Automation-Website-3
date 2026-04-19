import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import API from '../api/ideas';
import Timeline from '../components/Timeline';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
//import { FileText } from "lucide-react";
import {
  ArrowLeft,
  AlertTriangle,
  Image,
  ShieldAlert,
  Tag,
  CalendarDays,
  Trash2,
  TrendingUp,
  ChevronDown,
  Send,
  User,
  Edit,
  Wrench,
  FileText,
  Clock,
  Target,
  File as FileIcon
} from 'lucide-react';
import IdeaForm, { isImage } from '../components/IdeaForm';

/** Valid idea statuses */
const allStatuses = [
  'Pending',
  'Approved',
  'In Progress',
  'Implemented',
  'Rejected',
];

export default function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusDate, setStatusDate] = useState(new Date().toISOString().slice(0,16));
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);


  useEffect(() => {
    if (!id) return;
    fetchIdea();
  }, [id]);

  const fetchIdea = async () => {
    try {
      const { data } = await API.getIdea(id);
      setIdea(data);
    } catch (error) {
      toast.error('Failed to load idea');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }
    setUpdating(true);
    try {
      const { data } = await API.updateStatus(id, {
        status: newStatus,
        note: statusNote,
        date: new Date(statusDate).toISOString()
      });
      setIdea(data);
      setShowStatusUpdate(false);
      setNewStatus('');
      setStatusNote('');
      setStatusDate(new Date().toISOString().slice(0,16));
      toast.success(`Status updated to "${newStatus}"`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.deleteIdea(id);
      toast.success('Idea deleted successfully');
      navigate('/ideas');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete idea');
    } finally {
      setDeleting(false);
    }
  };


  const getProgress = () => {
  const progressMap = {
    "Rejected": 0,
    "Pending": 25,
    "Approved": 50,
    "In Progress": 75,
    "Implemented": 100,
  };

  return progressMap[idea?.status] || 0;
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading idea...</p>
        </div>
      </div>
    );
  }

  if (!idea) return null;

  const isAdmin = user?.role === 'admin';
  const isOwner = false; // As per user request, only Admin can edit/delete/status update

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-12 relative z-10">
          <button
            onClick={() => navigate('/ideas')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold text-sm">Back to Ideas</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                  {idea.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={idea.status} size="lg" />
                  <span className="text-slate-600 text-sm flex items-center gap-1.5 font-medium">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    {idea.category}
                  </span>
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider
                      ${
                        idea?.priority === 'High'
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : idea?.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}
                  >
                    {idea.priority} Priority
                  </span>
                  
                  <span className="text-slate-600 bg-white border border-slate-200 text-[10px] uppercase tracking-wider flex items-center gap-1.5 font-bold px-3 py-1 rounded-full">
                    <Wrench className="w-3 h-3 text-slate-400" />
                    {idea.technicalFeasibility || 'Moderate'}
                  </span>
                  
                  {idea.businessImpact && (
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border
                        ${idea.businessImpact === 'High' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                          idea.businessImpact === 'Medium' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'}
                      `}>
                      Business Impact: {idea.businessImpact}
                    </span>
                  )}

                  {/* Inline Dropdowns mapping exactly to user request */}


                  <span className="text-slate-500 text-sm flex items-center gap-1.5 font-medium ml-2">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(idea.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => setShowEditForm(true)}
                      className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700
                                 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Idea
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600
                                 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold border border-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
                {isAdmin && (
                  <button
                    onClick={() => setShowStatusUpdate(!showStatusUpdate)}
                    className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold
                               px-5 py-2.5 rounded-xl shadow-lg shadow-primary-500/20 transition-all text-sm active:scale-95"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Update Status
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${showStatusUpdate ? 'rotate-180' : ''}`}
                    />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <div className="mt-8 mb-4">
            <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
              <span>Progress</span>
              <span className="text-primary-600">{Math.round(getProgress())}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgress()}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  idea.status === 'Rejected'
                    ? 'bg-red-500'
                    : 'bg-primary-500'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10">
        {/* Status Update Panel */}
        <AnimatePresence>
          {showStatusUpdate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-500" />
                  Update Idea Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      New Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="select-field"
                    >
                      <option value="">Select status</option>
                      {allStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Effective Date
                    </label>
                    <input
                      type="datetime-local"
                      value={statusDate}
                      onChange={(e) => setStatusDate(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Note (optional)
                    </label>
                    <input
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="Add a note about this update"
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowStatusUpdate(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    className="btn-primary flex items-center gap-2"
                  >
                    {updating ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Update Status
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column — Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Problem Statement */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-500" />
                Problem Statement
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {idea.problemStatement || <span className="text-slate-400 italic">Not provided for this legacy idea.</span>}
              </p>
            </motion.div>

            {/* Business Impact Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Business Impact
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Impact Level</p>
                  <p className={`text-lg font-black ${
                    idea.businessImpact === 'High' ? 'text-indigo-600' :
                    idea.businessImpact === 'Medium' ? 'text-purple-600' : 'text-slate-600'
                  }`}>
                    {idea.businessImpact || 'Not Specified'}
                  </p>
                </div>
                {(idea.hoursSaved > 0 || idea.costSaved > 0) && (
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Estimated Savings</p>
                    <p className="text-lg font-black text-emerald-700">
                      {idea.hoursSaved > 0 && `${idea.hoursSaved} Hrs`}
                      {idea.hoursSaved > 0 && idea.costSaved > 0 && '  •  '}
                      {idea.costSaved > 0 && `$${idea.costSaved}`}
                    </p>
                  </div>
                )}
              </div>
              {idea.outcomesAndBenefits && (
                <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{idea.outcomesAndBenefits}</p>
                </div>
              )}
            </motion.div>

            {/* Description / Proposed Solution */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" />
                Proposed Solution
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {idea.description}
              </p>
            </motion.div>

            {/* Attached Images */}
            {Array.isArray(idea.images) && idea.images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-primary-500" />
                  Attached Files
                  <span className="text-sm font-normal text-slate-400">
                    ({idea.images.length})
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {idea.images.map((img, i) => {
                    const actualIsImg = isImage(img);
                    return (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      className="aspect-video rounded-xl overflow-hidden border border-gray-200
                                 cursor-pointer hover:shadow-md transition-shadow bg-gray-50 flex items-center justify-center p-2"
                      onClick={() => {
                        if (actualIsImg) {
                          setSelectedImage(img);
                        } else {
                          window.open(img, '_blank');
                        }
                      }}
                    >
                      {actualIsImg ? (
                        <img
                          src={img}
                          alt={`Attachment ${i + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/800x400/f8fafc/64748b?text=Image+Unavailable';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-primary-600 gap-2 w-full h-full p-4">
                          <FileIcon className="w-10 h-10" />
                          <span className="text-xs font-semibold text-center truncate w-full px-2" title={img.split('/').pop()}>
                            {img.split('/').pop()}
                          </span>
                        </div>
                      )}
                    </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}




            {/* Submitted By */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" />
                Submitted By
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {(idea.submittedByEmail || '?').charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {idea.submittedByEmail || 'Anonymous'}
                  </p>

                  {idea.expectedDeliveryDate && (
                    <span className="text-sm font-semibold text-primary-600 flex items-center gap-1.5 mt-1 bg-primary-50 px-2 py-0.5 rounded-lg border border-primary-100 w-fit">
                      <CalendarDays className="w-3.5 h-3.5" />
                      Delivery: {new Date(idea.expectedDeliveryDate).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Assigned Reviewer (if exists) */}
            {idea.assignedReviewer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6"
              >
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-primary-500" />
                  Assigned Reviewer
                </h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                    {idea.assignedReviewer.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-semibold text-slate-800">{idea.assignedReviewer}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column — Timeline */}
          <div className="space-y-6 lg:sticky lg:top-28 lg:self-start lg:max-h">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                Status Timeline
              </h2>
              <Timeline statusHistory={idea.statusHistory} />
            </motion.div>

            {/* Side Illustration - Dynamic or Generic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-xl border-4 border-white"
            >
              <img 
                src={(Array.isArray(idea.images) && idea.images.find(img => isImage(img))) || "/automation_illustration.png"} 
                alt="Idea Visual" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/automation_illustration.png";
                }}
              />
              <div className="absolute inset-0 bg-transparent from-slate-900/60 via-transparent to-transparent flex flex-col justify-end p-6">
                <p className="text-white font-bold text-lg leading-tight">
                  {Array.isArray(idea.images) && idea.images.some(img => isImage(img)) 
                    ? ""
                    : "Driving efficiency through digital transformation."
                  }
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-3 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Delete Idea?</h3>
                  <p className="text-sm text-slate-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-500 text-white font-semibold px-6 py-3 rounded-xl
                             hover:bg-red-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={selectedImage}
              alt="Full view"
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <IdeaForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        initialData={idea}
        onCreated={(updated) => {
          setIdea(updated);
          setShowEditForm(false);
        }}
      />
    </div>
  );
}
