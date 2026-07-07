import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  GitBranch,
  Link2,
  Globe,
  Pencil,
  User,
  RefreshCw,
  X,
  Loader2,
  Target,
  Camera,
} from "lucide-react";
import EditProfileModal from "../components/EditProfileModal";
import RecommendationCard from "../components/RecommendationCard";
import { useAuth } from "../context/AuthContext";

const levelLabel = (level) => {
  const map = { Beginner: "Beginner", Intermediate: "Mid", Advanced: "Advanced" };
  return map[level] || level;
};

const levelColor = (level) => {
  if (level === "Advanced") return "bg-blue-600 text-white";
  if (level === "Intermediate") return "bg-slate-700 text-white dark:bg-slate-600";
  return "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200";
};

const Profile = () => {
  const { login } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef(null);

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Cover photo must be under 5MB"); return; }
    setCoverUploading(true);
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("cover", file);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile/cover`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev) => ({ ...prev, coverPhoto: data.coverPhoto }));
        localStorage.setItem("user", JSON.stringify({ ...user, coverPhoto: data.coverPhoto }));
      }
    } catch (err) {
      console.error("Cover upload error:", err);
    } finally {
      setCoverUploading(false);
    }
  };

  const [showRecommendations, setShowRecommendations] = useState(false);
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  const {
    data: recData,
    isFetching: recFetching,
    error: recError,
    refetch,
  } = useQuery({
    queryKey: ["recommendations", user?.id],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || "Failed to fetch recommendations");
      return json;
    },
    enabled: false,
    retry: false,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recommendations/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to refresh recommendations");
      return json;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["recommendations"], data);
      setShowRecommendations(true);
    },
  });

  useEffect(() => {
    if (recData) setShowRecommendations(true);
  }, [recData]);

  const recommendations = recData?.data;
  const recommendationProvider = recData?.provider;
  const recommendationCached = recData?.cached;
  const recommendationLoading = recFetching || refreshMutation.isPending;
  const recommendationError = recError?.message || refreshMutation.error?.message || null;

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    login(updatedUser, localStorage.getItem("token"));
  };


  const yearSuffix = (y) => {
    if (y === 1) return "st";
    if (y === 2) return "nd";
    if (y === 3) return "rd";
    return "th";
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Profile Header Card ─────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden">

        {/* Cover photo */}
        <div className="relative h-36 bg-slate-200 dark:bg-slate-800 overflow-hidden group">
          {user?.coverPhoto ? (
            <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800"
              style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
            />
          )}

          {/* Cover upload button — shows on hover */}
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={coverUploading}
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all"
          >
            <span className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm transition-opacity">
              {coverUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
              {coverUploading ? "Uploading..." : user?.coverPhoto ? "Change cover" : "Add cover photo"}
            </span>
          </button>
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
        </div>

        {/* Avatar + edit row — avatar overlaps cover */}
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-3 relative z-10">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white overflow-hidden flex-shrink-0 shadow-lg border-4 border-white dark:border-slate-900">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-9 h-9" />
              )}
            </div>
            {/* Edit profile button */}
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 dark:bg-transparent dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors text-xs font-medium"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit profile
            </button>
          </div>

          {/* Name / year+branch */}
          <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {user?.name || "—"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {user?.branch}
            {user?.year ? ` • ${user.year}${yearSuffix(user.year)} Year` : ""}
          </p>
          {user?.careerGoal && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Target className="w-3.5 h-3.5 flex-shrink-0" />
              {user.careerGoal}
            </div>
          )}

          {/* Bio */}
          {user?.bio && (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-3 mb-4">
              {user.bio}
            </p>
          )}

          {/* Social links */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <a
              href={`mailto:${user?.email}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-medium border border-slate-200 dark:border-slate-700"
            >
              <Mail className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              {user?.email}
            </a>
            {user?.socialLinks?.github && (
              <a
                href={user.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-medium border border-slate-200 dark:border-slate-700"
              >
                <GitBranch className="w-3.5 h-3.5 text-slate-900 dark:text-slate-100" />
                GitHub
              </a>
            )}
            {user?.socialLinks?.linkedin && (
              <a
                href={user.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-medium border border-slate-200 dark:border-slate-700"
              >
                <Link2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                LinkedIn
              </a>
            )}
            {user?.socialLinks?.portfolio && (
              <a
                href={user.socialLinks.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-medium border border-slate-200 dark:border-slate-700"
              >
                <Globe className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                Portfolio
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-column section ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Skills */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Skills</h2>
          {user?.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${levelColor(skill.level)}`}
                >
                  {skill.name}
                  <span className="opacity-70 text-[10px]">{levelLabel(skill.level)}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500">
              No skills added yet.{" "}
              <button onClick={() => setShowEditModal(true)} className="text-blue-600 dark:text-blue-400 font-medium">
                Add skills
              </button>
            </p>
          )}
        </div>

        {/* Interests */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Interests</h2>
          {(user?.interestedFields?.length > 0 || user?.customInterests?.length > 0) ? (
            <div className="flex flex-wrap gap-2">
              {user.interestedFields?.map((field, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                >
                  {field}
                </span>
              ))}
              {user.customInterests?.map((interest, idx) => (
                <span
                  key={`c-${idx}`}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500">
              No interests selected.{" "}
              <button onClick={() => setShowEditModal(true)} className="text-blue-600 dark:text-blue-400 font-medium">
                Add interests
              </button>
            </p>
          )}
        </div>
      </div>

      {/* ── Profile Incomplete Banner ────────────────────────── */}
      {!user?.profileCompleted && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Complete your profile</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              Add bio, skills, and interests to get personalized recommendations.
            </p>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex-shrink-0"
          >
            Complete
          </button>
        </div>
      )}

      {/* ── Recommendations ──────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Personalized Recommendations
          </h2>
          {showRecommendations && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => refreshMutation.mutate()}
                disabled={recommendationLoading}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 dark:bg-transparent dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${recommendationLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowRecommendations(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {!showRecommendations ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Get an AI-powered learning path tailored to your goals and skills.
            </p>
            {recommendationError && (
              <div className="mb-4 px-4 py-2.5 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300">
                {recommendationError}
              </div>
            )}
            <button
              onClick={() => refetch()}
              disabled={recommendationLoading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {recommendationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Get Recommendations"
              )}
            </button>
          </div>
        ) : (
          <RecommendationCard
            recommendations={recommendations}
            loading={recommendationLoading}
            provider={recommendationProvider}
            cached={recommendationCached}
          />
        )}
      </div>

      {/* Edit Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onSave={handleProfileUpdate}
      />
    </div>
  );
};

export default Profile;
