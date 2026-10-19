import React, { useState, useEffect } from 'react';
import { mappingApi } from '../api/mappingApi';
import { patientApi } from '../api/patientApi';
import { doctorApi } from '../api/doctorApi';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import {
  Link as LinkIcon,
  Plus,
  Trash2,
  Users,
  Stethoscope,
  Filter,
  RefreshCw,
  Loader2,
  Calendar,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Assignments = () => {
  const [mappings, setMappings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [patientFilter, setPatientFilter] = useState('All');

  // Modals
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mappingsRes, patientsRes, doctorsRes] = await Promise.all([
        mappingApi.getAll().catch(() => ({ data: { mappings: [] } })),
        patientApi.getAll().catch(() => ({ data: { patients: [] } })),
        doctorApi.getAll().catch(() => ({ data: { doctors: [] } })),
      ]);

      setMappings(mappingsRes?.data?.mappings || []);
      setPatients(patientsRes?.data?.patients || []);
      setDoctors(doctorsRes?.data?.doctors || []);
    } catch (err) {
      toast.error('Failed to load assignments data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAssign = () => {
    setSelectedPatientId(patients[0]?.id ? String(patients[0].id) : '');
    setSelectedDoctorId(doctors[0]?.id ? String(doctors[0].id) : '');
    setIsAssignOpen(true);
  };

  const handleOpenDelete = (mapping) => {
    setSelectedMapping(mapping);
    setIsDeleteOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId) {
      toast.error('Please select both a patient and a doctor.');
      return;
    }

    setFormSubmitting(true);
    try {
      await mappingApi.create({
        patient_id: parseInt(selectedPatientId, 10),
        doctor_id: parseInt(selectedDoctorId, 10),
      });

      toast.success('Doctor successfully assigned to patient!');
      setIsAssignOpen(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to assign doctor.';
      toast.error(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMapping) return;
    setFormSubmitting(true);
    try {
      await mappingApi.delete(selectedMapping.id);
      toast.success('Assignment removed successfully.');
      setIsDeleteOpen(false);
      setSelectedMapping(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove assignment.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filter mappings by selected patient
  const filteredMappings = mappings.filter((m) => {
    if (patientFilter === 'All') return true;
    return String(m.patient_id) === String(patientFilter);
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-soft">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Patient Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
            >
              <option value="All">All Patients ({mappings.length})</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (ID #{p.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            title="Reload mappings"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenAssign}
            disabled={patients.length === 0 || doctors.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all focus:ring-4 focus:ring-brand-100 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Doctor</span>
          </button>
        </div>
      </div>

      {/* Warning if no patients or doctors exist yet */}
      {(patients.length === 0 || doctors.length === 0) && !loading && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p>
            {patients.length === 0 && doctors.length === 0
              ? 'Please create at least one Patient and one Doctor before assigning care teams.'
              : patients.length === 0
              ? 'You have no patients yet. Please add a patient first.'
              : 'The doctor directory is empty. Please add a doctor first.'}
          </p>
        </div>
      )}

      {/* Assignments Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        {loading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : filteredMappings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Patient (Care Recipient)</th>
                  <th className="py-3.5 px-6">Assigned Doctor</th>
                  <th className="py-3.5 px-6">Specialty</th>
                  <th className="py-3.5 px-6">Assigned On</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMappings.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{m.patient_name || `Patient #${m.patient_id}`}</p>
                          <p className="text-xs text-slate-400">Patient ID: #{m.patient_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{m.doctor_name || `Doctor #${m.doctor_id}`}</p>
                          <p className="text-xs text-slate-400">Doctor ID: #{m.doctor_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                        {m.doctor_specialization || 'Specialist'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Active'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(m)}
                        title="Remove Assignment"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={LinkIcon}
            title={patientFilter !== 'All' ? 'No assignments for this patient' : 'No active doctor assignments'}
            description="Assign doctors to coordinate specialized patient care plans."
            actionLabel={patients.length > 0 && doctors.length > 0 ? 'Create Assignment' : undefined}
            onAction={patients.length > 0 && doctors.length > 0 ? handleOpenAssign : undefined}
          />
        )}
      </div>

      {/* Assign Doctor Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Assign Doctor to Patient"
        subtitle="Establish a new care relationship"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Select Patient *
            </label>
            <select
              required
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (DOB: {p.date_of_birth ? p.date_of_birth.split('T')[0] : 'N/A'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Select Doctor *
            </label>
            <select
              required
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
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
              <span>Confirm Assignment</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Assignment Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Care Assignment?"
        message={`Are you sure you want to remove the assignment between patient "${selectedMapping?.patient_name || selectedMapping?.patient_id}" and doctor "${selectedMapping?.doctor_name || selectedMapping?.doctor_id}"?`}
        confirmText="Remove Assignment"
        loading={formSubmitting}
      />
    </div>
  );
};

export default Assignments;
