import React, { useState, useEffect } from 'react';
import { patientApi } from '../api/patientApi';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const GENDERS = ['Male', 'Female', 'Other', 'Non-binary', 'Prefer not to say'];

export const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    gender: 'Male',
    email: '',
    phone: '',
    address: '',
  });

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await patientApi.getAll();
      setPatients(res?.data?.patients || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch patients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      date_of_birth: '',
      gender: 'Male',
      email: '',
      phone: '',
      address: '',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name || '',
      date_of_birth: patient.date_of_birth ? patient.date_of_birth.split('T')[0] : '',
      gender: patient.gender || 'Male',
      email: patient.email || '',
      phone: patient.phone || '',
      address: patient.address || '',
    });
    setIsEditOpen(true);
  };

  const handleOpenView = (patient) => {
    setSelectedPatient(patient);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (patient) => {
    setSelectedPatient(patient);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.date_of_birth) {
      toast.error('Patient name and date of birth are required.');
      return;
    }

    if (new Date(formData.date_of_birth) > new Date()) {
      toast.error('Date of birth cannot be in the future.');
      return;
    }

    setFormSubmitting(true);
    try {
      await patientApi.create({
        name: formData.name.trim(),
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        email: formData.email ? formData.email.trim() : null,
        phone: formData.phone ? formData.phone.trim() : null,
        address: formData.address ? formData.address.trim() : null,
      });
      toast.success('Patient created successfully!');
      setIsAddOpen(false);
      resetForm();
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create patient.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    if (formData.date_of_birth && new Date(formData.date_of_birth) > new Date()) {
      toast.error('Date of birth cannot be in the future.');
      return;
    }

    setFormSubmitting(true);
    try {
      await patientApi.update(selectedPatient.id, {
        name: formData.name.trim(),
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        email: formData.email ? formData.email.trim() : null,
        phone: formData.phone ? formData.phone.trim() : null,
        address: formData.address ? formData.address.trim() : null,
      });
      toast.success('Patient record updated successfully!');
      setIsEditOpen(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update patient.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPatient) return;
    setFormSubmitting(true);
    try {
      await patientApi.delete(selectedPatient.id);
      toast.success('Patient record deleted successfully.');
      setIsDeleteOpen(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete patient record.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filter & Search logic
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone?.includes(searchQuery);

    const matchesGender =
      genderFilter === 'All' ||
      patient.gender?.toLowerCase() === genderFilter.toLowerCase();

    return matchesSearch && matchesGender;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-soft">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patients by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
            >
              <option value="All">All Genders</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchPatients}
            disabled={loading}
            title="Reload patients"
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
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Patients Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : filteredPatients.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Patient Name</th>
                    <th className="py-3.5 px-6">Date of Birth</th>
                    <th className="py-3.5 px-6">Gender</th>
                    <th className="py-3.5 px-6">Contact Details</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {patient.name ? patient.name[0].toUpperCase() : 'P'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{patient.name}</p>
                            <p className="text-xs text-slate-400">ID #{patient.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {patient.date_of_birth ? patient.date_of_birth.split('T')[0] : '—'}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            patient.gender?.toLowerCase() === 'female'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : patient.gender?.toLowerCase() === 'male'
                              ? 'bg-brand-50 text-brand-700 border border-brand-100'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {patient.gender}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-0.5 text-xs">
                          {patient.email && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{patient.email}</span>
                            </div>
                          )}
                          {patient.phone && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{patient.phone}</span>
                            </div>
                          )}
                          {!patient.email && !patient.phone && <span className="text-slate-400">No contact info</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenView(patient)}
                            title="View Patient Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(patient)}
                            title="Edit Patient"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(patient)}
                            title="Delete Patient"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Alternative View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                        {patient.name ? patient.name[0].toUpperCase() : 'P'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{patient.name}</h4>
                        <p className="text-xs text-slate-400">ID #{patient.id}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {patient.gender}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl">
                    <p>DOB: {patient.date_of_birth ? patient.date_of_birth.split('T')[0] : '—'}</p>
                    {patient.email && <p>Email: {patient.email}</p>}
                    {patient.phone && <p>Phone: {patient.phone}</p>}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleOpenView(patient)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleOpenEdit(patient)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleOpenDelete(patient)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Users}
            title={searchQuery || genderFilter !== 'All' ? 'No matching patients' : 'No patient records found'}
            description={
              searchQuery || genderFilter !== 'All'
                ? 'Try adjusting your search criteria or clearing filters.'
                : 'Get started by creating your first patient profile.'
            }
            actionLabel={searchQuery || genderFilter !== 'All' ? undefined : 'Add First Patient'}
            onAction={searchQuery || genderFilter !== 'All' ? undefined : handleOpenAdd}
          />
        )}
      </div>

      {/* Add / Edit Patient Modal */}
      <Modal
        isOpen={isAddOpen || isEditOpen}
        onClose={() => {
          setIsAddOpen(false);
          setIsEditOpen(false);
          setSelectedPatient(null);
        }}
        title={isAddOpen ? 'Add New Patient' : 'Edit Patient Profile'}
        subtitle={isAddOpen ? 'Enter medical demographic details' : `Updating ID #${selectedPatient?.id}`}
      >
        <form onSubmit={isAddOpen ? handleCreateSubmit : handleUpdateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Patient Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Johnathan Doe"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500"
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555-0199"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Residential Address
            </label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full residential street, city, state address"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500"
            />
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
              <span>{isAddOpen ? 'Save Patient' : 'Update Patient'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* View Patient Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Patient Information"
        subtitle={`ID #${selectedPatient?.id}`}
      >
        {selectedPatient && (
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-bold text-lg flex items-center justify-center">
                {selectedPatient.name[0]}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">{selectedPatient.name}</h4>
                <p className="text-xs text-slate-500">Gender: {selectedPatient.gender}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">Date of Birth</span>
                <p className="font-semibold text-slate-800">
                  {selectedPatient.date_of_birth ? selectedPatient.date_of_birth.split('T')[0] : 'Not specified'}
                </p>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">Phone</span>
                <p className="font-semibold text-slate-800">{selectedPatient.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-100 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Email Address</span>
              <p className="font-semibold text-slate-800">{selectedPatient.email || 'Not provided'}</p>
            </div>

            <div className="p-3 bg-white border border-slate-100 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Address</span>
              <p className="font-medium text-slate-700">{selectedPatient.address || 'No address provided'}</p>
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
        title="Delete Patient Record?"
        message={`Are you sure you want to permanently remove "${selectedPatient?.name}"? All related medical assignments will also be removed.`}
        confirmText="Confirm Delete"
        loading={formSubmitting}
      />
    </div>
  );
};

export default Patients;
