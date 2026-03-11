import { motion } from 'framer-motion';
import useChatStore from '../../store/chatStore';
import useThemeStore from '../../store/themeStore';
import Avatar from '../ui/Avatar';
import { formatDistanceToNow } from 'date-fns';

const UserPanel = ({ onClose }) => {
  const { currentPrivateUser, currentRoom, onlineUsers } = useChatStore();
  const { isDark } = useThemeStore();

  const entity = currentRoom || currentPrivateUser;
  const isRoom = !!currentRoom;

  if (!entity) return null;

  const th = {
    bg: isDark ? 'rgba(10,16,32,0.98)' : 'rgba(248,250,252,0.98)',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(14,165,233,0.12)',
    text: isDark ? '#f1f5f9' : '#0f172a',
    muted: isDark ? '#94a3b8' : '#64748b',
    card: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
  };

  const isOnline = !isRoom && onlineUsers.has(entity._id);

  const lastSeenText = entity.lastSeen
    ? `${formatDistanceToNow(new Date(entity.lastSeen))} ago`
    : 'Unknown';

  return (
    <div className="h-full flex flex-col backdrop-blur-xl"
      style={{ background: th.bg, borderLeft: `1px solid ${th.border}` }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${th.border}` }}>
        <h3 className="font-bold text-sm" style={{ color: th.text }}>
          {isRoom ? '🏠 Room Info' : '👤 User Info'}
        </h3>
        <button onClick={onClose}
          className="btn-ghost w-7 h-7 rounded-lg text-sm" title="Close">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile section */}
        <div className="p-5 flex flex-col items-center text-center">
          {isRoom ? (
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-3"
              style={{ background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)' }}>
              {entity.type === 'private' ? '🔒' : '#'}
            </div>
          ) : (
            <div className="relative mb-3">
              <Avatar user={entity} size="xl" />
              <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[8px] ${
                isDark ? 'border-slate-900' : 'border-slate-100'
              } ${isOnline ? 'bg-green-400' : 'bg-slate-500'}`} />
            </div>
          )}

          <h2 className="text-lg font-bold mb-1" style={{ color: th.text }}>
            {isRoom ? entity.name : entity.username}
          </h2>

          {!isRoom && (
            <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${
              isOnline ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
            }`}>
              {isOnline ? '● Online now' : `● Last seen ${lastSeenText}`}
            </div>
          )}

          <p className="text-xs leading-relaxed" style={{ color: th.muted }}>
            {isRoom ? (entity.description || 'No description') : (entity.bio || 'No bio set')}
          </p>
        </div>

        {/* Info cards */}
        <div className="px-4 space-y-2 mb-4">
          {isRoom ? (
            <>
              <InfoCard icon="👥" label="Members" value={`${entity.members?.length || 0} people`} th={th} />
              <InfoCard icon="🔑" label="Type" value={entity.type === 'private' ? 'Private Room' : 'Public Room'} th={th} />
              {entity.inviteCode && (
                <InfoCard icon="📋" label="Invite Code" value={entity.inviteCode} th={th} mono />
              )}
              <InfoCard icon="📅" label="Created"
                value={entity.createdAt ? new Date(entity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                th={th} />
            </>
          ) : (
            <>
              <InfoCard icon="📧" label="Email" value={entity.email || '—'} th={th} />
              <InfoCard icon="🛡️" label="Role" value={entity.role || 'user'} th={th} />
              <InfoCard icon="📅" label="Joined"
                value={entity.createdAt ? new Date(entity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                th={th} />
            </>
          )}
        </div>

        {/* Members list for rooms */}
        {isRoom && entity.members?.length > 0 && (
          <div className="px-4 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: th.muted }}>
              Members ({entity.members.length})
            </p>
            <div className="space-y-1.5">
              {entity.members.map((member, i) => {
                const m = member.user || member;
                if (!m || typeof m === 'string') return null;
                const online = onlineUsers.has(m._id);
                return (
                  <motion.div key={m._id || i} whileHover={{ x: 3 }}
                    className="flex items-center gap-2.5 p-2 rounded-xl transition-all"
                    style={{ background: th.card }}>
                    <div className="relative flex-shrink-0">
                      <Avatar user={m} size="sm" />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border ${
                        isDark ? 'border-slate-900' : 'border-white'
                      } ${online ? 'bg-green-400' : 'bg-slate-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: th.text }}>{m.username || 'Unknown'}</p>
                      {member.role === 'admin' && (
                        <p className="text-[10px] text-purple-400 font-medium">Admin</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value, th, mono }) => (
  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: th.card }}>
    <span className="text-base flex-shrink-0">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: th.muted }}>{label}</p>
      <p className={`text-xs font-medium truncate ${mono ? 'font-mono' : ''}`} style={{ color: th.text }}>{value}</p>
    </div>
  </div>
);

export default UserPanel;