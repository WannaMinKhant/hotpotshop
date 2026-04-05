import { useState, useEffect, type FormEvent } from 'react';
import { useCustomerStore } from '../stores/customerStore';
import type { Customer, CustomerTier } from '../types';

const CustomersPage = () => {
  const { customers, loading, error, fetchCustomers, addCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const tierColors: Record<string, string> = {
    bronze: 'bg-orange-600',
    silver: 'bg-gray-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-purple-500',
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
      phone: formData.get('phone') as string,
      email: (formData.get('email') as string) || undefined,
      tier: formData.get('tier') as CustomerTier,
      total_orders: 0,
      total_spent: 0,
    };
    if (!validateForm(data)) return;
    await addCustomer(data);
    setShowAddModal(false);
    setFormErrors({});
    form.reset();
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCustomer?.id) return;
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: (formData.get('email') as string) || undefined,
      tier: formData.get('tier') as CustomerTier,
    };
    if (!validateForm(data)) return;
    await updateCustomer(editingCustomer.id, data);
    setShowEditModal(false);
    setEditingCustomer(null);
    setFormErrors({});
  };

  const handleDelete = async (id: number) => {
    await deleteCustomer(id);
    setConfirmDelete(null);
  };

  return (
    <div className="p-6 bg-[#1e2128] h-screen overflow-y-auto">
      {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400">{error}</div>}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">👥 Customers</h1>
          <p className="text-gray-400">Manage customer profiles and loyalty</p>
        </div>
        <button
          onClick={() => { setFormErrors({}); setShowAddModal(true); }}
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold"
        >
          + Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-500/20 border border-green-500 rounded-xl p-4">
          <p className="text-green-400 text-sm font-semibold">Total Customers</p>
          <p className="text-3xl font-bold text-green-400">{loading ? '...' : customers.length}</p>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4">
          <p className="text-yellow-400 text-sm font-semibold">Gold+</p>
          <p className="text-3xl font-bold text-yellow-400">{customers.filter(c => ['gold', 'platinum'].includes(c.tier)).length}</p>
        </div>
        <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4">
          <p className="text-blue-400 text-sm font-semibold">Total Revenue</p>
          <p className="text-3xl font-bold text-blue-400">${customers.reduce((s, c) => s + (c.total_spent || 0), 0).toFixed(2)}</p>
        </div>
        <div className="bg-purple-500/20 border border-purple-500 rounded-xl p-4">
          <p className="text-purple-400 text-sm font-semibold">Avg Spent</p>
          <p className="text-3xl font-bold text-purple-400">${customers.length ? (customers.reduce((s, c) => s + (c.total_spent || 0), 0) / customers.length).toFixed(2) : '0.00'}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, phone, email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[#272a30] border border-gray-600 text-white"
        />
      </div>

      {/* Loading / Grid */}
      {loading && customers.length === 0 ? (
        <div className="text-center text-gray-400 py-12">Loading customers...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center text-gray-400 py-12">No customers found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-[#272a30] rounded-xl border border-gray-700 p-5 hover:border-yellow-400 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-black text-lg ${tierColors[customer.tier as CustomerTier]}`}>
                  {getInitials(customer.name)}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">{customer.name}</h3>
                  <p className="text-gray-400 text-sm">{customer.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-[#1f2329] p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Orders</p>
                  <p className="text-white font-bold">{customer.total_orders}</p>
                </div>
                <div className="bg-[#1f2329] p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Total Spent</p>
                  <p className="text-green-400 font-bold">${customer.total_spent?.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-bold text-black ${tierColors[customer.tier as CustomerTier]}`}>
                  {customer.tier.charAt(0).toUpperCase() + customer.tier.slice(1)}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingCustomer(customer); setFormErrors({}); setShowEditModal(true); }} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                  <button onClick={() => setConfirmDelete(customer.id!)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
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
            <h2 className="text-xl font-bold text-white mb-4">➕ Add Customer</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <input name="name" className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Name *" />
                {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
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
                <select name="tier" defaultValue="bronze" className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white">
                  <option value="bronze">🥉 Bronze</option>
                  <option value="silver">🥈 Silver</option>
                  <option value="gold">🥇 Gold</option>
                  <option value="platinum">💎 Platinum</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-green-500 hover:bg-green-400 text-black py-3 rounded-lg font-bold">Add Customer</button>
                <button type="button" onClick={() => { setShowAddModal(false); setFormErrors({}); }} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-gray-600 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">✏️ Edit Customer</h2>
            <form onSubmit={handleEdit} className="space-y-3">
              <div>
                <input name="name" defaultValue={editingCustomer.name} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Name *" />
                {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <input name="phone" defaultValue={editingCustomer.phone} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Phone *" />
                {formErrors.phone && <p className="text-red-400 text-sm mt-1">{formErrors.phone}</p>}
              </div>
              <div>
                <input name="email" defaultValue={editingCustomer.email || ''} type="email" className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Email" />
                {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
              </div>
              <div>
                <select name="tier" defaultValue={editingCustomer.tier} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white">
                  <option value="bronze">🥉 Bronze</option>
                  <option value="silver">🥈 Silver</option>
                  <option value="gold">🥇 Gold</option>
                  <option value="platinum">💎 Platinum</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-green-500 hover:bg-green-400 text-black py-3 rounded-lg font-bold">Save</button>
                <button type="button" onClick={() => { setShowEditModal(false); setEditingCustomer(null); setFormErrors({}); }} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold">Cancel</button>
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
            <p className="text-white font-bold text-lg mb-2">Delete Customer?</p>
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

export default CustomersPage;
