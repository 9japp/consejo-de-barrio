import { useState } from 'react';
import { Organization, AppData } from '../types';
import { MONTHS } from '../lib/utils';
import { 
  FileText, 
  Users, 
  HeartHandshake, 
  History, 
  TrendingUp,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  organization: Organization;
  data: AppData;
}

export default function ReportView({ organization, data }: Props) {
  const [note1, setNote1] = useState("");
  const [note2, setNote2] = useState("");

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Filter data for the current month/period
  const orgAttendance = data.attendance
    .filter(a => a.organization === organization)
    .sort((a, b) => b.date.localeCompare(a.date));
  
  const latestAttendance = orgAttendance[0];
  const avgAttendance = orgAttendance.length > 0 
    ? Math.round(orgAttendance.reduce((acc, curr) => acc + curr.count, 0) / orgAttendance.length)
    : 0;

  const orgInterviews = data.interviews.filter(i => i.organization === organization);
  const latestInterview = orgInterviews.sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month)[0];

  const orgHistory = data.history.filter(h => h.organization === organization);
  
  const handleDownload = () => {
    const reportContent = `
INFORME PARA EL CONSEJO DE BARRIO - BARRIO 9 DE JULIO
Organización: ${organization}
Fecha: ${format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}

RESUMEN DE ASISTENCIA:
- Promedio: ${avgAttendance}
- Último Registro: ${latestAttendance?.count || '---'} (${latestAttendance?.date || '---'})

MINISTRACIÓN:
${latestInterview ? `- Informe de ${MONTHS[latestInterview.month]}: ${Math.round((latestInterview.interviewedCount / latestInterview.totalPairs) * 100)}% de avance` : '- Sin registros de entrevistas'}

HISTORIA:
- Eventos en Bitácora: ${orgHistory.length}
- Última Actividad: ${orgHistory.length > 0 ? orgHistory.sort((a, b) => b.date.localeCompare(a.date))[0].title : '---'}

SÍNTESIS:
Para la consideración del Consejo de Barrio: En ${organization}, hemos observado una asistencia que promedia las ${avgAttendance} personas. ${
      (organization === 'Sociedad de Socorro' || organization === 'Quórum de Élderes') && latestInterview 
      ? `Respecto a la ministración, el ${Math.round((latestInterview.interviewedCount / latestInterview.totalPairs) * 100)}% de ${organization === 'Sociedad de Socorro' ? 'nuestras Hermanas Ministrantes' : 'nuestros Hermanos Ministrantes'} han sido ${organization === 'Sociedad de Socorro' ? 'entrevistadas' : 'entrevistados'}.`
      : ''
    }

PUNTOS A TRATAR EN EL CONSEJO:
1. ${note1}
2. ${note2}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Informe_${organization.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-12 pb-20 print:p-0">
      {/* Report Header for Print */}
      <div className="hidden print:block mb-12 text-center">
        <h1 className="text-4xl font-serif italic text-white mb-2">Informe para el Consejo de Barrio</h1>
        <p className="text-lila-300 font-medium font-serif italic">Estado de {organization}</p>
        <p className="text-lila-400 text-xs mt-2 uppercase tracking-widest font-bold">Generado el {format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-start gap-4 max-w-2xl">
          <FileText className="text-lila-400 mt-1" size={20} />
          <div>
            <h4 className="text-lila-100 font-bold text-[10px] uppercase tracking-widest mb-1">Informe Consolidado</h4>
            <p className="text-lila-300 text-xs leading-relaxed italic font-serif">
              Este panel resume el estado actual de su organización para ser presentado ante el Consejo de Barrio.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 bg-lila-600 px-6 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest text-white hover:bg-lila-700 transition-all shadow-xl shadow-black/20 group"
          >
            <Download size={16} /> Descargar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Attendance Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-sm space-y-8"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-serif italic text-lila-100 leading-tight">Asistencia</h3>
          </div>
          
          <div className="space-y-6">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <span className="text-[10px] uppercase font-bold tracking-widest text-lila-400 block mb-2">Promedio</span>
                <span className="text-5xl font-serif italic text-lila-100 leading-none">{avgAttendance}</span>
              </div>
            
            <div className="space-y-2 border-t border-white/5 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-lila-400 font-bold uppercase tracking-widest">Último Dato</span>
                <span className="text-sm font-bold text-lila-100">{latestAttendance ? latestAttendance.count : '---'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-lila-400 font-bold uppercase tracking-widest">Fecha</span>
                <span className="text-xs text-lila-400 italic">{latestAttendance ? latestAttendance.date : '---'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ministering Summary */}
        {(organization === 'Sociedad de Socorro' || organization === 'Quórum de Élderes') && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-sm space-y-8"
          >
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-serif italic text-lila-100 leading-tight">Ministración</h3>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-lila-400 block">Reporte de {latestInterview ? MONTHS[latestInterview.month] : '---'}</span>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-serif italic text-lila-100 leading-none">
                      {latestInterview ? Math.round((latestInterview.interviewedCount / latestInterview.totalPairs) * 100) : 0}%
                    </span>
                    <span className="text-xs text-lila-400 font-bold uppercase tracking-widest">Avance</span>
                 </div>
              </div>
              <div className="px-2">
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-lila-600 rounded-full" 
                    style={{ width: `${latestInterview ? (latestInterview.interviewedCount / latestInterview.totalPairs) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* History Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-sm space-y-8"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-serif italic text-lila-100 leading-tight">Historia</h3>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-lila-400 block mb-2">Eventos Bitácora</span>
              <span className="text-5xl font-serif italic text-lila-100 leading-none">{orgHistory.length}</span>
            </div>
            
            <div className="space-y-2 border-t border-white/5 pt-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-lila-400 block mb-1">Última actividad</span>
              {orgHistory.length > 0 ? (
                <p className="text-sm text-lila-100 font-medium leading-tight italic font-serif">
                  {orgHistory.sort((a, b) => b.date.localeCompare(a.date))[0].title}
                </p>
              ) : (
                <p className="text-sm text-white/10 italic font-serif">Sin registros este año</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Narrative Section */}
      <div className="bg-white/5 p-12 rounded-[3.5rem] border border-white/10 shadow-md">
        <div className="flex items-center gap-3 mb-10">
          <h3 className="text-3xl font-serif italic text-lila-100">Síntesis para el Consejo</h3>
        </div>
        
        <div className="max-w-4xl">
          <p className="text-lila-300 leading-relaxed font-serif italic text-xl">
            Para la consideración del Consejo de Barrio: En <span className="text-lila-100 font-bold">{organization}</span>, 
            hemos observado una asistencia que promedia las <span className="text-lila-100 font-bold">{avgAttendance}</span> personas. 
            {(organization === 'Sociedad de Socorro' || organization === 'Quórum de Élderes') && latestInterview && (
              <>
                {' '}Respecto a la ministración, el <span className="text-lila-100 font-bold">{Math.round((latestInterview.interviewedCount / latestInterview.totalPairs) * 100)}%</span> de {organization === 'Sociedad de Socorro' ? 'nuestras Hermanas Ministrantes' : 'nuestros Hermanos Ministrantes'} han sido {organization === 'Sociedad de Socorro' ? 'entrevistadas' : 'entrevistados'}.
              </>
            )}
          </p>
          
          <div className="mt-16 pt-10 border-t border-white/5">
            <h4 className="text-[10px] uppercase tracking-widest text-lila-400 font-bold mb-8">Puntos a Tratar en el Consejo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 flex items-start gap-4 focus-within:border-lila-500/50 transition-colors">
                <div className="w-5 h-5 rounded-full border-2 border-white/10 mt-1 flex-shrink-0" />
                <div className="w-full">
                  <textarea
                    value={note1}
                    onChange={(e) => setNote1(e.target.value)}
                    placeholder="Escriba aquí el primer punto para el consejo..."
                    className="w-full bg-transparent text-sm text-lila-100 italic font-serif outline-none resize-none no-print placeholder:text-white/10"
                    rows={3}
                  />
                  <p className="hidden print:block text-sm text-lila-100 italic font-serif">{note1}</p>
                </div>
              </div>
              <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 flex items-start gap-4 focus-within:border-lila-500/50 transition-colors">
                <div className="w-5 h-5 rounded-full border-2 border-white/10 mt-1 flex-shrink-0" />
                <div className="w-full">
                  <textarea
                    value={note2}
                    onChange={(e) => setNote2(e.target.value)}
                    placeholder="Escriba aquí el segundo punto para el consejo..."
                    className="w-full bg-transparent text-sm text-lila-100 italic font-serif outline-none resize-none no-print placeholder:text-white/10"
                    rows={3}
                  />
                  <p className="hidden print:block text-sm text-lila-100 italic font-serif">{note2}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Signature Section for Print */}
      <div className="hidden print:grid grid-cols-2 gap-32 mt-40 px-12">
        <div className="border-t-2 border-lila-900 pt-6 text-center">
          <p className="text-sm font-bold text-lila-900 uppercase tracking-widest">Firma del Secretario</p>
          <p className="text-xs text-lila-400 mt-2 font-serif italic">{organization}</p>
        </div>
        <div className="border-t-2 border-lila-900 pt-6 text-center">
          <p className="text-sm font-bold text-lila-900 uppercase tracking-widest">Visto Bueno</p>
          <p className="text-xs text-lila-400 mt-2 font-serif italic">Presidencia</p>
        </div>
      </div>
    </div>
  );
}
