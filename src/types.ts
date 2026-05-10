export type Organization = 'Sociedad de Socorro' | 'Quórum de Élderes' | 'Primaria' | 'Mujeres Jóvenes' | 'Escuela Dominical';

export interface AttendanceRecord {
  id: string;
  date: string;
  organization: Organization;
  count: number;
}

export interface AgendaTopic {
  id: string;
  topic: string;
  completed: boolean;
}

export interface Agenda {
  id: string;
  date: string;
  organization: Organization;
  topics: AgendaTopic[];
  decisions: string[];
}

export interface MinisteringInterview {
  id: string;
  month: number; // 0-11
  year: number;
  organization: 'Sociedad de Socorro' | 'Quórum de Élderes';
  interviewedCount: number;
  totalPairs: number;
  notes?: string;
}

export interface WardHistoryActivity {
  id: string;
  date: string;
  title: string;
  description: string;
  attendance: number;
  organization?: Organization;
  imageUrl?: string;
  notes?: string;
}

export interface AppData {
  attendance: AttendanceRecord[];
  agendas: Agenda[];
  interviews: MinisteringInterview[];
  history: WardHistoryActivity[];
}
