import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 

import { Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, X, Trash2, Users, Crown, UserCheck,
  User as UserIcon, Edit3, AlertTriangle, Loader2,
  Upload, ImageIcon
} from 'lucide-react';   

import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import TeamAPI from '../api/team';

/* ═══════════════════════════════════════════════════════════════
   Avatar — initials fallback, image if URL provided
═══════════════════════════════════════════════════════════════ */
function Avatar({ name = '', imageUrl = '', type = 'member', size = 'md' }) {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    sm: 'w-10 h-10 text-sm border-2',
    md: 'w-14 h-14 text-base border-2',
    lg: 'w-20 h-20 text-2xl border-[3px]',
    xl: 'w-28 h-28 text-3xl border-4',
  };

  const gradients = {
    Director:       'from-amber-400 to-amber-600',
    'Group Leader': 'from-primary-500 to-primary-700',
    member:         'from-rose-500 to-rose-700',
  };

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover border-white shadow-md flex-shrink-0`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} bg-gradient-to-br ${gradients[type] || gradients.member}
                  rounded-full flex items-center justify-center text-white font-black
                  shadow-md border-white flex-shrink-0`}
    >
      {initials || <UserIcon className="w-1/2 h-1/2" />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Type badge
═══════════════════════════════════════════════════════════════ */
function TypeBadge({ type }) {
  const map = {
    Director:             { label: 'Director',           cls: 'bg-amber-50 text-amber-700 border-amber-200',    icon: Crown },
    'Group Leader':       { label: 'Group Leader',       cls: 'bg-primary-50 text-primary-700 border-primary-200', icon: UserCheck },
    member:               { label: 'Core Team Member',   cls: 'bg-rose-50 text-rose-700 border-rose-200',   icon: Users },
  };  {/* edited by INAP : changed label: 'Core Team Member' */}
  const typeKey = (type === 'executive_director' || type === 'director' || type === 'Executive Director') ? 'Director' : 
                  (type === 'group_leader' || type === 'team_leader') ? 'Group Leader' : type;
  const { label, cls, icon: Icon } = map[typeKey] || map.member;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${cls}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Member Detail Modal
═══════════════════════════════════════════════════════════════ */
{/* edited by INAP : added onEditRequest */}
function MemberModal({ member, onClose, isAdmin, onDeleteRequest, onEditRequest }) {
  if (!member) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="member-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Blur backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 24 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md border-2 border-gray-100 overflow-hidden"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 bg-gray-100 hover:bg-gray-200
                       rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* Header band */}
          <div
            className={`px-8 pt-8 pb-6 flex flex-col items-center text-center
              ${(member.type === 'Director' || member.type === 'Executive Director')
                ? 'bg-gradient-to-br from-amber-50 to-amber-100'
                : member.type === 'group_leader' || member.type === 'Group Leader'
                ? 'bg-gradient-to-br from-primary-50 to-primary-100'
                : 'bg-gradient-to-br from-indigo-50 to-indigo-100'
              }`}
          >
            <Avatar
              name={member.name}
              imageUrl={member.imageUrl}
              type={member.type}
              size="xl"
            />

            <h3 className="text-xl font-black text-slate-900 leading-tight">
              {member.name}
            </h3>
	    
          </div>

          {/* Description */}
          <div className="px-8 py-6">
            {member.description ? (
              <p className="text-slate-600 leading-relaxed font-medium text-sm whitespace-pre-wrap">
                {member.description}
              </p>
            ) : (
              <p className="text-slate-400 italic text-sm">No description added.</p>
            )}
          </div>
	  
	  {/* edited by INAP : added edit option in card */}
          {/* Admin actions */}
          {isAdmin && (
            <div className="px-8 pb-6 flex flex-col gap-2">
              <button
                onClick={() => { onClose(); onEditRequest(member); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold
                           text-slate-700 hover:bg-slate-50 border-2 border-slate-200 rounded-2xl transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Member
              </button>
              <button
                onClick={() => { onClose(); onDeleteRequest(member); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold
                           text-red-600 hover:bg-red-50 border-2 border-red-100 rounded-2xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove Member
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Delete Confirm Modal
═══════════════════════════════════════════════════════════════ */
function DeleteConfirmModal({ member, onConfirm, onCancel, loading }) {
  if (!member) return null;
  return (
    <AnimatePresence>
      <motion.div
        key="delete-confirm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full border-2 border-gray-100 z-10"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Remove team member?</h3>
              <p className="text-sm text-slate-500 mt-1">
                <span className="font-bold text-slate-700">{member.name}</span> will be removed from the org chart. This cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary flex-1" disabled={loading}>
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600
                         text-white font-bold py-3 rounded-xl transition-colors active:scale-95 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Remove
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Add Member Modal
═══════════════════════════════════════════════════════════════ */
const EMPTY_FORM = { name: '', role: '', type: 'member', description: '' };

function AddMemberModal({ onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);   // the File object
  const [photoPreview, setPhotoPreview] = useState(null); // object URL for preview
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // cleanup object URL on unmount
  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.role.trim()) e.role = 'Role / Job Title is required';
    return e;
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      // Always send as FormData so the photo file is included
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('role', form.role.trim());
      fd.append('type', form.type);
      fd.append('description', form.description.trim());
      fd.append('sortOrder', '0');
      if (photoFile) fd.append('photo', photoFile);

      const { data } = await TeamAPI.createMember(fd);
      toast.success(`✅ ${data.name} added to the team!`);
      onSaved(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };


  const typeOptions = [
    { value: 'Director', label: 'Director', icon: '👑' },
    { value: 'Group Leader',      label: 'Group Leader',       icon: '🛡️' },
    { value: 'member',            label: 'Core Team Member',   icon: '👤' },
  ]; {/* edited by INAP : changed label: 'Core Team Member' */}

  return (
    <AnimatePresence>
      <motion.div
        key="add-member-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 24 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg border-2 border-gray-100 overflow-hidden"
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
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add Team Member</h2>
                <p className="text-primary-100 text-sm">Fill in details to add to the org chart</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

            {/* Member Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Member Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {typeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all text-sm font-bold
                      ${form.type === opt.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-slate-600'}`}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <span className="text-xs">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Priya Sharma"
                className={`input-field ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.name}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Role / Job Title <span className="text-red-500">*</span>
              </label>
              <input
                name="role"
                value={form.role}
                onChange={handleChange}
                placeholder="e.g. Automation Engineer"
                className={`input-field ${errors.role ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}`}
              />
              {errors.role && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.role}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description <span className="text-xs text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief bio, responsibilities, or any other details…"
                className="input-field resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Profile Photo
                <span className="text-xs text-slate-400 font-normal ml-1">(optional — leave blank for auto avatar)</span>
              </label>

              {/* Drop-zone style upload button */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl
                  p-5 cursor-pointer transition-all
                  ${ photoPreview
                    ? 'border-primary-300 bg-primary-50/40'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 bg-gray-50'
                  }`}
              >
                {photoPreview ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary-200"
                    />
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-700">{photoFile?.name}</p>
                      <p className="text-xs text-slate-400">
                        {photoFile ? (photoFile.size / 1024).toFixed(1) + ' KB' : ''}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500">Click to upload photo</p>
                    <p className="text-xs text-slate-400">JPG, PNG, WebP up to 5 MB</p>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {photoPreview && (
                <button
                  type="button"
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="mt-2 text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove photo
                </button>
              )}
            </div>


            {/* Footer buttons */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add Member
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Edit Member Modal (Admin Only) — reuses AddMemberModal styling
    	- edited/added by INAP 
═══════════════════════════════════════════════════════════════ */
function EditMemberModal({ member, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: member.name || '',
    role: member.role || '',
    type: member.type || 'member',
    description: member.description || '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(member.imageUrl || null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => () => {
    if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.role.trim()) e.role = 'Role / Job Title is required';
    return e;
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview && photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('role', form.role.trim());
      fd.append('type', form.type);
      fd.append('description', form.description.trim());
      if (photoFile) fd.append('photo', photoFile);

      const { data } = await TeamAPI.updateMember(member.id, fd);
      toast.success(`✅ ${data.name} updated!`);
      onSaved(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update member');
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: 'Director', label: 'Director', icon: '👑' },
    { value: 'Group Leader', label: 'Group Leader', icon: '🛡️' },
    { value: 'member', label: 'Core Team Member', icon: '👤' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        key="edit-member-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 24 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg border-2 border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-slate-700 to-slate-800 p-6 rounded-t-3xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white
                         bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Edit Member</h2>
                <p className="text-slate-300 text-sm">Update {member.name}'s details</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Member Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Member Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {typeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all text-sm font-bold
                      ${form.type === opt.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-slate-600'}`}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <span className="text-xs">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Priya Sharma"
                className={`input-field ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.name}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Role / Job Title <span className="text-red-500">*</span>
              </label>
              <input
                name="role"
                value={form.role}
                onChange={handleChange}
                placeholder="e.g. Automation Engineer"
                className={`input-field ${errors.role ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}`}
              />
              {errors.role && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.role}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description <span className="text-xs text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief bio, responsibilities, or any other details…"
                className="input-field resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Profile Photo
                <span className="text-xs text-slate-400 font-normal ml-1">(optional)</span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl
                  p-5 cursor-pointer transition-all
                  ${photoPreview
                    ? 'border-primary-300 bg-primary-50/40'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 bg-gray-50'
                  }`}
              >
                {photoPreview ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary-200"
                    />
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-700">
                        {photoFile ? photoFile.name : 'Current photo'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {photoFile ? (photoFile.size / 1024).toFixed(1) + ' KB' : 'Click to change'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500">Click to upload photo</p>
                    <p className="text-xs text-slate-400">JPG, PNG, WebP up to 5 MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="mt-2 text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove photo
                </button>
              )}
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Edit3 className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Org-chart connector lines (CSS-based, reliable)
═══════════════════════════════════════════════════════════════ */
function OrgConnector() {
  return (
    <div className="relative w-full" style={{ height: 48 }}>
      {/* Horizontal bar joining ED and GL */}
      <div
        className="absolute bg-gray-300 left-1/4 right-1/4 top-0 h-0.5"
      />
      {/* Connector stems from each leader down to the horizontal bar */}
      <div className="absolute bg-gray-300 left-1/4 top-0 w-0.5 h-6" />
      <div className="absolute bg-gray-300 right-1/4 top-0 w-0.5 h-6" />
      
      {/* Center stem down to the team members */}
      <div className="absolute bg-gray-300 left-1/2 top-0 w-0.5 h-12 -translate-x-1/2" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Leadership Card (Director / Team Leader)
═══════════════════════════════════════════════════════════════ */
function LeaderCard({ member, onClick }) {
  const isExecDirector = member.type === 'Executive Director';
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(member)}
      className={`group relative cursor-pointer rounded-3xl border-2 p-6 shadow-sm
                  hover:shadow-xl transition-all duration-300 bg-white overflow-hidden
                  ${(member.type === 'Director' || member.type === 'Executive Director')
                    ? 'border-amber-200 hover:border-amber-400'
                    : 'border-primary-200 hover:border-primary-400'}`}
    >
      {/* Accent glow */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
          ${(member.type === 'Director' || member.type === 'Executive Director')
            ? 'bg-gradient-to-br from-amber-50/60 to-transparent'
            : 'bg-gradient-to-br from-primary-50/60 to-transparent'}`}
      />

      {/* Corner icon */}
      <div className={`absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center
        ${(member.type === 'Director' || member.type === 'Executive Director') ? 'bg-amber-100' : 'bg-primary-100'}`}
      >
        {(member.type === 'Director' || member.type === 'Executive Director')
          ? <Crown className="w-4 h-4 text-amber-600" />
          : <UserCheck className="w-4 h-4 text-primary-600" />}
      </div>

      <div className="relative flex flex-col items-center text-center gap-3 pt-2">
        <Avatar name={member.name} imageUrl={member.imageUrl} type={member.type} size="lg" />
        <div>
          <h3 className="font-black text-slate-900 text-lg leading-tight">{member.name}</h3>
          <p className={`text-sm font-semibold mt-0.5
            ${(member.type === 'Director' || member.type === 'Executive Director') ? 'text-amber-700' : 'text-primary-700'}`}>
            {member.role}
          </p>
        </div>
        
        <p className="text-xs text-slate-400 font-medium mt-1">Click for details</p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Member Card (regular team members)
═══════════════════════════════════════════════════════════════ */
function MemberCard({ member, onClick, isAdmin, onDeleteRequest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white border-2 border-gray-100 hover:border-rose-200
                 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => onClick(member)}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Admin delete button */}
      {isAdmin && (
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteRequest(member); }}
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 bg-red-50 hover:bg-red-100
                     border border-red-200 rounded-lg flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-all"
          title="Remove member"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
        </button>
      )}

      <div className="relative flex flex-col items-center text-center gap-2.5">
        <Avatar name={member.name} imageUrl={member.imageUrl} type={member.type} size="md" />
        <div>
          <p className="font-black text-slate-900 text-sm leading-tight">{member.name}</p>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{member.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Unified Card — single card for ALL member types (replaces
   the separate LeaderCard + MemberCard in the grid)
    	- edited by INAP
═══════════════════════════════════════════════════════════════ */
function UnifiedCard({ member, onClick, isAdmin, isLeader, onDeleteRequest, index }) {
  const borderClasses = isLeader
    ? (member.type === 'Director' || member.type === 'Executive Director')
      ? 'border-amber-200 hover:border-amber-400'
      : 'border-primary-200 hover:border-primary-400'
    : 'border-gray-100 hover:border-rose-200';

  const glowClasses = isLeader
    ? (member.type === 'Director' || member.type === 'Executive Director')
      ? 'bg-gradient-to-br from-amber-50/60 to-transparent'
      : 'bg-gradient-to-br from-primary-50/60 to-transparent'
    : 'bg-gradient-to-br from-rose-50/40 to-transparent';

  return (
    <div
      className={`group relative bg-white border-2 ${borderClasses}
                  rounded-2xl p-4   
                  shadow-sm hover:shadow-xl
                  transition-all duration-300 cursor-pointer overflow-hidden
                  h-[220px] min-h-[220px] flex flex-col items-center justify-center`} // edited by INAP: consistent vertical alignment
              // edited by INAP: unified padding for all cards, fixed height + consistent layout

      onClick={() => onClick(member)}
    >
      {/* Hover glow */}
      <div className={`absolute inset-0 ${glowClasses} opacity-0 group-hover:opacity-100 transition-opacity`} />

      {/* Leadership subtle indicator */}
      {isLeader && (
        <div className={`absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center
          ${(member.type === 'Director' || member.type === 'Executive Director') ? 'bg-amber-100' : 'bg-primary-100'}`}>
          {(member.type === 'Director' || member.type === 'Executive Director')
            ? <Crown className="w-3.5 h-3.5 text-amber-600" />
            : <UserCheck className="w-3.5 h-3.5 text-primary-600" />}
        </div>
      )}


      {/* Admin delete button */}
      {isAdmin && (
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteRequest(member); }}
          className={`absolute ${isLeader ? 'top-3 left-11' : 'top-2.5 right-2.5'} z-10 w-7 h-7 bg-red-50 hover:bg-red-100
                     border border-red-200 rounded-lg flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-all`}
          title="Remove member"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
        </button>
      )}

      <div className="relative flex flex-col items-center justify-center text-center gap-2.5 flex-1 w-full"> {/* edited by INAP: content centered + fills card evenly */}
        <Avatar name={member.name} imageUrl={member.imageUrl} type={member.type} size="md" /> {/* edited by INAP: same avatar size for uniform cards */}
        <div>
            {/* Name */}
            <p className="font-black text-sm text-slate-900 leading-tight truncate w-full">
              {member.name}
            </p>

            {/* For CORE TEAM MEMBERS (swap) - edited by INAP*/}
            {!isLeader ? (
              <>
                {/* show "Core Team Member" text */}
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Core Team Member
                </p>

                {/* show ROLE in badge */}
                <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-bold border bg-rose-50 text-rose-700 border-rose-200">
                  {member.role}
                </span>
              </>
            ) : (
              <>
                {/* For Director + Group Leader (keep same) */}
                <p className={`font-semibold text-xs mt-1.5
                  ${(member.type === 'Director' || member.type === 'Executive Director')
                    ? 'text-amber-700'
                    : 'text-primary-700'
                  }`}>
                  {member.role}
                </p>
                
		            <div className="mt-2">
    	        	  <TypeBadge type={member.type} />
 		            </div>
              </>
            )}
          </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Empty State
═══════════════════════════════════════════════════════════════ */
function EmptyState({ isAdmin, onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 bg-gray-100 border-2 border-gray-200 rounded-3xl
                      flex items-center justify-center mb-5">
        <Users className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-2">No team members yet</h3>
      <p className="text-slate-500 font-medium max-w-xs">
        {isAdmin
          ? 'Start by adding an executive director, Group Leader, and your team members.'
          : 'The team structure has not been configured yet.'}
      </p>
      {isAdmin && (
        <button
          onClick={onAdd}
          className="mt-6 btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add First Member
        </button>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function TeamStructure() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingMember, setEditingMember] = useState(null);  /*edited by INAP : added editing function*/

  /* ── Fetch members ── */
  const fetchTeam = useCallback(async () => {
    try {
      const { data } = await TeamAPI.getTeam();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  /* ── Add a new member ── */
  const handleMemberAdded = (newMember) => {
    setMembers((prev) => [...prev, newMember]);
  };

  /* ── Edit flow ── edited by INAP */
  const handleEditRequest = (member) => {
    setSelectedMember(null);
    setEditingMember(member);
  };

  const handleMemberUpdated = (updated) => {
    setMembers((prev) => prev.map((m) => m.id === updated.id ? updated : m));
  };

  /* ── Delete flow ── */
  const handleDeleteRequest = (member) => {
    setSelectedMember(null);
    setMemberToDelete(member);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    setDeleting(true);
    try {
      await TeamAPI.deleteMember(memberToDelete.id);
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      toast.success(`${memberToDelete.name} removed from team`);
      setMemberToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete member');
    } finally {
      setDeleting(false);
    }
  };



  /* ── Helper: check if member is leadership ── */
  const isLeadership = (m) => m.type === 'Director' || m.type === 'Executive Director' || m.type === 'Group Leader' || m.type === 'team_leader';

  // ✅ SORT MEMBERS: Director → Group Leader → Members
  const sortedMembers = [...members].sort((a, b) => {
    const getPriority = (type) => {
      const t = type?.toLowerCase();

      if (t === 'director' || t === 'executive director' || t === 'executive_director') return 1;
      if (t === 'group leader' || t === 'group_leader' || t === 'team_leader') return 2;
      return 3;
    };

    return getPriority(a.type) - getPriority(b.type);
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-16">

      {/* edited by INAP : Header / Hero (Improved spacing) ────────────────────────── */}
      <div className="bg-white border-b-2 border-gray-100">
        
        {/* subtle background shapes (same style as dashboard) */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-200/20 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 py-6 sm:py-8">
          
          <div className="flex items-center justify-between gap-4">

            {/* LEFT SECTION */}
            <div className="flex items-center gap-3">
              <Link
                to="/ideas"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>

              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-primary-50 border border-primary-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Core Team
                  </h1>

                  {/* member count */}
                  {!loading && members.length > 0 && (
                    <span className="ml-2 bg-gray-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      {members.length} members
                    </span>
                  )}
                </div>

                {/* subtle subtitle */}
                {/* <p className="text-slate-500 text-sm font-medium mt-1">
                  Manage and view your core team structure
                </p> */}
              </div>
            </div>

            {/* RIGHT SECTION */}
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white
                          font-bold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm
                          shadow-md shadow-primary-500/20 active:scale-95 border-2 border-primary-400"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────── grid edited by INAP */}
      <div className="max-w-7xl mx-auto px-4 py-10">

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 w-full">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <EmptyState isAdmin={isAdmin} onAdd={() => setShowAddModal(true)} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* ── Unified Card Grid ── */}
            {isAdmin ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 items-stretch">
                {sortedMembers.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <UnifiedCard
                      member={m}
                      onClick={setSelectedMember}
                      isAdmin={true}
                      isLeader={isLeadership(m)}
                      onDeleteRequest={handleDeleteRequest}
                      index={i}
                    />
                  </motion.div>
                ))}
            
                {/* Admin: inline add button */}
                <motion.button
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: members.length * 0.03 }}
                  onClick={() => setShowAddModal(true)}
                  className="flex flex-col items-center justify-center gap-2 bg-white border-2
                             border-dashed border-gray-200 hover:border-primary-400 hover:bg-primary-50
                             rounded-2xl p-5 min-h-[180px] transition-all duration-200 cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-gray-100 group-hover:bg-primary-100 rounded-full
                                  flex items-center justify-center transition-colors">
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-primary-600 transition-colors">
                    Add Core Team Member
                  </span>
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 items-stretch"> {/* edited by INAP: ensures equal height alignment */}
                {sortedMembers.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <UnifiedCard
                      member={m}
                      onClick={setSelectedMember}
                      isAdmin={false}
                      isLeader={isLeadership(m)}
                      onDeleteRequest={handleDeleteRequest}
                      index={i}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}

      {/* Member detail modal */}
      {selectedMember && (
        <MemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          isAdmin={isAdmin}
          onDeleteRequest={handleDeleteRequest}
          onEditRequest={handleEditRequest}
        />
      )}

      {/* Delete confirmation */}
      {memberToDelete && (
        <DeleteConfirmModal
          member={memberToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setMemberToDelete(null)}
          loading={deleting}
        />
      )}

      {/* Add member modal */}
      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onSaved={handleMemberAdded}
        />
      )}

      {/* Edit member modal */}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSaved={handleMemberUpdated}
        />
      )}
    </div>
  );
}