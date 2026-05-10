import React, { useState, FormEvent } from 'react';
import { Plus, Trash2, Calendar as CalendarIcon, Users, TrendingUp } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { format, parseISO, getMonth, getYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { Organization, AttendanceRecord } from '../types';
import { generateId, MONTHS, cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface Props {
  organization: Organization;
  records: AttendanceRecord[];
  onSave: (record: AttendanceRecord) => void;
  onDelete: (id: string) => void;
}

export default function AttendanceView({ organization, records, onSave, onDelete }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [count, setCount] = useState<number | ''>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (count === '') return;
    
    onSave({
      id: generateId(),
      date,
      organization,
      count: Number(count)
    });
    setCount('');
  };

  const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));
  
  // Recent records for the bar chart
  const weeklyChartData = [...records]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-8)
    .map(r => ({
      ...r,
      formattedDate: format(parseISO(r.date), 'dd MMM', { locale: es })
    }));

  // Monthly aggregation
  const currentYear = new Date().getFullYear();
  const monthlyData = MONTHS.map((monthName, index) => {
    const monthRecords = records.filter(r => {
      const d = parseISO(r.date);
      return getMonth(d) === index && getYear(d) === currentYear;
    });

    const average = monthRecords.length > 0 
      ? Math.round(monthRecords.reduce((acc, r) => acc + r.count, 0) / monthRecords.length)
      : 0;

    return {
      name: monthName.substring(0, 3),
      fullName: monthName,
      average,
      count: monthRecords.length
    };
  });

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6 text-lila-100">
            <Plus size={18} className="text-lila-400" />
            <h3 className="text-lg font-serif italic">Registrar Asistencia</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-lila-400 mb-1.5 block">Fecha</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-lila-500 outline-none transition-all font-medium text-lila-100"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-lila-400 mb-1.5 block">Asistentes</label>
              <input 
                type="number"
                placeholder="0"
                value={count}
                onChange={(e) => setCount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-lila-500 outline-none transition-all font-medium text-lila-100"
                required
                min="0"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-lila-600 text-white rounded-xl py-3.5 text-sm font-medium hover:bg-lila-700 transition-all shadow-md shadow-lila-100 active:scale-[0.98]"
            >
              Guardar Registro
            </button>
          </form>
        </motion.div>

        {/* Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-lila-100">
              <Users size={18} className="text-lila-400" />
              <h3 className="text-lg font-serif italic">Historial Reciente</h3>
            </div>
            <span className="text-[10px] text-lila-400 uppercase tracking-widest font-bold">Últimas 8 reuniones</span>
          </div>
          
          <div className="flex-1 min-h-[250px] w-full">
            {weeklyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="formattedDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#c4b5fd', fontSize: 10, fontWeight: 600 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#c4b5fd', fontSize: 10, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]} barSize={24}>
                    {weeklyChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === weeklyChartData.length - 1 ? '#8b5cf6' : '#4c1d95'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/10 gap-2">
                <Users size={40} strokeWidth={1} />
                <p className="text-sm italic">Sin datos registrados aún</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Monthly Summary */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 p-8 rounded-[3rem] border border-white/10 shadow-sm"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 text-lila-100">
            <TrendingUp size={24} className="text-lila-400" />
            <div>
              <h3 className="text-xl font-serif italic">Promedio Mensual</h3>
              <p className="text-[10px] text-lila-400 uppercase tracking-widest font-bold">Tendencia del año {currentYear}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {monthlyData.map((month) => (
            <div 
              key={month.fullName}
              className={cn(
                "p-4 rounded-[1.5rem] border transition-all",
                month.average > 0 
                  ? "bg-white/5 border-white/10" 
                  : "bg-white/5 border-transparent opacity-20"
              )}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-lila-400 block mb-2">{month.fullName}</span>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-serif italic text-lila-100 leading-none">{month.average}</span>
                <span className="text-[10px] text-lila-500 font-bold mb-1">prom.</span>
              </div>
              <p className="text-[9px] text-lila-400 mt-2 font-medium">
                {month.count} {month.count === 1 ? 'reunión' : 'reuniones'}
              </p>
            </div>
          ))}
        </div>

        {records.length > 0 && (
          <div className="mt-10 h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData.filter(m => m.count > 0)}>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' }}
                  labelStyle={{ display: 'none' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#6d28d9' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* History List */}
      <div className="bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-serif italic text-lila-100">Registros Detallados</h3>
          <span className="bg-white/5 text-lila-400 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest">
            {records.length} {records.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-lila-400 font-bold border-b border-white/5">
                <th className="px-8 py-4">Fecha</th>
                <th className="px-8 py-4">Día</th>
                <th className="px-8 py-4">Asistencia</th>
                <th className="px-8 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-4 font-medium text-lila-100">{record.date}</td>
                  <td className="px-8 py-4 text-sm text-lila-400 italic">
                    {format(parseISO(record.date), 'EEEE', { locale: es })}
                  </td>
                  <td className="px-8 py-4 text-sm text-lila-100">
                    <span className="bg-white/5 text-lila-300 px-2 py-0.5 rounded text-xs font-bold font-sans border border-white/5">
                      {record.count}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button 
                      onClick={() => onDelete(record.id)}
                      className="p-2 text-lila-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-white/10 italic font-serif text-lg">
                    No se han registrado asistencias
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
