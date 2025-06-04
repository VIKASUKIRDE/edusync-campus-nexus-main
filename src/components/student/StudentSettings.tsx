
import React from 'react';
import ProfileSettings from './settings/ProfileSettings';

const StudentSettings: React.FC = () => {
  return (
    <div className="space-y-6 animate-page-enter">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-500 via-gray-500 to-zinc-600 rounded-xl p-6 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-slate-100">
            Manage your profile, password, and preferences
          </p>
        </div>
      </div>

      <ProfileSettings />
    </div>
  );
};

export default StudentSettings;
