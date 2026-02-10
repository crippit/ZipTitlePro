
export interface ScriptLine {
  id: string;
  text: string;
  speaker?: string;
  note?: string;
}

export interface SurtitleSettings {
  fontSize: number;
  fontFamily: 'Inter' | 'Serif' | 'Monospace' | 'Bebas Neue';
  textColor: string;
  backgroundColor: string;
  opacity: number;
  lineHeight: number;
  textTransform: 'none' | 'uppercase' | 'capitalize';
  maxWidth: number;
  padding: number;
}

export type AppView = 'setup' | 'controller' | 'projector';

export interface AppState {
  view: AppView;
  script: ScriptLine[];
  currentIndex: number;
  isListening: boolean;
  lastRecognized: string;
}
