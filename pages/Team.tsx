
import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Mail, Shield, Trash2, MoreHorizontal } from 'lucide-react';
import { authService, AuthSession } from '../services/authService';
import { TeamMember } from '../types';

interface TeamProps {
  session: AuthSession;
}

export const Team: React.FC<TeamProps> = ({ session }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    authService.getTeamMembers(session.organization.id).then(setMembers);
  }, [session.organization.id]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setTimeout(() => {
      const newMember: TeamMember = {
        id: `inv_${Date.now()}`,
        email: inviteEmail,
        name: inviteEmail.split('@')[0],
        role: 'analyst',
        organizationId: session.organization.id,
        status: 'invited'
      };
      setMembers([...members, newMember]);
      setInviteEmail('');
      setIsInviting(false);
    }, 600);
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'owner': return <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-mono">OWNER</span>;
      case 'admin': return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">ADMIN</span>;
      default: return <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono">ANALYST</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
          <p className="text-slate-400">Manage access and roles for <span className="text-white font-medium">{session.organization.name}</span>.</p>
        </div>
        <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex text-sm">
          <div className="px-3 py-1 text-slate-300"> Seats: <span className="text-white font-bold">{members.length}</span> / 5</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Member List */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
           <div className="p-4 border-b border-slate-800 font-bold text-white flex items-center gap-2">
             <Users className="w-5 h-5 text-emerald-500" />
             Active Members
           </div>
           <div className="divide-y divide-slate-800">
             {members.map(member => (
               <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">
                     {member.name.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <div className="text-white font-medium flex items-center gap-2">
                       {member.name}
                       {member.status === 'invited' && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 rounded">PENDING</span>}
                     </div>
                     <div className="text-sm text-slate-500">{member.email}</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   {getRoleBadge(member.role)}
                   {session.user.role === 'owner' && member.role !== 'owner' && (
                      <button className="text-slate-600 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                   )}
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Invite Box */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-fit backdrop-blur-sm">
           <h3 className="font-bold text-white mb-4 flex items-center gap-2">
             <UserPlus className="w-5 h-5 text-emerald-500" />
             Invite Member
           </h3>
           <form onSubmit={handleInvite} className="space-y-4">
             <div className="space-y-2">
               <label className="text-sm text-slate-400">Email Address</label>
               <div className="relative">
                 <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                 <input 
                    type="email" 
                    required
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="colleague@corp.com"
                 />
               </div>
             </div>
             <div className="space-y-2">
               <label className="text-sm text-slate-400">Role</label>
               <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white">
                 <option value="analyst">Analyst (Read/Playground)</option>
                 <option value="admin">Admin (Manage Resources)</option>
               </select>
             </div>
             <button 
               type="submit" 
               disabled={isInviting}
               className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50"
             >
               {isInviting ? 'Sending...' : 'Send Invitation'}
             </button>
           </form>
           
           <div className="mt-6 pt-6 border-t border-slate-800 text-xs text-slate-500">
             <p>Admins can manage providers and policies.</p>
             <p className="mt-1">Analysts can only access the playground and logs.</p>
           </div>
        </div>
      </div>
    </div>
  );
};
