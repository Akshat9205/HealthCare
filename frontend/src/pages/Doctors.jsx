import React, { useState, useEffect } from 'react';
import { doctorApi } from '../api/doctorApi';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import {
  Stethoscope,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  GraduationCap,
  RefreshCw,
  Loader2,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Doctors = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [specFilter, setSpecFilter] = useState('All');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    email: '',
    phone: '',
    qualification: '',
  });

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await doctorApi.getAll();
      setDoctors(res?.data?.doctors || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch doctor directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      specialization: '',
      email: '',
      phone: '',
      qualification: '',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (doctor) => {
    // Check client-side permission indication
    if (doctor.created_by && user?.id && doctor.created_by !== user.id) {
      toast.error('Only the doctor creator is authorized to update this profile.');
    }
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.name || '',
      specialization: doctor.specialization || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      qualification: doctor.qualification || '',
    });
    setIsEditOpen(true);
  };

  const handleOpenView = (doctor) => {
    setSelectedDoctor(doctor);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (doctor) => {
    setSelectedDoctor(doctor);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.specialization.trim() || !formData.email.trim()) {
      toast.error('Name, specialization, and email are required.');
      return;
    }

    setFormSubmitting(true);
    try {
      await doctorApi.create({
        name: formData.name.trim(),
        specialization: formData.specialization.trim(),
        email: formData.email.trim(),
        phone: formData.phone ? formData.phone.trim() : null,
        qualification: formData.qualification ? formData.qualification.trim() : null,
      });
      toast.success('Doctor registered successfully in directory!');
      setIsAddOpen(false);
      resetForm();
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create doctor.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    setFormSubmitting(true);
    try {
      await doctorApi.update(selectedDoctor.id, {
        name: formData.name.trim(),
        specialization: formData.specialization.trim(),
        email: formData.email.trim(),
        phone: formData.phone ? formData.phone.trim() : null,
        qualification: formData.qualification ? formData.qualification.trim() : null,
      });
      toast.success('Doctor record updated successfully!');
      setIsEditOpen(false);
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update doctor record.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDoctor) return;
    setFormSubmitting(true);
    try {
      await doctorApi.delete(selectedDoctor.id);
      toast.success('Doctor removed from directory.');
      setIsDeleteOpen(false);
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete doctor.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Extract unique specializations for filter dropdown
  const specializations = Array.from(new Set(doctors.map((d) => d.specialization).filter(Boolean)));

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpec = specFilter === 'All' || doc.specialization === specFilter;

    return matchesSearch && matchesSpec;
  });

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-soft">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search doctors by name or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              className="py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
            >
              <option value="All">All Specialties</option>
              {specializations.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDoctors}
            disabled={loading}
            title="Reload doctors"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all focus:ring-4 focus:ring-brand-100"
          >
            <Plus className="w-4 h-4" />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      {/* Shared Doctor Directory Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : filteredDoctors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Doctor Name & Title</th>
                  <th className="py-3.5 px-6">Specialization</th>
                  <th className="py-3.5 px-6">Contact Info</th>
                  <th className="py-3.5 px-6">Creator Policy</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map((doc) => {
                  const isCreator = user?.id && doc.created_by === user.id;
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-bold text-sm flex items-center justify-center flex-shrink-0 border border-teal-100">
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{doc.name}</p>
                            <p className="text-xs text-slate-400">
                              {doc.qualification || 'Certified Practitioner'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                          {doc.specialization}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{doc.email}</span>
                        </div>
                        {doc.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{doc.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {isCreator ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
                            Registered by you
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-500">
                            <Lock className="w-3 h-3" />
                            Shared Directory
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenView(doc)}
                            title="View Doctor Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(doc)}
                            title={isCreator ? 'Edit Doctor' : 'Only creator can modify'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCreator
                                ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-300 hover:text-slate-400'
                            }`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(doc)}
                            title={isCreator ? 'Delete Doctor' : 'Only creator can delete'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCreator
                                ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-300 hover:text-slate-400'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Stethoscope}
            title={searchQuery || specFilter !== 'All' ? 'No matching doctors' : 'No doctors in directory'}
            description={
              searchQuery || specFilter !== 'All'
                ? 'Try clearing filters or search terms.'
                : 'Add the first specialist doctor to the directory.'
            }
            actionLabel={searchQuery || specFilter !== 'All' ? undefined : 'Add Doctor'}
            onAction={searchQuery || specFilter !== 'All' ? undefined : handleOpenAdd}
          />
        )}
      </div>

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={isAddOpen || isEditOpen}
        onClose={() => {
          setIsAddOpen(false);
          setIsEditOpen(false);
          setSelectedDoctor(null);
        }}
        title={isAddOpen ? 'Add Doctor to Directory' : 'Edit Doctor Details'}
        subtitle={isAddOpen ? 'Fill in medical credentials' : `Modifying profile for ${selectedDoctor?.name}`}
      >
        <form onSubmit={isAddOpen ? handleCreateSubmit : handleUpdateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Doctor Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Dr. Gregory House"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Medical Specialization *
              </label>
              <input
                type="text"
                required
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g. Cardiology, Diagnostics"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Qualification
              </label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="MD, DM, MBBS"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Official Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="doctor@hospital.org"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Direct Contact Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555-0144"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setIsEditOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all focus:ring-4 focus:ring-brand-100 disabled:opacity-50"
            >
              {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isAddOpen ? 'Save Doctor' : 'Update Doctor'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* View Doctor Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Doctor Profile"
        subtitle={`Directory ID #${selectedDoctor?.id}`}
      >
        {selectedDoctor && (
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-bold text-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">{selectedDoctor.name}</h4>
                <p className="text-xs text-teal-700 font-semibold">{selectedDoctor.specialization}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">Qualification</span>
                <p className="font-semibold text-slate-800">
                  {selectedDoctor.qualification || 'Certified Specialist'}
                </p>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">Phone Number</span>
                <p className="font-semibold text-slate-800">{selectedDoctor.phone || 'None provided'}</p>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-100 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Email Address</span>
              <p className="font-semibold text-slate-800">{selectedDoctor.email}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Doctor From Directory?"
        message={`Are you sure you want to remove "${selectedDoctor?.name}"? Any active patient assignments for this doctor will be impacted.`}
        confirmText="Confirm Delete"
        loading={formSubmitting}
      />
    </div>
  );
};

export default Doctors;
