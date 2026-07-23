import { useState, useRef } from "react";
import { X, User, Camera } from "lucide-react";
import SkillInput from "./SkillInput";
import InterestSelector from "./InterestSelector";
import useFocusTrap from "../hooks/useFocusTrap";

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    year: user?.year || 1,
    branch: user?.branch || "",
    careerGoal: user?.careerGoal || "",
    socialLinks: {
      github: user?.socialLinks?.github || "",
      linkedin: user?.socialLinks?.linkedin || "",
      portfolio: user?.socialLinks?.portfolio || "",
    },
  });
  const [skills, setSkills] = useState(user?.skills || []);
  const [interestedFields, setInterestedFields] = useState(user?.interestedFields || []);
  const [customInterests, setCustomInterests] = useState(user?.customInterests || []);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  useFocusTrap(modalRef, isOpen);

  const branches = [
    "Computer Science (CSE)",
    "Information Technology (IT)",
    "Electronics & Communication (ECE)",
    "Electrical Engineering (EE)",
    "Mechanical Engineering (ME)",
    "Civil Engineering (CE)",
    "Chemical Engineering",
    "Biotechnology",
    "Other",
  ];

  const careerGoals = [
    { value: "", label: "Select your goal" },
    { value: "Placement", label: "Campus Placement" },
    { value: "Higher Studies", label: "Higher Studies (MS/MTech)" },
    { value: "Startup", label: "Startup / Entrepreneurship" },
    { value: "Freelancing", label: "Freelancing" },
    { value: "Research", label: "Research" },
  ];

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "skills", label: "Skills" },
    { id: "interests", label: "Interests" },
  ];

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      let avatarUrl = user?.avatar;
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        const avatarRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile/avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const avatarData = await avatarRes.json();
        if (avatarRes.ok) avatarUrl = avatarData.avatar;
      }

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, skills, interestedFields, customInterests }),
      });
      const data = await res.json();
      if (res.ok) {
        onSave({ ...data.user, avatar: avatarUrl });
        onClose();
      } else {
        alert(data.message || "Error updating profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  const labelClass = "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-slate-50 dark:bg-slate-800/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* ── Basic Info Tab ── */}
            {activeTab === "basic" && (
              <>
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-full bg-blue-600 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-white cursor-pointer overflow-hidden"
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-7 h-7" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-slate-900"
                    >
                      <Camera className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Profile Photo</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5"
                    >
                      Change photo
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </div>

                {/* Name */}
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClass}
                    placeholder="Your full name"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className={labelClass}>Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                  <p className="text-xs text-slate-400 mt-1">{formData.bio.length}/500</p>
                </div>

                {/* Year & Branch */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Year</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className={inputClass}
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Branch</label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className={inputClass}
                    >
                      {branches.map((b, i) => (
                        <option key={i} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Career Goal */}
                <div>
                  <label className={labelClass}>Career Goal</label>
                  <select
                    value={formData.careerGoal}
                    onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                    className={inputClass}
                  >
                    {careerGoals.map((g, i) => (
                      <option key={i} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>

                {/* Social Links */}
                <div className="space-y-3 pt-1">
                  <p className={labelClass}>Social Links</p>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={formData.socialLinks.github}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, github: e.target.value } })}
                      placeholder="https://github.com/username"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
                      placeholder="https://linkedin.com/in/username"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Portfolio URL</label>
                    <input
                      type="url"
                      value={formData.socialLinks.portfolio}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, portfolio: e.target.value } })}
                      placeholder="https://yourportfolio.com"
                      className={inputClass}
                    />
                  </div>
                </div>
              </>
            )}

            {/* ── Skills Tab ── */}
            {activeTab === "skills" && <SkillInput skills={skills} setSkills={setSkills} />}

            {/* ── Interests Tab ── */}
            {activeTab === "interests" && (
              <InterestSelector
                selectedInterests={interestedFields}
                setSelectedInterests={setInterestedFields}
                customInterests={customInterests}
                setCustomInterests={setCustomInterests}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
