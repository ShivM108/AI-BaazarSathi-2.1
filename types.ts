export interface SearchSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  sources?: SearchSource[];
  isStreaming?: boolean;
  isError?: boolean;
  timestamp: number;
}

export enum AppState {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}