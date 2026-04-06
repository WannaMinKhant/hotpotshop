import { useState, useEffect, type FormEvent } from 'react';
import { useStaffStore } from '../stores/staffStore';
import type { Staff, RoleEnum } from '../types';

const StaffPage = () => {
  const { staff, loading, error, fetchStaff, addStaff, updateStaff, deleteStaff } = useStaffStore();
  const [filterRole, setFilterRole] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const roles: RoleEnum[] = ['manager', 'chef', 'waiter', 'cashier', 'cleaner'];
  const roleEmojis: Record<string, string> = {
    manager: '👔', chef: '👨‍🍳', waiter: '🤵', cashier: '💰', cleaner: '🧹',
  };
  const roleColors: Record<string, string> = {
    manager: 'bg-purple-500', chef: 'bg-orange-500', waiter: 'bg-blue-500', cashier: 'bg-green-500', cleaner: 'bg-gray-500',
  };

  const filteredStaff = filterRole ? staff.filter(s => s.role === filterRole) : staff;
  const onDuty = staff.filter(s => s.status === 'on-duty').length;
  const onBreak = staff.filter(s => s.status === 'break').length;
  const offDuty = staff.filter(s => s.status === 'off-duty').length;

  const statusColors: Record<string, string> = {
    'on-duty': 'bg-green-500 text-black', 'off-duty': 'bg-gray-500 text-white', break: 'bg-yellow-500 text-black',
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const validateForm = (data: { name: string; phone: string; email?: string }): boolean => {
    const errors: Record<string, string> = {};
    if (!data.name.trim()) errors.name = 'Name is required';
    if (!data.phone.trim()) errors.phone = 'Phone is required';
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email format';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      name: formData.get('name') as string,
      role: formData.get('role') as RoleEnum,
      phone: formData.get('phone') as string,
      email: (formData.get('email') as string) || undefined,
      status: formData.get('status') as Staff['status'],
    };
    if (!validateForm(data)) return;
    await addStaff(data);
    setShowAddModal(false);
    setFormErrors({});
    form.reset();
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingStaff?.id) return;
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      name: formData.get('name') as string,
      role: formData.get('role') as RoleEnum,
      phone: formData.get('phone') as string,
      email: (formData.get('email') as string) || undefined,
      status: formData.get('status') as Staff['status'],
    };
    if (!validateForm(data)) return;
    await updateStaff(editingStaff.id, data);
    setShowEditModal(false);
    setEditingStaff(null);
    setFormErrors({});
  };

  const handleDelete = async (id: number) => {
    await deleteStaff(id);
    setConfirmDelete(null);
  };

  return (
    <div className="p-6 bg-[#1e2128] min-h-full overflow-y-auto">
      {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400">{error}</div>}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white">🧑‍💼 Staff Management</h1>
        <button onClick={() => { setFormErrors({}); setShowAddModal(true); }} className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold">
          + Add Staff
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-500/20 border border-green-500 rounded-xl p-4">
          <p className="text-green-400 text-sm font-semibold">On Duty</p>
          <p className="text-3xl font-bold text-green-400">{onDuty}</p>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4">
          <p className="text-yellow-400 text-sm font-semibold">On Break</p>
          <p className="text-3xl font-bold text-yellow-400">{onBreak}</p>
        </div>
        <div className="bg-gray-500/20 border border-gray-500 rounded-xl p-4">
          <p className="text-gray-400 text-sm font-semibold">Off Duty</p>
          <p className="text-3xl font-bold text-gray-400">{offDuty}</p>
        </div>
        <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4">
          <p className="text-blue-400 text-sm font-semibold">Total Staff</p>
          <p className="text-3xl font-bold text-blue-400">{loading ? '...' : staff.length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="bg-[#272a30] border border-gray-600 rounded-lg px-4 py-2 text-white">
          <option value="">All Roles</option>
          {roles.map(r => (<option key={r} value={r}>{roleEmojis[r]} {r.charAt(0).toUpperCase() + r.slice(1)}</option>))}
        </select>
      </div>

      {/* Loading / Staff Grid */}
      {loading && staff.length === 0 ? (
        <div className="text-center text-gray-400 py-12">Loading staff...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStaff.map(person => (
            <div key={person.id} className="bg-[#272a30] rounded-xl border border-gray-700 p-5 hover:border-yellow-400 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl text-white ${roleColors[person.role]}`}>
                  {getInitials(person.name)}
                </div>
                <div>
                  <h3 className="text-white font-bold">{person.name}</h3>
                  <p className="text-gray-400 text-sm flex items-center gap-1">{roleEmojis[person.role]} {person.role.charAt(0).toUpperCase() + person.role.slice(1)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-300 text-sm">{person.phone}</p>
                {person.email && <p className="text-gray-400 text-sm">{person.email}</p>}
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[person.status]}`}>
                  {person.status.replace('-', ' ').toUpperCase()}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingStaff(person); setFormErrors({}); setShowEditModal(true); }} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                  <button onClick={() => setConfirmDelete(person.id!)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-gray-600 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">➕ Add Staff</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <input name="name" className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Name *" />
                {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <select name="role" defaultValue="waiter" className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white">
                  {roles.map(r => (<option key={r} value={r}>{roleEmojis[r]} {r.charAt(0).toUpperCase() + r.slice(1)}</option>))}
                </select>
              </div>
              <div>
                <input name="phone" className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Phone *" />
                {formErrors.phone && <p className="text-red-400 text-sm mt-1">{formErrors.phone}</p>}
              </div>
              <div>
                <input name="email" type="email" className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Email" />
                {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
              </div>
              <div>
                <select name="status" defaultValue="off-duty" className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white">
                  <option value="on-duty">On Duty</option>
                  <option value="off-duty">Off Duty</option>
                  <option value="break">On Break</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-green-500 hover:bg-green-400 text-black py-3 rounded-lg font-bold">Add Staff</button>
                <button type="button" onClick={() => { setShowAddModal(false); setFormErrors({}); }} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editingStaff && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-gray-600 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">✏️ Edit Staff</h2>
            <form onSubmit={handleEdit} className="space-y-3">
              <div>
                <input name="name" defaultValue={editingStaff.name} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Name *" />
                {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <select name="role" defaultValue={editingStaff.role} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white">
                  {roles.map(r => (<option key={r} value={r}>{roleEmojis[r]} {r.charAt(0).toUpperCase() + r.slice(1)}</option>))}
                </select>
              </div>
              <div>
                <input name="phone" defaultValue={editingStaff.phone} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Phone *" />
                {formErrors.phone && <p className="text-red-400 text-sm mt-1">{formErrors.phone}</p>}
              </div>
              <div>
                <input name="email" defaultValue={editingStaff.email || ''} type="email" className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Email" />
                {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
              </div>
              <div>
                <select name="status" defaultValue={editingStaff.status} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white">
                  <option value="on-duty">On Duty</option>
                  <option value="off-duty">Off Duty</option>
                  <option value="break">On Break</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-green-500 hover:bg-green-400 text-black py-3 rounded-lg font-bold">Save</button>
                <button type="button" onClick={() => { setShowEditModal(false); setEditingStaff(null); setFormErrors({}); }} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold">Cancel</button>
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
            <p className="text-white font-bold text-lg mb-2">Delete Staff?</p>
            <p className="text-gray-400 text-sm mb-4">This cannot be undone.</p>
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

export default StaffPage;
