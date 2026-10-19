import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientApi } from '../api/patientApi';
import { doctorApi } from '../api/doctorApi';
import { mappingApi } from '../api/mappingApi';
import StatCard from '../components/ui/StatCard';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import {
  Users,
  Stethoscope,
  Link as LinkIcon,
  Plus,
  RefreshCw,
  ArrowRight,
  Calendar,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#0284c7', '#0d9488', '#6366f1', '#f59e0b', '#ec4899'];

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [mappings, setMappings] = useState([]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [patientsRes, doctorsRes, mappingsRes] = await Promise.all([
        patientApi.getAll().catch(() => ({ data: { patients: [] } })),
        doctorApi.getAll().catch(() => ({ data: { doctors: [] } })),
        mappingApi.getAll().catch(() => ({ data: { mappings: [] } })),
      ]);

      setPatients(patientsRes?.data?.patients || []);
      setDoctors(doctorsRes?.data?.doctors || []);
      setMappings(mappingsRes?.data?.mappings || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch healthcare metrics. Please verify backend connectivity.');
      toast.error('Error loading dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Compute gender distribution data from actual patients
  const genderDistribution = React.useMemo(() => {
    if (!patients.length) return [];
    const counts = {};
    patients.forEach((p) => {
      const g = p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1).toLowerCase() : 'Other';
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [patients]);

  // Compute doctors by specialization from actual doctors
  const specializationData = React.useMemo(() => {
    if (!doctors.length) return [];
    const counts = {};
    doctors.forEach((d) => {
      const spec = d.specialization || 'General';
      counts[spec] = (counts[spec] || 0) + 1;
    });
    return Object.entries(counts)
      .slice(0, 5)
      .map(([specialization, count]) => ({ specialization, count }));
  }, [doctors]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-700 via-brand-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-brand-100 border border-white/15 mb-3">
              <Calendar className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'User'}
            </h1>
            <p className="mt-2 text-brand-100 text-sm sm:text-base leading-relaxed">
              Here is your healthcare portal overview. You have {patients.length} patient record{patients.length !== 1 ? 's' : ''} under your supervision and {mappings.length} active specialist assignment{mappings.length !== 1 ? 's' : ''}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 backdrop-blur-md text-white text-sm font-semibold border border-white/20 transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/patients')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-700 hover:bg-brand-50 text-sm font-bold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Patient</span>
            </button>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Error state if backend fails */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="text-xs font-semibold px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="My Patients"
              value={patients.length}
              icon={Users}
              color="blue"
              subtitle="Registered under your provider account"
            />
            <StatCard
              title="Hospital Doctors"
              value={doctors.length}
              icon={Stethoscope}
              color="teal"
              subtitle="Specialist directory available for care"
            />
            <StatCard
              title="Active Assignments"
              value={mappings.length}
              icon={LinkIcon}
              color="indigo"
              subtitle="Current patient-to-doctor relationships"
            />
          </>
        )}
      </div>

      {/* Analytics Charts (Rendered when meaningful data exists) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Breakdown Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Patient Demographics</h3>
              <p className="text-xs text-slate-400">Gender distribution of your patients</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 text-slate-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
            </div>
          ) : genderDistribution.length > 0 ? (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {genderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 ml-4">
                {genderDistribution.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs text-slate-600">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{entry.name}:</span>
                    <span>{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <EmptyState
                icon={Users}
                title="No patient demographics"
                description="Create patients to view gender analytics."
              />
            </div>
          )}
        </div>

        {/* Doctors by Specialization Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Doctor Specializations</h3>
              <p className="text-xs text-slate-400">Top medical specialties in directory</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 text-slate-500">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
            </div>
          ) : specializationData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={specializationData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="specialization"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                  <Bar dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <EmptyState
                icon={Stethoscope}
                title="No doctor data"
                description="Add doctors to view specialization breakdown."
              />
            </div>
          )}
        </div>
      </div>

      {/* Recent Patients and Recent Assignments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Patients</h3>
              <p className="text-xs text-slate-400">Latest records registered by you</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/patients')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            </div>
          ) : patients.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {patients.slice(0, 5).map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                      {p.name ? p.name[0] : 'P'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.gender} • DOB: {p.date_of_birth ? p.date_of_birth.split('T')[0] : 'N/A'}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                    ID #{p.id}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No patients yet"
              description="Add your first patient to manage their care records."
              actionLabel="Add Patient"
              onAction={() => navigate('/patients')}
            />
          )}
        </div>

        {/* Recent Patient-Doctor Assignments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Assignments</h3>
              <p className="text-xs text-slate-400">Patients linked with medical specialists</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/assignments')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            </div>
          ) : mappings.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {mappings.slice(0, 5).map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{m.patient_name || `Patient #${m.patient_id}`}</p>
                      <span className="text-xs text-slate-400">→</span>
                      <p className="text-sm font-semibold text-teal-700">{m.doctor_name || `Doctor #${m.doctor_id}`}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {m.doctor_specialization ? `Specialist: ${m.doctor_specialization}` : 'Specialist Assigned'}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100 font-medium">
                    Assigned
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={LinkIcon}
              title="No assignments yet"
              description="Connect your patients with specialized doctors."
              actionLabel="Assign Doctor"
              onAction={() => navigate('/assignments')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
