import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100/60',
    },
    teal: {
      bg: 'bg-teal-50 text-teal-600',
      border: 'border-teal-100/60',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100/60',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100/60',
    },
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`p-6 bg-white rounded-2xl border ${selectedColor.border} shadow-soft hover:shadow-soft-lg transition-all`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`p-3 rounded-xl ${selectedColor.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </div>
    </motion.div>
  );
};

export default StatCard;
