import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import Avatar from '../ui/Avatar';
import CreateRoomModal from '../chat/CreateRoomModal';
import SearchModal from '../chat/SearchModal';

const Sidebar = ({ onClose, socketUtils }) => {
  const [tab, setTab] = useState('rooms');
  const [showCreate, setShowCreate] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();

  const {
    rooms, users, fetchRooms, fetchUsers,
    setCurrentRoom, setCurrentPrivateUser,
    currentRoom, currentPrivateUser,
    onlineUsers, unreadCounts,
    notifications, unreadNotificationCount,
    markNotificationsRead, clearUnread, fetchNotifications,
  } = useChatStore();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  useEffect(() => {
    fetchRooms();
    fetchUsers();
    fetchNotifications();
  }, []);

  const handleRoomSelect = useCallback((room) => {
    setCurrentRoom(room);
    socketUtils?.joinRoom(room._id);
    clearUnread(room._id);
    onClose?.();
  }, [setCurrentRoom, socketUtils, clearUnread, onClose]);

  const handleUserSelect = useCallback((selectedUser) => {
    setCurrentPrivateUser(selectedUser);
    clearUnread(selectedUser._id);
    onClose?.();
  }, [setCurrentPrivateUser, clearUnread, onClose]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Filter
  const filteredRooms = rooms.filter(r => r.name?.toLowerCase().includes(query.toLowerCase()));
  const filteredUsers = users.filter(u =>
    u._id !== user._id && (
      u.username?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase())
    )
  );

  const th = isDark
    ? { bg: 'rgba(10,15,28,0.98)', border: 'rgba(255,255,255,0.06)', text: 'text-white', muted: 'text-slate-400', hover: 'hover:bg-white/5', active: 'bg-sky-500/15 border border-sky-500/25' }
    : { bg: 'rgba(248,250,252,0.98)', border: 'rgba(14,165,233,0.12)', text: 'text-slate-900', muted: 'text-slate-500', hover: 'hover:bg-slate-100', active: 'bg-sky-50 border border-sky-200' };

  return (
    <>
      <div className="h-full flex flex-col" style={{ background: th.bg, borderRight: `1px solid ${th.border}` }}>

        {/* ── Header ── */}
        <div className="p-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: `1px solid ${th.border}` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm"
              style={{ background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)' }}>N</div>
            <span className={`font-bold text-base ${th.text}`}>NexusChat</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="btn-ghost p-1.5 rounded-lg text-base" title="Toggle theme">
              {isDark ? '☀️' : '🌙'}
            </button>
            <button onClick={() => setShowSearch(true)} className="btn-ghost p-1.5 rounded-lg text-base" title="Search">🔍</button>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="px-3 pt-3 pb-1">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search rooms & people…"
            className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
            style={{
              background: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(226,232,240,0.7)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              color: isDark ? '#e2e8f0' : '#1e293b',
            }}
          />
        </div>

        {/* ── Tabs ── */}
        <div className="flex px-3 gap-1 py-2">
          {['rooms','people'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                tab === t
                  ? 'text-sky-400 bg-sky-500/15 border border-sky-500/25'
                  : `${th.muted} ${th.hover}`
              }`}>
              {t === 'rooms' ? `🏠 Rooms` : `👥 People`}
              {t === 'rooms' && rooms.length > 0 && <span className="ml-1 opacity-50">({rooms.length})</span>}
              {t === 'people' && users.filter(u => u._id !== user._id).length > 0 && (
                <span className="ml-1 opacity-50">({users.filter(u => u._id !== user._id).length})</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {tab === 'rooms' ? (
            <>
              <button
                onClick={() => setShowCreate(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all mb-1"
                style={{ background: 'rgba(14,165,233,0.08)', border: '1px dashed rgba(14,165,233,0.3)', color: '#38bdf8' }}>
                <span className="text-base">＋</span>
                <span className="text-xs font-semibold">Create New Room</span>
              </button>

              {filteredRooms.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  {query ? 'No rooms match your search' : 'No rooms yet — create one!'}
                </div>
              ) : filteredRooms.map(room => {
                const isActive = currentRoom?._id === room._id;
                const unread = unreadCounts[room._id] || 0;
                return (
                  <motion.button key={room._id} onClick={() => handleRoomSelect(room)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${isActive ? th.active : th.hover}`}
                    whileHover={{ x: 2 }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: room.type === 'private' ? 'linear-gradient(135deg,#ef4444,#f97316)' : 'linear-gradient(135deg,#0ea5e9,#8b5cf6)' }}>
                      {room.type === 'private' ? '🔒' : '#'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold truncate ${isActive ? 'text-sky-400' : th.text}`}>{room.name}</span>
                        {unread > 0 && (
                          <span className="ml-1 min-w-[20px] h-5 rounded-full text-[10px] font-bold flex items-center justify-center px-1.5 flex-shrink-0"
                            style={{ background: '#ef4444', color: 'white' }}>{unread > 99 ? '99+' : unread}</span>
                        )}
                      </div>
                      <span className={`text-xs truncate ${th.muted}`}>{room.members?.length || 0} members</span>
                    </div>
                  </motion.button>
                );
              })}
            </>
          ) : (
            <>
              {/* Online first */}
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No users found</div>
              ) : (
                <>
                  {/* Online users */}
                  {filteredUsers.filter(u => onlineUsers.has(u._id)).length > 0 && (
                    <div className="px-1 pb-1 pt-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1">
                        🟢 Online — {filteredUsers.filter(u => onlineUsers.has(u._id)).length}
                      </p>
                      {filteredUsers.filter(u => onlineUsers.has(u._id)).map(u => (
                        <UserItem key={u._id} u={u} isActive={currentPrivateUser?._id === u._id}
                          isOnline={true} unread={unreadCounts[u._id] || 0}
                          onSelect={() => handleUserSelect(u)} th={th} isDark={isDark} />
                      ))}
                    </div>
                  )}
                  {/* Offline users */}
                  {filteredUsers.filter(u => !onlineUsers.has(u._id)).length > 0 && (
                    <div className="px-1 pb-1 pt-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1">
                        ⚫ Offline
                      </p>
                      {filteredUsers.filter(u => !onlineUsers.has(u._id)).map(u => (
                        <UserItem key={u._id} u={u} isActive={currentPrivateUser?._id === u._id}
                          isOnline={false} unread={unreadCounts[u._id] || 0}
                          onSelect={() => handleUserSelect(u)} th={th} isDark={isDark} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* ── User footer ── */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: `1px solid ${th.border}` }}>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Avatar user={user} size="sm" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 bg-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${th.text}`}>{user?.username}</p>
              <p className="text-xs text-green-400">● Online</p>
            </div>
            <div className="flex items-center gap-0.5">
              {/* Notification bell */}
              <div className="relative">
                <button onClick={() => { setShowNotifs(s => !s); markNotificationsRead(); }}
                  className="btn-ghost p-1.5 rounded-lg text-base relative" title="Notifications">
                  🔔
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                      style={{ background: '#ef4444', color: 'white' }}>
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {showNotifs && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute bottom-full right-0 mb-2 w-72 rounded-2xl shadow-2xl overflow-hidden z-50"
                      style={{ background: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                      <div className="p-3 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
                        <p className={`text-sm font-bold ${th.text}`}>Notifications</p>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-center text-slate-500 text-xs py-6">No notifications</p>
                        ) : notifications.slice(0, 20).map(n => (
                          <div key={n._id} className={`px-3 py-2.5 border-b transition-colors ${n.isRead ? '' : (isDark ? 'bg-sky-500/5' : 'bg-sky-50')}`}
                            style={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                            <p className={`text-xs font-semibold ${th.text}`}>{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{n.body}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button onClick={() => navigate('/profile')} className="btn-ghost p-1.5 rounded-lg text-base" title="Profile">⚙️</button>
              {user?.role === 'admin' && (
                <button onClick={() => navigate('/admin')} className="btn-ghost p-1.5 rounded-lg text-base" title="Admin">🛡️</button>
              )}
              <button onClick={handleLogout} className="btn-ghost p-1.5 rounded-lg text-base" title="Logout">🚪</button>
            </div>
          </div>
        </div>
      </div>

      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={(room) => { fetchRooms(); setCurrentRoom(room); setShowCreate(false); }}
          socketUtils={socketUtils}
        />
      )}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </>
  );
};

// User list item component
const UserItem = ({ u, isActive, isOnline, unread, onSelect, th, isDark }) => (
  <motion.button
    onClick={onSelect}
    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${isActive ? th.active : th.hover}`}
    whileHover={{ x: 2 }}>
    <div className="relative flex-shrink-0">
      <Avatar user={u} size="sm" />
      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${isDark ? 'border-slate-900' : 'border-slate-100'} ${isOnline ? 'bg-green-400' : 'bg-slate-500'}`} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold truncate ${isActive ? 'text-sky-400' : th.text}`}>{u.username}</span>
        {unread > 0 && (
          <span className="ml-1 min-w-[20px] h-5 rounded-full text-[10px] font-bold flex items-center justify-center px-1.5 flex-shrink-0"
            style={{ background: '#ef4444', color: 'white' }}>{unread}</span>
        )}
      </div>
      <span className={`text-xs ${isOnline ? 'text-green-400' : th.muted}`}>
        {isOnline ? '● Online' : '○ Offline'}
      </span>
    </div>
  </motion.button>
);

export default Sidebar;