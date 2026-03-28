'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Upload,
  MapPin,
  Briefcase,
  CheckCircle2,
  Circle,
  MessageSquare,
  FileText,
  Zap,
} from 'lucide-react';

export interface UserProfileCardProps {
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string | null;
    company_name?: string;
    job_title?: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    bio?: string;
    is_active?: boolean;
  };
  stats?: {
    projects: number;
    comments_resolved: number;
    documents: number;
  };
  recentActivity?: {
    id: string;
    description: string;
    timestamp: string;
    type: 'comment' | 'document' | 'ai_response' | 'permit';
  }[];
  onAvatarUpload?: (file: File) => void;
  onBioUpdate?: (bio: string) => void;
  onStatusToggle?: (isActive: boolean) => void;
  className?: string;
  isEditable?: boolean;
}

const roleConfig = {
  owner: { label: 'Owner', bgColor: 'bg-[#0f3c35]', textColor: 'text-white' },
  admin: { label: 'Admin', bgColor: 'bg-[#25a18e]', textColor: 'text-white' },
  member: { label: 'Member', bgColor: 'bg-[#dff2ef]', textColor: 'text-[#0f3c35]' },
  viewer: { label: 'Viewer', bgColor: 'bg-[#f0f2f4]', textColor: 'text-[#5a6676]' },
};

const activityIcons = {
  comment: MessageSquare,
  document: FileText,
  ai_response: Zap,
  permit: Briefcase,
};

export const UserProfileCard = ({
  user,
  stats = { projects: 0, comments_resolved: 0, documents: 0 },
  recentActivity = [],
  onAvatarUpload,
  onBioUpdate,
  onStatusToggle,
  className = '',
  isEditable = false,
}: UserProfileCardProps) => {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(user.bio || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleAvatarClick = () => {
    if (isEditable && onAvatarUpload) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarUpload) {
      onAvatarUpload(file);
    }
  };

  const handleBioSave = () => {
    if (onBioUpdate) {
      onBioUpdate(bioText);
    }
    setIsEditingBio(false);
  };

  const handleStatusToggle = () => {
    if (onStatusToggle) {
      onStatusToggle(!user.is_active);
    }
  };

  const role = roleConfig[user.role] || roleConfig.member;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`w-full ${className}`}
    >
      <div className="overflow-hidden rounded-3xl border border-[#e2e5e5]/50 bg-[#f6f5f0]/45 backdrop-blur-2xl shadow-lg">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 p-6 md:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left: Profile Section */}
            <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col items-center">
              {/* Avatar */}
              <div className="relative mb-6">
                <div
                  className={`relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#ffffff] shadow-lg transition-all ${
                    isEditable && onAvatarUpload
                      ? 'cursor-pointer hover:shadow-xl hover:border-[#25a18e]'
                      : ''
                  }`}
                  onClick={handleAvatarClick}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#25a18e]/20 via-transparent to-transparent" />

                  <Avatar className="w-full h-full border-0">
                    <AvatarImage src={user.avatar_url || ''} alt={user.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-[#0f3c35] to-[#25a18e] text-white text-2xl font-bold">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Upload overlay */}
                  {isEditable && onAvatarUpload && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-full backdrop-blur-sm">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>

                {/* Status indicator */}
                <button
                  onClick={handleStatusToggle}
                  className="absolute bottom-0 right-0 p-1 bg-white rounded-full border-4 border-[#f6f5f0] cursor-pointer transition-transform hover:scale-110"
                  title={user.is_active ? 'Set as Away' : 'Set as Active'}
                >
                  {user.is_active ? (
                    <CheckCircle2 className="w-6 h-6 text-[#25a18e]" />
                  ) : (
                    <Circle className="w-6 h-6 text-[#9ca3af]" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Name */}
              <motion.h2
                variants={itemVariants}
                className="text-2xl font-bold text-[#102034] text-center font-display"
              >
                {user.full_name}
              </motion.h2>

              {/* Role Badge */}
              <motion.div variants={itemVariants} className="mt-3">
                <Badge
                  className={`${role.bgColor} ${role.textColor} text-sm px-4 py-2 font-semibold`}
                >
                  {role.label}
                </Badge>
              </motion.div>

              {/* Company and Title */}
              {(user.company_name || user.job_title) && (
                <motion.div variants={itemVariants} className="mt-4 text-center">
                  {user.job_title && (
                    <p className="text-sm font-semibold text-[#102034]">
                      {user.job_title}
                    </p>
                  )}
                  {user.company_name && (
                    <p className="text-sm text-[#5a6676] flex items-center justify-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      {user.company_name}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Bio Section */}
              <motion.div variants={itemVariants} className="mt-6 w-full">
                {isEditingBio ? (
                  <div className="space-y-3">
                    <Textarea
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      placeholder="Add a professional bio..."
                      className="text-sm border-[#e2e5e5]/50 bg-white/50 backdrop-blur-sm rounded-lg focus-visible:ring-[#25a18e]"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleBioSave}
                        className="flex-1 bg-[#0f3c35] hover:bg-[#25a18e] text-white rounded-lg"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingBio(false)}
                        className="flex-1 border-[#e2e5e5] text-[#102034] rounded-lg hover:bg-[#f0f2f4]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-3 rounded-lg bg-white/30 ${
                      isEditable ? 'cursor-pointer hover:bg-white/50' : ''
                    } transition-all`}
                    onClick={() => isEditable && setIsEditingBio(true)}
                  >
                    {bioText ? (
                      <p className="text-sm text-[#5a6676] leading-relaxed">
                        {bioText}
                      </p>
                    ) : isEditable ? (
                      <p className="text-sm text-[#9ca3af] italic">
                        Add a professional bio...
                      </p>
                    ) : (
                      <p className="text-sm text-[#9ca3af] italic">
                        No bio yet
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>

            {/* Right: Stats & Activity Section */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl bg-gradient-to-br from-white/40 to-white/20 p-4 border border-[#e2e5e5]/30 backdrop-blur-sm hover:border-[#25a18e]/50 transition-all">
                  <div className="text-2xl font-bold text-[#0f3c35]">
                    {stats.projects}
                  </div>
                  <div className="text-xs text-[#5a6676] mt-1 font-semibold">
                    Projects
                  </div>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-white/40 to-white/20 p-4 border border-[#e2e5e5]/30 backdrop-blur-sm hover:border-[#25a18e]/50 transition-all">
                  <div className="text-2xl font-bold text-[#0f3c35]">
                    {stats.comments_resolved}
                  </div>
                  <div className="text-xs text-[#5a6676] mt-1 font-semibold">
                    Comments Resolved
                  </div>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-white/40 to-white/20 p-4 border border-[#e2e5e5]/30 backdrop-blur-sm hover:border-[#25a18e]/50 transition-all">
                  <div className="text-2xl font-bold text-[#0f3c35]">
                    {stats.documents}
                  </div>
                  <div className="text-xs text-[#5a6676] mt-1 font-semibold">
                    Documents
                  </div>
                </div>
              </div>

              {/* Activity Section */}
              {recentActivity.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#102034] mb-4 uppercase tracking-wide">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {recentActivity.slice(0, 3).map((activity) => {
                      const IconComponent =
                        activityIcons[activity.type] || Briefcase;
                      return (
                        <motion.div
                          key={activity.id}
                          onMouseEnter={() => setHoveredActivityId(activity.id)}
                          onMouseLeave={() => setHoveredActivityId(null)}
                          className={`p-4 rounded-lg border transition-all ${
                            hoveredActivityId === activity.id
                              ? 'bg-white/60 border-[#25a18e]/50 shadow-md'
                              : 'bg-white/30 border-[#e2e5e5]/30 hover:bg-white/40'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <IconComponent className="w-5 h-5 text-[#0f3c35]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#102034] leading-snug">
                                {activity.description}
                              </p>
                              <p className="text-xs text-[#9ca3af] mt-1">
                                {new Date(activity.timestamp).toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {recentActivity.length === 0 && (
                <div className="rounded-lg border border-[#e2e5e5]/30 bg-white/20 p-8 text-center">
                  <p className="text-sm text-[#5a6676]">
                    No recent activity yet
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfileCard;
