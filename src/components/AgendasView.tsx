import React, { useState } from 'react';
import { Plus, Trash2, Calendar as CalendarIcon, CheckCircle2, Circle, ListTodo, MessageSquarePlus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Organization, Agenda, AgendaTopic } from '../types';
import { generateId, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  organization: Organization;
  agendas: Agenda[];
  onSave: (agenda: Agenda) => void;
  onUpdate: (agenda: Agenda) => void;
  onDelete: (id: string) => void;
}

export default function AgendasView({ organization, agendas, onSave, onUpdate, onDelete }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);

  const handleAddTopic = () => {
    if (!topicInput.trim()) return;
    setTopics([...topics, topicInput.trim()]);
    setTopicInput('');
  };

  const handleSave = () => {
    onSave({
      id: generateId(),
      date,
      organization,
      topics: topics.map(t => ({ id: generateId(), topic: t, completed: false })),
      decisions: []
    });
    setTopics([]);
    setShowAddForm(false);
  };

  const toggleTopic = (agenda: Agenda, topicId: string) => {
    const updated = {
      ...agenda,
      topics: agenda.topics.map(t => t.id === topicId ? { ...t, completed: !t.completed } : t)
    };
    onUpdate(updated);
    if (selectedAgenda?.id === agenda.id) setSelectedAgenda(updated);
  };

  const sortedAgendas = [...agendas].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-3xl border border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center">
            <ListTodo size={18} className="text-lila-400" />
          </div>
          <p className="text-sm text-lila-300 font-medium font-serif italic">Gestiona las reuniones de presidencia para la organización.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-lila-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-lila-700 transition-all shadow-md shadow-lila-100 active:scale-95"
        >
          <Plus size={16} /> Nueva Agenda
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Agendas List */}
        <div className={cn("lg:col-span-4 space-y-4", selectedAgenda ? "hidden lg:block" : "lg:col-span-12 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0")}>
          {sortedAgendas.map((agenda) => (
            <motion.div 
              layoutId={agenda.id}
              key={agenda.id}
              onClick={() => setSelectedAgenda(agenda)}
              className={cn(
                "p-5 rounded-[2rem] border cursor-pointer transition-all flex flex-col justify-between h-full group",
                selectedAgenda?.id === agenda.id 
                  ? "bg-lila-600 border-lila-500 shadow-xl shadow-black/20" 
                  : "bg-white/5 border-white/10 hover:border-lila-500/50 shadow-sm"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-4 text-lila-400 group-hover:text-white">
                  <CalendarIcon size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{format(parseISO(agenda.date), 'dd MMM yyyy', { locale: es })}</span>
                </div>
                <h4 className={cn("font-serif italic text-xl mb-1", selectedAgenda?.id === agenda.id ? "text-white" : "text-lila-100")}>Reunión de Presidencia</h4>
                <div className="flex gap-1.5 mt-3">
                  <span className={cn("text-[10px] px-2.5 py-1 rounded-full uppercase font-bold tracking-widest", selectedAgenda?.id === agenda.id ? "bg-white/20 text-white" : "bg-white/5 text-lila-300")}>
                    {agenda.topics.length} Temas
                  </span>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(agenda.id); if (selectedAgenda?.id === agenda.id) setSelectedAgenda(null); }}
                className="mt-6 p-2 text-lila-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all self-end opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
          {agendas.length === 0 && (
            <div className="lg:col-span-3 py-20 bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-white/10 gap-4">
              <ListTodo size={40} strokeWidth={1} />
              <p className="italic font-serif text-lg">No hay agendas registradas</p>
            </div>
          )}
        </div>

        {/* Selected Agenda Detail */}
        {selectedAgenda && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-sm overflow-hidden flex flex-col min-h-[500px]"
          >
            <div className="p-8 bg-white/5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-3xl font-serif italic text-lila-100 leading-tight">Detalles de la Reunión</h3>
                <p className="text-lila-400 text-sm italic flex items-center gap-2 mt-2">
                  <CalendarIcon size={12} /> {format(parseISO(selectedAgenda.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                </p>
              </div>
              <button 
                onClick={() => setSelectedAgenda(null)}
                className="lg:hidden px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-widest text-lila-100"
              >
                Volver
              </button>
            </div>
            
            <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] uppercase tracking-widest text-lila-400 font-bold">Agenda de Temas</h4>
                  <span className="text-[10px] font-bold text-lila-200 uppercase tracking-widest">
                    {selectedAgenda.topics.filter(t => t.completed).length} de {selectedAgenda.topics.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {selectedAgenda.topics.map((topic) => (
                    <div 
                      key={topic.id}
                      onClick={() => toggleTopic(selectedAgenda, topic.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border",
                        topic.completed 
                          ? "bg-white/5 border-transparent text-lila-500 line-through" 
                          : "bg-white/5 border-white/10 text-lila-100 hover:border-lila-500/50"
                      )}
                    >
                      {topic.completed ? <CheckCircle2 className="text-lila-200" size={16} /> : <Circle className="text-white/10" size={16} />}
                      <p className="text-sm font-medium">{topic.topic}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                <h4 className="text-[10px] uppercase tracking-widest text-lila-400 font-bold">Notas & Acuerdos</h4>
                <div className="bg-white/5 border border-white/10 border-dashed rounded-[2rem] p-8 min-h-[200px] flex items-center justify-center">
                   <p className="text-white/10 text-sm italic font-serif text-center">Registrar acuerdos en el próximo despliegue.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Agenda Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-gray-900/10 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              className="relative bg-[#0f172a] w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 overflow-hidden border border-white/10"
            >
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-serif italic text-lila-100">Nueva Agenda</h3>
                <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-white/5 rounded-full text-lila-400 transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-lila-400 mb-2 block">Fecha de Reunión</label>
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-lila-500 outline-none font-medium text-lila-100"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-lila-400 mb-2 block">Añadir Temas</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Escriba un tema y presione Enter..."
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-lila-500 outline-none font-medium text-lila-100"
                    />
                    <button 
                      onClick={handleAddTopic}
                      className="bg-lila-600 text-white w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-lila-700 transition-all shadow-sm"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-2 mt-4 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar text-lila-100">
                    {topics.map((t, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl group border border-transparent hover:border-white/10 text-lila-100">
                        <span className="text-sm font-medium">{t}</span>
                        <button 
                          onClick={() => setTopics(topics.filter((_, i) => i !== idx))}
                          className="text-white/20 hover:text-red-500 transition-all p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {topics.length === 0 && (
                      <p className="text-center py-6 text-white/10 italic text-sm font-serif">Añada al menos un tema a la agenda</p>
                    )}
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-6 py-4 border border-white/10 text-lila-300 rounded-2xl hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={topics.length === 0}
                    className="flex-1 px-6 py-4 bg-lila-600 text-white rounded-2xl hover:bg-lila-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-black/20 text-sm font-bold uppercase tracking-widest"
                  >
                    Guardar
                  </button>
                </div>
              </div>
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
