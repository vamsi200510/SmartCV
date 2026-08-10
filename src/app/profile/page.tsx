'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/design-system';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, Mail, Building2,
  Briefcase, Globe, ExternalLink,
  Save, Check, Loader2, LogOut, Shield,
  Trash2
} from 'lucide-react';

const DEPARTMENTS = ['IT / Software', 'ECE', 'EEE', 'Mechanical', 'Civil', 'MBA', 'Commerce'];
const EXP_LEVELS = [
  { value: 'Fresher', label: 'Fresher (0-1 yrs)' },
  { value: 'Junior', label: 'Junior (1-3 yrs)' },
  { value: 'Mid-Level', label: 'Mid-Level (3-5 yrs)' },
  { value: 'Senior', label: 'Senior (5-8 yrs)' },
  { value: 'Lead/Executive', label: 'Lead / Executive (8+ yrs)' },
];

const INPUT_CLASS = "w-full h-11 px-4 rounded-xl border border-[#ECEDF3] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-50 transition";
const LABEL_CLASS = "text-xs font-medium text-[#6B7280] mb-1.5 block";

export default function ProfilePage() {
  const { user, profile, logout, refreshProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Standard profile fields (synced with Supabase)
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('IT / Software');
  const [careerGoal, setCareerGoal] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Fresher');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Extended fields (stored in localStorage keyed by user ID)
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [skills, setSkills] = useState('');

  // UI state
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setDepartment(profile.department || 'IT / Software');
      setCareerGoal(profile.career_goal || '');
      setExperienceLevel(profile.experience_level || 'Fresher');
      setProfileImage(profile.profile_image || null);
    }
  }, [profile]);

  // Load extended fields from localStorage
  useEffect(() => {
    if (user?.id) {
      try {
        const stored = localStorage.getItem(`smartcv_profile_${user.id}`);
        if (stored) {
          const data = JSON.parse(stored);
          setCollege(data.college || '');
          setCourse(data.course || '');
          setPhone(data.phone || '');
          setLinkedinUrl(data.linkedin || '');
          setGithubUrl(data.github || '');
          setPortfolioUrl(data.portfolio || '');
          setSkills(data.skills || '');
        }
      } catch {}
    }
  }, [user?.id]);

  // Profile completion ring calculation
  const completion = useMemo(() => {
    const fields = [
      !!fullName?.trim(),
      !!department,
      !!careerGoal?.trim(),
      !!experienceLevel,
      !!college?.trim(),
      !!course?.trim(),
      !!phone?.trim(),
      !!linkedinUrl?.trim(),
      !!githubUrl?.trim(),
      !!skills?.trim(),
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [fullName, department, careerGoal, experienceLevel, college, course, phone, linkedinUrl, githubUrl, skills]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleUploadPhoto(file);
  };

  const handleUploadPhoto = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast("File size exceeds 2MB limit.", "error");
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast("Invalid file type. Only JPG, PNG, and WebP are allowed.", "error");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await res.json();
      setProfileImage(data.publicUrl);
      
      if (user?.id) {
        localStorage.setItem(`smartcv_profile_image_${user.id}`, data.publicUrl);
      }
      
      await refreshProfile();
      toast("Profile photo updated successfully!", "success");
    } catch (err: any) {
      console.error(err);
      toast(err.message || 'Failed to upload photo.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUploading(true);
    try {
      const res = await fetch('/api/auth/upload-avatar', {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove photo');
      
      setProfileImage(null);
      if (user?.id) {
        localStorage.removeItem(`smartcv_profile_image_${user.id}`);
      }
      
      await refreshProfile();
      toast("Profile photo removed.", "success");
    } catch (err: any) {
      console.error(err);
      toast(err.message || 'Failed to remove photo.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSaving(true);
    setSaveStatus('idle');

    try {
      // Save standard fields to Supabase
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          department,
          careerGoal,
          experienceLevel,
        }),
      });
      if (!response.ok) throw new Error('Failed to update profile');

      // Save extended fields to localStorage
      if (user?.id) {
        localStorage.setItem(`smartcv_profile_${user.id}`, JSON.stringify({
          college, course, phone,
          linkedin: linkedinUrl,
          github: githubUrl,
          portfolio: portfolioUrl,
          skills,
        }));
      }

      await refreshProfile();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (!user || !profile) return null;

  const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <div className="min-h-screen bg-[#F7F8FC]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Dot grid */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #C7C9D3 0.6px, transparent 0.6px)', backgroundSize: '24px 24px', opacity: 0.2 }} />

      {/* Nav */}
      <nav className="bg-white border-b border-[#ECEDF3] sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="h-8 w-8 rounded-lg bg-[#F7F8FC] border border-[#ECEDF3] hover:bg-[#EFF6FF] flex items-center justify-center text-[#6B7280] transition cursor-pointer">
              <ArrowLeft size={15} />
            </button>
            <span className="font-bold text-[15px] text-[#111827]">Profile</span>
          </div>
          {saveStatus === 'success' && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl">
              <Check size={12} /> Saved
            </span>
          )}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10 relative z-10 space-y-6">

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#ECEDF3] rounded-3xl p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-50 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar with completion ring */}
            <div className="relative shrink-0 group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
              />
              <svg width="96" height="96" viewBox="0 0 96 96" className="absolute -top-1 -left-1 pointer-events-none">
                <circle cx="48" cy="48" r="44" fill="none" stroke="#ECEDF3" strokeWidth="3" />
                <circle
                  cx="48" cy="48" r="44" fill="none"
                  stroke={completion >= 80 ? '#22C55E' : completion >= 50 ? '#2563EB' : '#F59E0B'}
                  strokeWidth="3"
                  strokeDasharray={`${completion * 2.76} ${276 - completion * 2.76}`}
                  strokeDashoffset="69"
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-blue-600/15 m-1 relative overflow-hidden group cursor-pointer"
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span>{initials}</span>
                )}
                
                {/* Upload Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                </div>
              </button>

              <div className="absolute -bottom-1 -right-1 bg-white border border-[#ECEDF3] rounded-full px-2 py-0.5 text-[10px] font-bold text-[#374151] shadow-sm">
                {completion}%
              </div>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-xl font-bold text-[#111827]">{fullName || 'Your Name'}</h1>
              <p className="text-sm text-[#6B7280] mt-0.5">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700">
                  <Briefcase size={10} /> {experienceLevel}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-50 border border-violet-200 text-[10px] font-bold text-violet-700">
                  <Building2 size={10} /> {department}
                </span>
                {profileImage && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-[10px] font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
                  >
                    <Trash2 size={10} /> Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">

          {/* Personal Details */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white border border-[#ECEDF3] rounded-2xl p-6"
          >
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#F0F1F8]">
              <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <User size={14} className="text-[#2563EB]" />
              </div>
              <h2 className="text-sm font-semibold text-[#111827]">Personal Details</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS}>Full Name *</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Vamsi Krishna" className={INPUT_CLASS} required />
              </div>
              <div>
                <label className={LABEL_CLASS}>College / University</label>
                <input type="text" value={college} onChange={e => setCollege(e.target.value)} placeholder="NRI Institute of Technology" className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Course / Degree</label>
                <input type="text" value={course} onChange={e => setCourse(e.target.value)} placeholder="B.Tech Computer Science" className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Phone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Department</label>
                <select value={department} onChange={e => setDepartment(e.target.value)} className={INPUT_CLASS}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Experience Level</label>
                <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className={INPUT_CLASS}>
                  {EXP_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Career Goal</label>
                <input type="text" value={careerGoal} onChange={e => setCareerGoal(e.target.value)} placeholder="Full Stack Developer" className={INPUT_CLASS} />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS}>Key Skills</label>
                <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, TypeScript, Node.js, Python" className={INPUT_CLASS} />
                <p className="text-[10px] text-[#9CA3AF] mt-1">Comma-separated list of your top skills</p>
              </div>
            </div>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-[#ECEDF3] rounded-2xl p-6"
          >
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#F0F1F8]">
              <div className="h-8 w-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                <Globe size={14} className="text-[#7C3AED]" />
              </div>
              <h2 className="text-sm font-semibold text-[#111827]">Social Links</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={LABEL_CLASS}><ExternalLink size={11} className="inline mr-1" />LinkedIn</label>
                <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}><ExternalLink size={11} className="inline mr-1" />GitHub</label>
                <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/yourusername" className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}><Globe size={11} className="inline mr-1" />Portfolio Website</label>
                <input type="url" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="https://yourportfolio.com" className={INPUT_CLASS} />
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <button
              type="submit"
              disabled={saving || !fullName.trim()}
              className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
            </button>
          </motion.div>
        </form>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-[#ECEDF3] rounded-2xl p-6"
        >
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#F0F1F8]">
            <div className="h-8 w-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
              <Shield size={14} className="text-red-500" />
            </div>
            <h2 className="text-sm font-semibold text-[#111827]">Account</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F7F8FC] transition">
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-[#9CA3AF]" />
                <div>
                  <p className="text-sm font-medium text-[#111827]">Email</p>
                  <p className="text-xs text-[#9CA3AF]">{user.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Verified</span>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition cursor-pointer text-left"
            >
              <LogOut size={14} />
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
