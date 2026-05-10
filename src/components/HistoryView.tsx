import React, { useState, FormEvent } from 'react';
import { Plus, Trash2, History, MapPin, Users, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { Organization, WardHistoryActivity } from '../types';
import { generateId } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  organization: Organization;
  activities: WardHistoryActivity[];
  onSave: (activity: WardHistoryActivity) => void;
  onDelete: (id: string) => void;
}

export default function HistoryView({ organization, activities, onSave, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !description || attendance === '') return;
    
    onSave({
      id: generateId(),
      date,
      title,
      description,
      attendance: Number(attendance),
      organization,
      imageUrl: imageUrl || undefined,
      notes: notes || undefined
    });
    
    setTitle('');
    setDescription('');
    setAttendance('');
    setImageUrl('');
    setNotes('');
    setShowForm(false);
  };

  const sortedActivities = [...activities].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="text-lila-300 text-sm max-w-lg font-serif italic">
          Cualquier evento significativo o espiritual de su organización debe ser documentado para la posteridad.
        </p>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 bg-lila-600 text-white px-8 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-lila-700 transition-all shadow-xl shadow-black/20 active:scale-95"
        >
          <Plus size={16} /> Nueva Bitácora
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedActivities.map((activity) => (
          <motion.div 
            key={activity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-[2.5rem] border border-white/10 shadow-sm hover:shadow-xl transition-all p-8 relative group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="bg-white/5 p-3 rounded-2xl">
                <History size={18} className="text-lila-400" />
              </div>
              <button 
                onClick={() => onDelete(activity.id)}
                className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {activity.imageUrl && (
              <div className="mb-6 rounded-2xl overflow-hidden aspect-video bg-white/5">
                <img 
                  src={activity.imageUrl} 
                  alt={activity.title} 
                  className="w-full h-full object-cover grayscale opacity-50 transition-all group-hover:grayscale-0 group-hover:opacity-100" 
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-lila-400 block mb-2">
                  {format(parseISO(activity.date), "d 'de' MMMM, yyyy", { locale: es })}
                </span>
                <h4 className="text-2xl font-serif italic text-lila-100 leading-tight">{activity.title}</h4>
              </div>
              
              <p className="text-sm text-lila-300 line-clamp-3 leading-relaxed italic border-l-2 border-white/10 pl-4 py-1">
                {activity.description}
              </p>

              {activity.notes && (
                <div className="flex items-start gap-2 pt-2">
                  <MessageSquare size={12} className="text-lila-400 mt-1 flex-shrink-0" />
                  <p className="text-xs text-lila-400 italic line-clamp-2">
                    {activity.notes}
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-lila-400">
                  <Users size={12} />
                  <span className="text-[10px] items-center gap-1.5 font-bold uppercase tracking-widest">{activity.attendance} asistentes</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {activities.length === 0 && (
          <div className="col-span-full py-24 bg-white/5 border border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center text-white/10 gap-4">
            <History size={50} strokeWidth={1} />
            <p className="text-xl font-serif italic">La historia aún espera ser escrita</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-lila-900/10 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.98 }}
              className="relative bg-[#0f172a] w-full max-w-2xl rounded-[3rem] shadow-2xl p-12 overflow-hidden border border-white/10"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-3xl font-serif italic text-lila-100">Registrar Evento</h3>
                  <p className="text-lila-400 text-sm mt-1 font-serif italic">Documenta la historia de tu barrio.</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-3 hover:bg-white/5 rounded-full text-lila-400 transition-all">
                   <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-lila-400 mb-2 block">Nombre del Evento</label>
                    <input 
                      type="text"
                      placeholder="Nombre de la actividad"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-lila-500 outline-none font-medium text-lila-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-lila-400 mb-2 block">Fecha</label>
                    <input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-lila-500 outline-none font-medium text-lila-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-lila-400 mb-2 block">Asistencia</label>
                    <input 
                      type="number"
                      placeholder="Personas"
                      value={attendance}
                      onChange={(e) => setAttendance(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-lila-500 outline-none font-medium text-lila-100"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-lila-400 mb-2 block">Relato de la Actividad</label>
                  <textarea 
                    rows={3}
                    placeholder="Describe sentimientos, propósitos y resultados espirituales..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-lila-500 outline-none resize-none font-medium leading-relaxed text-lila-100 placeholder:text-white/10"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-lila-400 mb-2 block">Notas Detalladas (Opcional)</label>
                    <textarea 
                      rows={3}
                      placeholder="Pensamientos adicionales o anécdotas..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-lila-500 outline-none resize-none font-medium leading-relaxed text-lila-100 placeholder:text-white/10"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-lila-400 mb-2 block">Link de Imagen (Simulado)</label>
                    <div className="relative">
                      <input 
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-sm focus:ring-2 focus:ring-lila-500 outline-none font-medium text-lila-100 placeholder:text-white/10"
                      />
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10" size={18} />
                    </div>
                    <p className="text-[8px] text-lila-400 mt-2 italic">Pegue una URL de imagen para guardarla en el registro.</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-8 py-4 border border-white/10 text-lila-400 rounded-2xl hover:bg-white/5 transition-all font-bold text-[10px] uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-8 py-4 bg-lila-600 text-white rounded-2xl hover:bg-lila-700 transition-all shadow-xl shadow-black/20 font-bold text-[10px] uppercase tracking-widest"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
