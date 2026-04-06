import { useState, useEffect, type FormEvent } from 'react';
import { useUserManagementStore } from '../stores/userManagementStore';
import { useToastStore } from '../stores/toastStore';
import type { UserRole } from '../lib/roles';

const roleLabels: Record<UserRole, string> = {
  admin: '👑 Admin',
  manager: '👔 Manager',
  cashier: '💰 Cashier',
  chef: '👨‍🍳 Chef',
  waiter: '🤵 Waiter',
  cleaner: '🧹 Cleaner',
};

const roleColors: Record<UserRole, string> = {
  admin: 'text-yellow-400 bg-yellow-500/20 border-yellow-500',
  manager: 'text-purple-400 bg-purple-500/20 border-purple-500',
  cashier: 'text-green-400 bg-green-500/20 border-green-500',
  chef: 'text-orange-400 bg-orange-500/20 border-orange-500',
  waiter: 'text-blue-400 bg-blue-500/20 border-blue-500',
  cleaner: 'text-gray-400 bg-gray-500/20 border-gray-500',
};

const roles: UserRole[] = ['admin', 'manager', 'cashier', 'chef', 'waiter', 'cleaner'];

const UsersPage = () => {
  const { profiles, loading, error, fetchProfiles, createAccount, updateProfile, deleteAccount, resetPassword, toggleActive } = useUserManagementStore();
  const addToast = useToastStore((s) => s.addToast);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<{ id: string; name: string; phone?: string; role: UserRole } | null>(null);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    email: '', password: '', name: '', role: 'cashier' as UserRole, phone: '',
  });

  const [editFormData, setEditFormData] = useState({ name: '', phone: '', role: '' as UserRole });

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const filteredProfiles = profiles.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.phone && p.phone.includes(searchQuery))
  );

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email';
    if (!formData.password || formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const ok = await createAccount(formData.email, formData.password, formData.name, formData.role, formData.phone || undefined);
    if (ok) {
      setShowAddModal(false);
      setFormData({ email: '', password: '', name: '', role: 'cashier', phone: '' });
      setFormErrors({});
      addToast(`Account created for ${formData.name}`, 'success');
    }
  };

  const openEditModal = (user: typeof profiles[0]) => {
    setEditingUser({ id: user.id, name: user.name, phone: user.phone, role: user.role });
    setEditFormData({ name: user.name, phone: user.phone || '', role: user.role });
  };

  const handleEditSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const ok = await updateProfile(editingUser.id, {
      name: editFormData.name,
      phone: editFormData.phone || undefined,
      role: editFormData.role,
    });
    if (ok) {
      setEditingUser(null);
      addToast('Profile updated', 'success');
    }
  };

  const handleRoleChange = async (id: string, newRole: UserRole) => {
    const ok = await updateProfile(id, { role: newRole });
    if (ok) addToast('Role changed', 'success');
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const ok = await toggleActive(id, currentStatus);
    if (ok) addToast(`Account ${currentStatus ? 'deactivated' : 'activated'}`, 'info');
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteAccount(id);
    if (ok) {
      setConfirmDelete(null);
      addToast('Account deleted', 'info');
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!resettingUserId) return;
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const newPassword = fd.get('newPassword') as string;
    const confirmPassword = fd.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    const user = profiles.find(p => p.id === resettingUserId);
    if (!user) return;

    const ok = await resetPassword(resettingUserId, newPassword);
    if (ok) {
      setResettingUserId(null);
      addToast('Password reset successfully', 'success');
    }
  };

  return (
    <div className="p-6 bg-[#1e2128] min-h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white">👤 User Accounts</h1>
          <p className="text-gray-400 mt-1">Create and manage staff login accounts</p>
        </div>
        <button
          onClick={() => { setFormErrors({}); setFormData({ email: '', password: '', name: '', role: 'cashier', phone: '' }); setShowAddModal(true); }}
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold"
        >
          + Create Account
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
          <p className="font-bold">⚠️ Error: {error}</p>
          <button onClick={() => fetchProfiles()} className="mt-2 text-sm underline">Retry</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-500/20 border border-green-500 rounded-xl p-4">
          <p className="text-green-400 text-sm font-semibold">Total Users</p>
          <p className="text-3xl font-bold text-green-400">{loading ? '...' : profiles.length}</p>
        </div>
        <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4">
          <p className="text-blue-400 text-sm font-semibold">Active</p>
          <p className="text-3xl font-bold text-blue-400">{profiles.filter(p => p.is_active).length}</p>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4">
          <p className="text-yellow-400 text-sm font-semibold">Admins</p>
          <p className="text-3xl font-bold text-yellow-400">{profiles.filter(p => p.role === 'admin').length}</p>
        </div>
        <div className="bg-purple-500/20 border border-purple-500 rounded-xl p-4">
          <p className="text-purple-400 text-sm font-semibold">Staff</p>
          <p className="text-3xl font-bold text-purple-400">{profiles.filter(p => !['admin', 'manager'].includes(p.role)).length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search by name, email, or phone..."
          className="w-full px-4 py-2 rounded-lg bg-[#272a30] border border-gray-600 text-white placeholder-gray-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading users...</div>
      ) : filteredProfiles.length === 0 ? (
        <div className="text-center text-gray-400 py-12">{searchQuery ? 'No users match your search' : 'No user accounts yet. Create the first one!'}</div>
      ) : (
        <div className="bg-[#272a30] rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-700 text-left text-gray-400">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map(profile => (
                <tr key={profile.id} className="border-b border-gray-800 hover:bg-[#2f333a] transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold shrink-0">{profile.name.charAt(0).toUpperCase()}</div>
                      <span className="text-white font-semibold">{profile.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{profile.email}</td>
                  <td className="p-4 text-gray-400">{profile.phone || '—'}</td>
                  <td className="p-4">
                    <select
                      value={profile.role}
                      onChange={(e) => handleRoleChange(profile.id, e.target.value as UserRole)}
                      className={`px-2 py-1 rounded text-xs font-bold border ${roleColors[profile.role]}`}
                    >
                      {roles.map(r => (<option key={r} value={r}>{roleLabels[r]}</option>))}
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(profile.id, profile.is_active)}
                      className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition ${profile.is_active ? 'bg-green-500/20 text-green-400 border border-green-500 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500' : 'bg-red-500/20 text-red-400 border border-red-500 hover:bg-green-500/20 hover:text-green-400 hover:border-green-500'}`}
                    >
                      {profile.is_active ? '✓ Active' : '✗ Inactive'}
                    </button>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</td>
                  <td className="p-4 space-x-1">
                    <button onClick={() => openEditModal(profile)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-semibold">✏️ Edit</button>
                    <button onClick={() => setResettingUserId(profile.id)} className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-xs font-semibold">🔑 Reset</button>
                    <button onClick={() => setConfirmDelete(profile.id)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold">🗑 Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-gray-600 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">➕ Create Account</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs">Full Name</label>
                <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="John Doe" />
                {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="text-gray-400 text-xs">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="admin@b2m.com" />
                {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
              </div>
              <div>
                <label className="text-gray-400 text-xs">Password (min 6 chars)</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="••••••" />
                {formErrors.password && <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>}
              </div>
              <div>
                <label className="text-gray-400 text-xs">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white">
                  {roles.map(r => (<option key={r} value={r}>{roleLabels[r]}</option>))}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs">Phone (optional)</label>
                <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="09-xxx-xxx-xxx" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-green-500 hover:bg-green-400 text-black py-3 rounded-lg font-bold">Create Account</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-gray-600 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">✏️ Edit Profile</h2>
            <form onSubmit={handleEditSave} className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs">Name</label>
                <input value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Phone</label>
                <input value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Optional" />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Role</label>
                <select value={editFormData.role} onChange={(e) => setEditFormData({...editFormData, role: e.target.value as UserRole})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white">
                  {roles.map(r => (<option key={r} value={r}>{roleLabels[r]}</option>))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-green-500 hover:bg-green-400 text-black py-3 rounded-lg font-bold">Save Changes</button>
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resettingUserId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-purple-600 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">🔑 Reset Password</h2>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs">New Password</label>
                <input name="newPassword" type="password" className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Min 6 characters" />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Confirm Password</label>
                <input name="confirmPassword" type="password" className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Re-enter password" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-purple-500 hover:bg-purple-400 text-white py-3 rounded-lg font-bold">Reset Password</button>
                <button type="button" onClick={() => setResettingUserId(null)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-red-600 p-6 w-80 text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-white font-bold text-lg mb-2">Delete Account?</p>
            <p className="text-gray-400 text-sm mb-4">This will permanently remove the user's login access and profile.</p>
            <div className="flex gap-2">
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-500">Delete</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-500">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
