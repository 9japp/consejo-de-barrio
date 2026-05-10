import React, { useState, FormEvent } from 'react';
import { Plus, Trash2, HeartHandshake, PieChart as PieChartIcon } from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Organization, MinisteringInterview } from '../types';
import { generateId, MONTHS } from '../lib/utils';
import { motion } from 'framer-motion';

interface Props {
  organization: 'Sociedad de Socorro' | 'Quórum de Élderes';
  interviews: MinisteringInterview[];
  onSave: (interview: MinisteringInterview) => void;
  onDelete: (id: string) => void;
}

export default function MinisteringView({ organization, interviews, onSave, onDelete }: Props) {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [interviewedCount, setInterviewedCount] = useState<number | ''>('');
  const [totalPairs, setTotalPairs] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (interviewedCount === '' || totalPairs === '') return;
    
    // Check if month already exists
    if (interviews.some(i => i.month === month && i.year === year)) {
      alert('Ya existe un informe para este mes y año.');
      return;
    }

    onSave({
      id: generateId(),
      month,
      year,
      organization,
      interviewedCount: Number(interviewedCount),
      totalPairs: Number(totalPairs),
      notes: notes.trim() || undefined
    });
    setInterviewedCount('');
    setTotalPairs('');
    setNotes('');
  };

  const sortedInterviews = [...interviews].sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month);
  
  const currentMonthData = sortedInterviews[0];
  const pieData = currentMonthData ? [
    { name: 'Entrevistados', value: currentMonthData.interviewedCount, color: '#7c3aed' },
    { name: 'Pendientes', value: Math.max(0, currentMonthData.totalPairs - currentMonthData.interviewedCount), color: '#ede9fe' }
  ] : [];

  const barChartData = MONTHS.map((m, idx) => {
    const interview = interviews.find(i => i.month === idx && i.year === year);
    return {
      name: m.substring(0, 3),
      percentage: interview ? Math.round((interview.interviewedCount / interview.totalPairs) * 100) : 0,
      fullMonth: m
    };
  });

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8 text-lila-100">
            <HeartHandshake size={20} className="text-lila-400" />
            <h3 className="text-xl font-serif italic">Registrar Entrevistas</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-lila-400 mb-2 block">Mes</label>
                <select 
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-lila-500 outline-none font-medium appearance-none text-lila-100"
                >
                  {MONTHS.map((m, idx) => (
                    <option key={m} value={idx} className="bg-[#0f172a]">{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-lila-400 mb-2 block">Año</label>
                <input 
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-lila-500 outline-none font-medium text-lila-100"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-lila-400 mb-2 block">Compañerismos Entrevistados</label>
              <input 
                type="number"
                placeholder="0"
                value={interviewedCount}
                onChange={(e) => setInterviewedCount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-lila-500 outline-none font-medium text-lila-100 placeholder:text-white/10"
                required
                min="0"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-lila-400 mb-2 block">Total de Compañerismos</label>
              <input 
                type="number"
                placeholder="0"
                value={totalPairs}
                onChange={(e) => setTotalPairs(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-lila-500 outline-none font-medium text-lila-100 placeholder:text-white/10"
                required
                min="0"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-lila-400 mb-2 block">Notas u Observaciones</label>
              <textarea 
                placeholder="Detalles sobre el progreso, necesidades especiales o testimonios compartidos..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-lila-500 outline-none font-medium text-lila-100 min-h-[100px] resize-none placeholder:text-white/10"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-lila-600 text-white rounded-xl py-4 text-sm font-bold uppercase tracking-widest hover:bg-lila-700 transition-all shadow-xl shadow-black/20 active:scale-[0.98] mt-4"
            >
              Guardar Reporte
            </button>
          </form>
        </motion.div>

        {/* Stats Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-sm flex flex-col items-center justify-center text-center overflow-hidden"
        >
          {currentMonthData ? (
            <div className="w-full h-full flex flex-col items-center">
              <div className="flex items-center justify-center gap-3 text-lila-100 mb-8 w-full">
                <PieChartIcon size={20} className="text-lila-400" />
                <h3 className="text-xl font-serif italic">Avance {MONTHS[currentMonthData.month]} {currentMonthData.year}</h3>
              </div>
              
              <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="h-[240px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={75}
                        outerRadius={105}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? '#8b5cf6' : 'rgba(255,255,255,0.05)'} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-serif italic text-lila-100 leading-none">
                      {Math.round((currentMonthData.interviewedCount / currentMonthData.totalPairs) * 100)}%
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-lila-400 font-bold mt-1">Completado</span>
                  </div>
                </div>

                <div className="h-full flex flex-col justify-center space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <span className="block text-3xl font-serif italic text-lila-100 leading-none mb-1">{currentMonthData.interviewedCount}</span>
                      <span className="text-[8px] uppercase tracking-[0.2em] text-lila-400 font-bold">Hechas</span>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <span className="block text-3xl font-serif italic text-lila-100 leading-none mb-1">{currentMonthData.totalPairs - currentMonthData.interviewedCount}</span>
                      <span className="text-[8px] uppercase tracking-[0.2em] text-lila-400 font-bold">Pendientes</span>
                    </div>
                  </div>
                  
                  <div className="text-left py-4 px-6 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-xs text-lila-300 font-serif italic leading-relaxed">
                      "Un solo informe nunca podrá comunicar el amor, pero un informe preciso nos ayuda a asegurar que nadie sea olvidado."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-white/10 py-10">
              <HeartHandshake size={60} strokeWidth={1} />
              <p className="text-lg italic font-serif text-white/10">Sin registros históricos aún</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Trend Chart Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif italic text-lila-100">Progreso Anual de Entrevistas</h3>
            <p className="text-sm text-lila-400 italic">Tendencia mensual de entrevistas en {year}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-lila-500"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-lila-400">% de Avance</span>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 600, fill: '#c4b5fd' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 600, fill: '#c4b5fd' }}
                unit="%"
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)', radius: 12 }}
                contentStyle={{ 
                  backgroundColor: '#1e293b',
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
                  padding: '12px 16px'
                }}
                labelStyle={{ 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  marginBottom: '4px',
                  color: '#ddd6fe',
                  fontFamily: 'serif',
                  fontStyle: 'italic'
                }}
                formatter={(value: number) => [`${value}%`, 'Avance']}
              />
              <Bar 
                dataKey="percentage" 
                fill="#8b5cf6" 
                radius={[8, 8, 8, 8]} 
                barSize={32}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* List */}
      <div className="bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-serif italic text-lila-100">Historial Mensual</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-lila-400 font-bold border-b border-white/5">
                <th className="px-8 py-5">Periodo</th>
                <th className="px-8 py-5 text-center">Interv.</th>
                <th className="px-8 py-5 text-center">Parejas</th>
                <th className="px-8 py-5">Porcentaje de Avance</th>
                <th className="px-8 py-5">Notas</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedInterviews.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6 font-medium text-lila-100">
                    {MONTHS[item.month]} {item.year}
                  </td>
                  <td className="px-8 py-6 text-sm text-lila-500 text-center font-bold font-serif italic">{item.interviewedCount}</td>
                  <td className="px-8 py-6 text-sm text-lila-400 text-center">{item.totalPairs}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full max-w-[120px] overflow-hidden">
                        <div 
                          className="h-full bg-lila-500 rounded-full" 
                          style={{ width: `${(item.interviewedCount / item.totalPairs) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-lila-400 tracking-wider">
                        {Math.round((item.interviewedCount / item.totalPairs) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 max-w-xs">
                    <p className="text-xs text-lila-400 italic line-clamp-2" title={item.notes}>
                      {item.notes || '---'}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {interviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-white/10 italic font-serif text-xl">
                    Inicia el primer registro del año
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
