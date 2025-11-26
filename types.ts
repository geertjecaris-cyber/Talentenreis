export type ViewState = 
  | 'intro'
  | 'reflection'
  | 'dashboard'
  | 'route_detail'
  | 'experiments'
  | 'summary'
  | 'mentor';

export interface ReflectionAnswers {
  whoAmI: string;
  likes: string[];
  goodAt: string;
  childhood: string;
  energy: string;
  othersSay: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  zone: string; // e.g., "Ziekenhuisheuvel"
}

export interface RouteData {
  id: string;
  title: string;
  iconType: 'heart' | 'gear' | 'brush' | 'money' | 'leaf' | 'speech';
  color: string; // Tailwind class prefix e.g. "red"
  bgColor: string; // Hex for custom styling
  description: string;
  metafore: string; // e.g., "Zorgstad"
  jobs: Job[];
  tags: string[]; // For matching with reflection
}

export interface UserProgress {
  jobRatings: Record<string, 'fun' | 'not_fun' | 'unknown'>; // jobId -> rating
  routeScores: Record<string, number>; // routeId -> 1-4
  likedJobs: string[];
  dislikedJobs: string[];
  experiments: Experiment[];
}

export interface Experiment {
  id: string;
  title: string;
  status: 'planned' | 'completed';
  reflection?: string;
}
