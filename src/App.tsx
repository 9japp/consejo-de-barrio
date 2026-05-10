import { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  HeartHandshake, 
  History, 
  FileText, 
  Menu, 
  X,
  Home as HomeIcon,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ORGANIZATIONS, 
  cn, 
  getFromStorage, 
  saveToStorage, 
} from './lib/utils';
import { 
  AppData, 
  Organization, 
} from './types';

// Components (We will create these files next)
import AttendanceView from './components/AttendanceView';
import AgendasView from './components/AgendasView';
import MinisteringView from './components/MinisteringView';
import HistoryView from './components/HistoryView';
import ReportView from './components/ReportView';

const HomeView = ({ onStart }: { onStart: () => void }) => (
  <div className="relative min-h-[calc(100vh-4rem)] md:min-h-screen flex flex-col items-center justify-center text-center p-6 bg-[#0b1120] overflow-hidden">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl"
    >
      <h1 className="text-5xl md:text-6xl font-serif italic text-lila-100 mb-6 font-medium leading-tight">Barrio 9 de Julio</h1>
      <p className="text-xl md:text-2xl text-lila-300 mb-10 font-serif italic leading-relaxed">
        "Y el Señor de la viña dijo a su siervo: Ven y descendamos a la viña para que podamos trabajar en ella"
      </p>
      
      <button 
        onClick={onStart}
        className="px-10 py-4 bg-lila-600 text-white rounded-xl hover:bg-lila-700 transition-all active:scale-95 shadow-lg shadow-lila-200 flex items-center gap-3 mx-auto text-lg font-medium"
      >
        Empezar <ChevronRight size={20} />
      </button>
    </motion.div>
    
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.15 }}
      transition={{ duration: 2 }}
      className="absolute inset-0 z-0 pointer-events-none"
    >
      <img src="/image_0.png" alt="Jesucristo" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
    </motion.div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'attendance' | 'agendas' | 'interviews' | 'history' | 'reports'>('home');
  const [selectedOrg, setSelectedOrg] = useState<Organization>('Sociedad de Socorro');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState<AppData>(() => getFromStorage('ward_data', {
    attendance: [],
    agendas: [],
    interviews: [],
    history: []
  }));

  useEffect(() => {
    saveToStorage('ward_data', data);
  }, [data]);

  const navItems = [
    { id: 'attendance', label: 'Asistencia', icon: Users },
    { id: 'agendas', label: 'Agendas de Reunión', icon: Calendar },
    { id: 'interviews', label: 'Entrevistas de Ministración', icon: HeartHandshake, orgOnly: ['Sociedad de Socorro', 'Quórum de Élderes'] as Organization[] },
    { id: 'history', label: 'Historia de Barrio', icon: History },
    { id: 'reports', label: 'Informe para Consejo', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0b1120]">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#0b1120] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2" onClick={() => setActiveTab('home')}>
          <HomeIcon size={20} className="text-lila-400" />
          <h1 className="text-lg font-serif italic font-semibold tracking-tight text-lila-100">Barrio 9 de Julio</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-lila-100 rounded-lg bg-lila-600">
          <Menu size={24} />
        </button>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-0 z-50 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out bg-[#0f172a] border-r border-white/10 w-72 flex flex-col shadow-2xl md:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="cursor-pointer group" onClick={() => { setActiveTab('home'); setIsSidebarOpen(false); }}>
            <h1 className="text-xs font-bold uppercase tracking-widest text-lila-400 font-sans">Portal de Secretario</h1>
            <p className="text-lg font-serif italic text-lila-100">Barrio 9 de Julio</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-lila-400 p-2 hover:bg-white/5 rounded-full">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-8">
          <div className="px-8 mb-10">
            <label className="text-[10px] uppercase tracking-widest text-lila-400 font-bold mb-3 block">Organización</label>
            <div className="relative">
              <select 
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value as Organization)}
                className="w-full bg-black border border-white/10 text-lila-100 text-sm rounded-xl p-3 pl-4 focus:ring-2 focus:ring-lila-500 outline-none appearance-none cursor-pointer hover:bg-black/80 transition-colors"
              >
                {ORGANIZATIONS.map(org => (
                  <option key={org} value={org} className="bg-black text-white">{org}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-lila-300">
                <ChevronRight size={16} className="rotate-90" />
              </div>
            </div>
          </div>

          <div className="px-4 space-y-1">
            {navItems.map((item) => {
              if (item.orgOnly && !item.orgOnly.includes(selectedOrg)) return null;
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all text-sm font-medium",
                    isActive 
                      ? "bg-lila-600 text-white shadow-sm border border-lila-500" 
                      : "text-lila-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={18} className={isActive ? "text-white" : "text-lila-400"} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HomeView onStart={() => setActiveTab('attendance')} />
            </motion.div>
          ) : (
            <motion.div 
              key={activeTab + selectedOrg}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-8 md:p-12 max-w-6xl mx-auto w-full"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-8 border-b border-white/10 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-lila-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                    <span>{selectedOrg}</span>
                    <ChevronRight size={12} />
                    <span className="text-lila-200">{navItems.find(i => i.id === activeTab)?.label}</span>
                  </div>
                  <h2 className="text-4xl font-serif italic text-lila-100 tracking-tight">
                    {navItems.find(i => i.id === activeTab)?.label}
                  </h2>
                </div>
              </div>

              <div className="min-h-[60vh]">
                {activeTab === 'attendance' && (
                  <AttendanceView 
                    organization={selectedOrg} 
                    records={data.attendance.filter(r => r.organization === selectedOrg)}
                    onSave={(record) => setData(prev => ({ ...prev, attendance: [...prev.attendance, record] }))}
                    onDelete={(id) => setData(prev => ({ ...prev, attendance: prev.attendance.filter(r => r.id !== id) }))}
                  />
                )}
                {activeTab === 'agendas' && (
                  <AgendasView 
                    organization={selectedOrg} 
                    agendas={data.agendas.filter(a => a.organization === selectedOrg)}
                    onSave={(agenda) => setData(prev => ({ ...prev, agendas: [...prev.agendas, agenda] }))}
                    onUpdate={(updated) => setData(prev => ({ ...prev, agendas: prev.agendas.map(a => a.id === updated.id ? updated : a) }))}
                    onDelete={(id) => setData(prev => ({ ...prev, agendas: prev.agendas.filter(a => a.id !== id) }))}
                  />
                )}
                {activeTab === 'interviews' && (selectedOrg === 'Sociedad de Socorro' || selectedOrg === 'Quórum de Élderes') && (
                  <MinisteringView 
                    organization={selectedOrg as 'Sociedad de Socorro' | 'Quórum de Élderes'} 
                    interviews={data.interviews.filter(i => i.organization === selectedOrg)}
                    onSave={(interview) => setData(prev => ({ ...prev, interviews: [...prev.interviews, interview] }))}
                    onDelete={(id) => setData(prev => ({ ...prev, interviews: prev.interviews.filter(i => i.id !== id) }))}
                  />
                )}
                {activeTab === 'history' && (
                  <HistoryView 
                    organization={selectedOrg}
                    activities={data.history.filter(a => !a.organization || a.organization === selectedOrg)}
                    onSave={(activity) => setData(prev => ({ ...prev, history: [...prev.history, activity] }))}
                    onDelete={(id) => setData(prev => ({ ...prev, history: prev.history.filter(a => a.id !== id) }))}
                  />
                )}
                {activeTab === 'reports' && (
                  <ReportView 
                    organization={selectedOrg}
                    data={data}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-lila-900/10 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
