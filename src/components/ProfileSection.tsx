import React from "react";

interface ProfileSectionProps {
  onClose: () => void;
  onLogout?: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ onClose, onLogout }) => {
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300"
        style={{ backdropFilter: 'blur(2px)' }}
        onClick={onClose}
        aria-label="Close profile overlay"
      />
      {/* Profile Panel */}
      <aside className="fixed top-0 right-0 h-full w-80 bg-white bg-opacity-95 shadow-2xl z-50 p-6 flex flex-col transition-transform duration-300 animate-slide-in border-l border-gray-200" style={{backdropFilter:'blur(0.5px)'}}>
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-gray-400"
          style={{lineHeight: '1', width: '2.5rem', height: '2.5rem'}}
          onClick={onClose}
          aria-label="Close profile"
        >
          ×
        </button>
        <div className="flex flex-col items-center gap-4 flex-1 mt-8">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-4xl">
            <span role="img" aria-label="User">👤</span>
          </div>
          <h2 className="text-xl font-semibold">Your Profile</h2>
          <p className="text-gray-600">Welcome back!</p>
          {/* Add more profile details or actions here */}
        </div>
        {onLogout && (
          <button
            className="mt-6 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            onClick={onLogout}
          >
            Log out
          </button>
        )}
      </aside>
    </>
  );
};

export default ProfileSection;
