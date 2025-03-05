import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, PlusCircle, UserCircle, X, FileText, Users, MessageSquare, Image } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCreatingPost } from '../store/slices/postsSlice';
import { TribeCreationForm } from './tribe/TribeCreationForm';
import CreatePostModal from './posts/CreatePostModal';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [showTribeModal, setShowTribeModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  const creationOptions = [
    {
      icon: <FileText className="w-6 h-6" />,
      label: 'Create Post',
      action: () => {
        setShowMenu(false);
        dispatch(setCreatingPost(true));
      }
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: 'Create Tribe',
      action: () => {
        setShowMenu(false);
        setShowTribeModal(true);
      }
    }
  ];
  
  const handleAddClick = () => {
    setShowMenu(!showMenu);
  };
  
  const handleTribeCreationSuccess = (tribeId: number) => {
    setShowTribeModal(false);
    navigate(`/tribes/${tribeId}`);
  };

  const handleHomeClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 shadow-md" style={{ backgroundColor: 'var(--chain-bg)' }}>
        <div className="flex items-center justify-around py-3">
          <button
            onClick={handleHomeClick}
            className={`flex flex-col items-center space-y-1 ${
              location.pathname === '/' ? 'text-theme-primary' : 'text-text-secondary'
            }`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>

          <button
            onClick={handleAddClick}
            className="flex flex-col items-center space-y-1 text-text-secondary hover:text-theme-primary"
          >
            <PlusCircle className="w-6 h-6" />
            <span className="text-xs">Create</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className={`flex flex-col items-center space-y-1 ${
              location.pathname === '/profile' ? 'text-theme-primary' : 'text-text-secondary'
            }`}
          >
            <UserCircle className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>

      {/* Main creation options modal */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={() => setShowMenu(false)}>
          <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'rgba(var(--chain-bg-rgb), 0.8)' }}></div>
          <div 
            className="relative w-full max-w-md rounded-t-2xl sm:rounded-xl overflow-hidden shadow-lg z-10"
            style={{ backgroundColor: 'var(--chain-bg)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Create</h2>
                <button onClick={() => setShowMenu(false)} className="text-text-secondary hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {creationOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={option.action}
                    className="p-4 flex flex-col items-center bg-black/20 rounded-xl hover:bg-black/30 transition-colors"
                  >
                    {option.icon}
                    <span className="font-medium mt-2">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal tribeId="1" /> {/* TODO: Get actual tribeId from context/route */}

      {/* Tribe creation modal */}
      {showTribeModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={() => setShowTribeModal(false)}>
          <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'rgba(var(--chain-bg-rgb), 0.8)' }}></div>
          <div 
            className="relative w-full max-w-2xl rounded-t-2xl sm:rounded-xl overflow-hidden shadow-lg z-10 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--chain-bg)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-5">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-white">Create Tribe</h2>
                <button onClick={() => setShowTribeModal(false)} className="text-text-secondary hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <TribeCreationForm 
                onSuccess={handleTribeCreationSuccess} 
                onCancel={() => setShowTribeModal(false)} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={() => setShowNotificationModal(false)}>
          <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'rgba(var(--chain-bg-rgb), 0.8)' }}></div>
          <div 
            className="relative w-full max-w-md rounded-t-2xl sm:rounded-xl overflow-hidden shadow-lg z-10 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--chain-bg)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Notifications</h2>
                <button onClick={() => setShowNotificationModal(false)} className="text-text-secondary">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Notification list would go here */}
              <div className="text-center text-text-secondary py-8 bg-black/20 rounded-xl">
                You have no notifications
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}