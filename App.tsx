import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Play, 
  CheckCircle, 
  BarChart2, 
  User, 
  Map, 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle, 
  Volume2,
  BookOpen,
  GraduationCap,
  Sparkles,
  Trophy,
  Star
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

import { ViewState, ReflectionAnswers, UserProgress, RouteData, Job, Experiment } from './types';
import { ROUTES, REFLECTION_QUESTIONS, getIcon } from './constants';
import { Button } from './components/Button';
import { speakText } from './services/ttsService';
import { generateMentorSummary, generateStudyAdvice } from './services/geminiService';

const INITIAL_REFLECTION: ReflectionAnswers = {
  whoAmI: [],
  likes: [],
  goodAt: [],
  childhood: [],
  energy: [],
  othersSay: [],
  customAnswers: {}
};

const INITIAL_PROGRESS: UserProgress = {
  jobRatings: {},
  routeScores: {},
  likedJobs: [],
  dislikedJobs: [],
  experiments: []
};

// --- Helper Components ---

// Component to parse **bold** text and lists nicely
const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-extrabold text-inherit opacity-100">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const FormattedText: React.FC<{ text: string, className?: string }> = ({ text, className = "" }) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  return (
    <div className={`space-y-2 ${className}`}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2"></div>;
        
        // Check for Bold Headers (often starting with **)
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
           return <h4 key={i} className="font-bold text-lg mt-4 mb-1 opacity-90">{trimmed.replace(/\*\*/g, '')}</h4>;
        }

        // Bullet points
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\./.test(trimmed)) {
           return (
             <div key={i} className="flex items-start gap-2 ml-1">
               <div className="w-1.5 h-1.5 rounded-full bg-current mt-2.5 shrink-0 opacity-60"></div>
               <p className="leading-relaxed opacity-90">{parseBold(trimmed.replace(/^[\*\-]\s|^\d+\.\s/, ''))}</p>
             </div>
           );
        }

        return <p key={i} className="leading-relaxed opacity-90">{parseBold(trimmed)}</p>;
      })}
    </div>
  );
};

// --- Extracted Components to fix focus issues ---

interface ReflectionViewProps {
  reflection: ReflectionAnswers;
  onToggleOption: (field: keyof ReflectionAnswers, value: string) => void;
  onUpdateCustom: (questionId: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const ReflectionView: React.FC<ReflectionViewProps> = ({ 
  reflection, 
  onToggleOption, 
  onUpdateCustom, 
  onNext, 
  onBack 
}) => {
  const [step, setStep] = useState(0);
  const question = REFLECTION_QUESTIONS[step];
  
  // Helper to get array of selected options for current step
  const selectedOptions = reflection[question.id as keyof ReflectionAnswers] as string[] || [];
  const customText = reflection.customAnswers[question.id] || "";

  const handleNext = () => {
    if (step < REFLECTION_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full p-8 rounded-3xl shadow-lg relative">
        <div className="absolute top-4 right-4 text-gray-400 font-bold">
          Stap {step + 1} / {REFLECTION_QUESTIONS.length}
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
           <User className="text-indigo-500" /> {question.question}
        </h2>

        <div className="mb-2 text-sm text-gray-500 font-medium uppercase tracking-wide">Kies wat bij jou past:</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {question.options.map((opt, idx) => {
            const isSelected = selectedOptions.includes(opt);
            return (
              <button
                key={idx}
                onClick={() => onToggleOption(question.id as keyof ReflectionAnswers, opt)}
                className={`p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold shadow-md' 
                    : 'border-gray-200 hover:border-indigo-300 text-gray-600'
                }`}
              >
                {opt}
                {isSelected && <CheckCircle size={20} className="text-indigo-500"/>}
              </button>
            );
          })}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Of typ hier je eigen antwoord (max 3 zinnen):</label>
          <textarea
            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-indigo-500 outline-none text-gray-700"
            rows={5}
            placeholder={question.placeholder}
            value={customText}
            onChange={(e) => onUpdateCustom(question.id, e.target.value)}
          />
        </div>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => step > 0 ? setStep(step - 1) : onBack()}
          >
            Terug
          </Button>
          <Button onClick={handleNext}>
            {step === REFLECTION_QUESTIONS.length - 1 ? "Naar mijn routekaart" : "Volgende"}
          </Button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [view, setView] = useState<ViewState>('intro');
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  
  // User Data State
  const [reflection, setReflection] = useState<ReflectionAnswers>(INITIAL_REFLECTION);
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  
  // AI Results State
  const [mentorAdvice, setMentorAdvice] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [studyAdvice, setStudyAdvice] = useState<string>("");
  const [loadingStudy, setLoadingStudy] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('talentenreis_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.reflection) setReflection(parsed.reflection);
        if (parsed.progress) setProgress(parsed.progress);
      }
    } catch (e) {
      console.error("Failed to load data", e);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem('talentenreis_data', JSON.stringify({ reflection, progress }));
    } catch (e) {
      console.error("Failed to save data", e);
    }
  }, [reflection, progress]);

  // --- Helpers ---

  const toggleReflectionOption = (field: keyof ReflectionAnswers, value: string) => {
    setReflection(prev => {
      const currentList = prev[field] as string[];
      const newList = currentList.includes(value) 
        ? currentList.filter(item => item !== value)
        : [...currentList, value];
      return { ...prev, [field]: newList };
    });
  };

  const updateCustomAnswer = (questionId: string, value: string) => {
    setReflection(prev => ({
      ...prev,
      customAnswers: {
        ...prev.customAnswers,
        [questionId]: value
      }
    }));
  };

  const handleJobRating = (jobId: string, rating: 'fun' | 'not_fun' | 'unknown') => {
    setProgress(prev => {
      const newRatings = { ...prev.jobRatings, [jobId]: rating };
      // Update lists
      let newLiked = prev.likedJobs.filter(id => id !== jobId);
      let newDisliked = prev.dislikedJobs.filter(id => id !== jobId);
      
      if (rating === 'fun') newLiked.push(jobId);
      if (rating === 'not_fun') newDisliked.push(jobId);

      return {
        ...prev,
        jobRatings: newRatings,
        likedJobs: newLiked,
        dislikedJobs: newDisliked
      };
    });
  };

  const addExperiment = (exp: Experiment) => {
    setProgress(prev => ({
      ...prev,
      experiments: [...prev.experiments, exp]
    }));
  };

  // --- Views ---

  const IntroView = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-6">Mijn Talentenreis 🚀</h1>
        <p className="text-xl text-gray-700 mb-8 leading-relaxed">
          Welkom! We gaan samen ontdekken waar jij goed in bent, wat je leuk vindt en welke beroepen bij jou passen.
          Het is geen toets, maar een reis!
        </p>
        <div className="space-y-4">
          <Button size="lg" onClick={() => setView('reflection')}>
            Start mijn reis <ChevronRight className="inline ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  const DashboardView = () => {
    // Determine suggested routes based on very simple keyword matching
    const suggestedRouteIds = ROUTES.filter(route => {
      // Collect all words from reflection
      const allUserWords = [
        ...reflection.likes,
        ...reflection.goodAt,
        ...reflection.childhood,
        ...reflection.energy,
        ...reflection.whoAmI,
        ...Object.values(reflection.customAnswers)
      ].join(' ').toLowerCase();
      
      return route.tags.some(tag => allUserWords.includes(tag.toLowerCase()));
    }).map(r => r.id);

    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-24">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
             <Button variant="outline" onClick={() => setView('reflection')} className="shrink-0" title="Terug naar vragen">
                <ArrowLeft size={20} />
             </Button>
             <div>
                <h1 className="text-3xl font-bold text-gray-800">Kies jouw Route 🌍</h1>
                <p className="text-gray-600">Klik op een tegel om de wereld te ontdekken.</p>
             </div>
          </div>
          <Button variant="secondary" onClick={() => setView('summary')}>
            Mijn Paspoort
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ROUTES.map(route => {
            const isSuggested = suggestedRouteIds.includes(route.id);
            // Calculate score based on actual liked jobs in this route
            const likedCount = route.jobs.filter(j => progress.likedJobs.includes(j.id)).length;
            const totalCount = route.jobs.length;

            return (
              <div 
                key={route.id}
                onClick={() => { setActiveRouteId(route.id); setView('route_detail'); }}
                className="group relative bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-300 transform hover:-translate-y-1"
                style={{ backgroundColor: route.bgColor }}
              >
                {isSuggested && (
                  <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full shadow-md text-sm animate-bounce">
                    Tip voor jou!
                  </div>
                )}
                
                {/* Score badge based on job count */}
                <div className="absolute top-4 right-4 bg-white/90 px-3 py-1.5 rounded-xl font-bold text-gray-700 shadow-sm flex items-center gap-2">
                   <Trophy size={16} className={likedCount > 0 ? "text-yellow-500" : "text-gray-300"} />
                   {likedCount}/{totalCount}
                </div>
                
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-${route.color}-600 bg-white/50`}>
                  {getIcon(route.iconType, 32)}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{route.title}</h3>
                <p className="text-gray-700 text-sm mb-4">{route.description}</p>
                
                <span className="text-blue-700 font-semibold group-hover:underline flex items-center text-sm">
                  Start expeditie <ChevronRight size={16} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const RouteDetailView = () => {
    const route = ROUTES.find(r => r.id === activeRouteId);
    if (!route) return null;

    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    // Group jobs by zone for the "Map" feel
    const zones = Array.from(new Set(route.jobs.map(j => j.zone)));
    
    // Calculate progress for this route
    const likedCount = route.jobs.filter(j => progress.likedJobs.includes(j.id)).length;
    const totalCount = route.jobs.length;
    const progressPercentage = (likedCount / totalCount) * 100;

    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className={`bg-${route.color}-100 p-6 border-b-4 border-${route.color}-200 sticky top-0 z-10 shadow-sm`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button onClick={() => setView('dashboard')} className="flex items-center text-gray-700 hover:text-black font-semibold bg-white/50 px-3 py-1 rounded-lg">
              <ArrowLeft className="mr-2" /> Terug
            </button>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {getIcon(route.iconType)} {route.metafore}
            </h2>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6 pb-32">
          {/* Zones Layout */}
          <div className="space-y-12">
            {zones.map(zone => (
              <div key={zone} className="relative pl-8 border-l-4 border-dashed border-gray-300">
                <div className="absolute -left-3.5 top-0 w-6 h-6 bg-gray-300 rounded-full border-4 border-white"></div>
                <h3 className="text-xl font-bold text-gray-500 uppercase tracking-wide mb-4">{zone}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {route.jobs.filter(j => j.zone === zone).map(job => {
                    const rating = progress.jobRatings[job.id];
                    let borderColor = "border-gray-200";
                    if (rating === 'fun') borderColor = "border-green-400 bg-green-50";
                    if (rating === 'not_fun') borderColor = "border-red-300 bg-red-50";

                    return (
                      <div 
                        key={job.id} 
                        onClick={() => setSelectedJob(job)}
                        className={`p-4 rounded-xl border-2 ${borderColor} cursor-pointer hover:shadow-lg transition-all flex justify-between items-center bg-white`}
                      >
                        <span className="font-bold text-lg">{job.title}</span>
                        {rating === 'fun' && <ThumbsUp size={18} className="text-green-600" />}
                        {rating === 'not_fun' && <ThumbsDown size={18} className="text-red-500" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Automatic Scoring Display */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Trophy className="text-yellow-500"/> Jouw score in {route.title}</h3>
            
            <div className="w-full max-w-md h-6 bg-gray-200 rounded-full mt-2 mb-4 relative overflow-hidden">
               <div 
                 className={`h-full bg-${route.color}-500 transition-all duration-1000 ease-out`}
                 style={{ width: `${progressPercentage}%` }}
               ></div>
            </div>
            
            <p className="text-xl font-bold text-gray-800">
              {likedCount} <span className="text-gray-400 text-sm">van de</span> {totalCount} <span className="text-base font-normal text-gray-600">beroepen vind je leuk!</span>
            </p>
            
            <p className="text-gray-500 text-sm mt-2">
              Dit telt mee voor je totale talentenprofiel.
            </p>
          </div>
        </div>

        {/* Job Modal / Detail Overlay */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h3>
                <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-xl mb-6 relative">
                 <button 
                  onClick={() => speakText(selectedJob.description)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-blue-100 text-blue-600"
                  aria-label="Lees voor"
                >
                   <Volume2 size={20} />
                </button>
                <p className="text-lg text-gray-800 leading-relaxed pr-8">{selectedJob.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => { handleJobRating(selectedJob.id, 'fun'); setSelectedJob(null); }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-green-100 text-green-800 hover:bg-green-200 font-bold"
                >
                  <ThumbsUp /> Leuk
                </button>
                <button 
                  onClick={() => { handleJobRating(selectedJob.id, 'unknown'); setSelectedJob(null); }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 font-bold"
                >
                  <HelpCircle /> Weet niet
                </button>
                <button 
                  onClick={() => { handleJobRating(selectedJob.id, 'not_fun'); setSelectedJob(null); }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-red-100 text-red-800 hover:bg-red-200 font-bold"
                >
                  <ThumbsDown /> Niet leuk
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SummaryView = () => {
    // Prepare data for charts based on LIKED JOBS count instead of manual score
    const chartData = ROUTES.map(r => {
       const count = r.jobs.filter(j => progress.likedJobs.includes(j.id)).length;
       return {
         name: r.title.split(' ')[0], // Short name
         score: count,
         fill: r.color
       };
    });

    // Find the max value to set graph scale appropriately (default to 8 as usually max jobs)
    const maxScore = Math.max(8, ...chartData.map(d => d.score));

    const getRecommendation = async () => {
       setLoadingAdvice(true);
       const text = await generateMentorSummary(reflection, progress);
       setMentorAdvice(text);
       setLoadingAdvice(false);
    };

    const getStudyAdviceText = async () => {
      setLoadingStudy(true);
      const text = await generateStudyAdvice(reflection, progress);
      setStudyAdvice(text);
      setLoadingStudy(false);
    };

    const formatAnswer = (list: string[], custom: string) => {
        const all = [...list];
        if (custom) all.push(custom);
        return all.length > 0 ? all.join(", ") : "Nog niet ingevuld";
    };

    // Helper to split the advice
    const [topAdvice, detailedAdvice] = studyAdvice.includes("===SPLIT===") 
        ? studyAdvice.split("===SPLIT===") 
        : ["", studyAdvice];

    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
          <Button variant="outline" onClick={() => setView('dashboard')}>
             <ArrowLeft className="mr-2" /> Terug
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Mijn Talenten Paspoort 🛂</h1>
        </header>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-3xl shadow-md">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><User /> Wie ben ik?</h2>
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-xl">
                <span className="text-xs font-bold text-blue-500 uppercase">Ik ben</span>
                <p className="font-medium">{formatAnswer(reflection.whoAmI, reflection.customAnswers['whoAmI'])}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl">
                <span className="text-xs font-bold text-purple-500 uppercase">Ik ben goed in</span>
                <p className="font-medium">{formatAnswer(reflection.goodAt, reflection.customAnswers['goodAt'])}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-xl">
                <span className="text-xs font-bold text-yellow-600 uppercase">Energie van</span>
                <p className="font-medium">{formatAnswer(reflection.energy, reflection.customAnswers['energy'])}</p>
              </div>
            </div>
          </div>

          {/* Chart Card */}
          <div className="bg-white p-6 rounded-3xl shadow-md flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BarChart2 /> Mijn Routes Scores</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} />
                  <YAxis domain={[0, maxScore]} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => {
                         // Map Tailwind colors to Hex approximates for the chart bars
                         const colors: Record<string, string> = {
                             rose: '#e11d48',
                             blue: '#2563eb',
                             purple: '#9333ea',
                             yellow: '#eab308',
                             green: '#16a34a',
                             orange: '#ea580c'
                         };
                         // Try to find color in route data by matching name roughly, or default
                         const colorKey = ROUTES.find(r => r.title.startsWith(entry.name))?.color || 'blue';
                         return <Cell key={`cell-${index}`} fill={colors[colorKey] || '#4f46e5'} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 mt-2 text-center">Aantal leuke beroepen per route</p>
            </div>
          </div>

          {/* Favorites List */}
          <div className="bg-white p-6 rounded-3xl shadow-md md:col-span-2">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ThumbsUp className="text-green-500"/> Beroepen die ik leuk vind</h2>
            {progress.likedJobs.length === 0 ? (
              <p className="text-gray-400 italic">Je hebt nog geen beroepen geliket.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {progress.likedJobs.map(jobId => {
                  // Find job details (inefficient search but fine for small dataset)
                  let jobTitle = "Onbekend";
                  ROUTES.forEach(r => r.jobs.forEach(j => { if(j.id === jobId) jobTitle = j.title }));
                  return (
                    <span key={jobId} className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold text-sm">
                      {jobTitle}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Mentor / AI Advice: PART 1 - Profile */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-3xl shadow-lg md:col-span-2 text-white">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Sparkles /> Jouw Talenten Coach</h2>
            {mentorAdvice ? (
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10">
                 <FormattedText text={mentorAdvice} className="text-white" />
                 
                 {!studyAdvice && !loadingStudy && (
                   <div className="mt-8 pt-6 border-t border-white/20 text-center">
                      <p className="mb-3 font-medium opacity-90">Wil je weten welke opleidingen hierbij passen?</p>
                      <Button 
                        onClick={getStudyAdviceText} 
                        className="bg-emerald-400 text-emerald-950 hover:bg-emerald-300 font-bold border-0"
                      >
                         <GraduationCap className="inline mr-2" size={20} /> Bekijk Studie & Toekomst
                      </Button>
                   </div>
                 )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="mb-4">Benieuwd wat jouw antwoorden zeggen over wie jij bent?</p>
                <Button 
                    onClick={getRecommendation} 
                    disabled={loadingAdvice}
                    className="bg-white text-indigo-600 hover:bg-gray-100"
                >
                  {loadingAdvice ? "Even nadenken..." : "Maak mijn Talentenprofiel"}
                </Button>
              </div>
            )}
            
            {/* Mentor / AI Advice: PART 2 - Study Advice */}
            {loadingStudy && (
               <div className="mt-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm text-center animate-pulse border border-white/10">
                 <p>Coach zoekt passende opleidingen...</p>
               </div>
            )}
            
            {studyAdvice && (
              <div className="mt-6 bg-white text-gray-800 p-6 rounded-xl shadow-lg animate-fade-in">
                 <h3 className="text-2xl font-bold text-emerald-600 mb-4 flex items-center gap-2">
                    <GraduationCap /> Jouw Toekomst & Studie
                 </h3>
                 
                 {topAdvice && detailedAdvice ? (
                     <>
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-xl">
                            <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-lg">
                                <Star className="fill-amber-400 text-amber-500" /> Top 3 Hoofdadviezen
                            </h4>
                            <div className="whitespace-pre-wrap text-amber-900 leading-relaxed font-medium">
                                <FormattedText text={topAdvice.replace("DEEL 1: TOP 3 HOOFDADVIEZEN", "").trim()} />
                            </div>
                        </div>
                        <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
                             <FormattedText text={detailedAdvice.replace("DEEL 2: VERDIEPING", "").trim()} />
                        </div>
                     </>
                 ) : (
                    <FormattedText text={studyAdvice} />
                 )}
              </div>
            )}
          </div>
          
           {/* Experiments Section CTA */}
           <div className="bg-white p-6 rounded-3xl shadow-md md:col-span-2 flex justify-between items-center">
             <div>
                <h2 className="text-xl font-bold flex items-center gap-2"><BookOpen className="text-orange-500" /> Experimenten</h2>
                <p className="text-gray-500">Ga op onderzoek uit in de echte wereld!</p>
             </div>
             <Button variant="secondary" onClick={() => setView('experiments')}>Bekijk Opdrachten</Button>
           </div>

        </div>
      </div>
    );
  };

  const ExperimentsView = () => {
    const [newExperiment, setNewExperiment] = useState("");

    const handleAdd = () => {
      if (!newExperiment.trim()) return;
      const exp: Experiment = {
        id: Date.now().toString(),
        title: newExperiment,
        status: 'planned'
      };
      addExperiment(exp);
      setNewExperiment("");
    };

    const toggleStatus = (id: string) => {
      setProgress(prev => ({
        ...prev,
        experiments: prev.experiments.map(e => 
          e.id === id ? { ...e, status: e.status === 'planned' ? 'completed' : 'planned' } : e
        )
      }));
    };

    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
          <Button variant="outline" onClick={() => setView('summary')}>
             <ArrowLeft className="mr-2" /> Terug
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Mijn Experimenten 🧪</h1>
        </header>
        
        <div className="max-w-4xl mx-auto">
             <div className="bg-white p-6 rounded-3xl shadow-md mb-8">
                <h2 className="text-xl font-bold mb-4">Nieuw Experiment</h2>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={newExperiment}
                        onChange={(e) => setNewExperiment(e.target.value)}
                        placeholder="Bijv. Een dag meelopen met een bakker..."
                        className="flex-1 border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-blue-500"
                    />
                    <Button onClick={handleAdd}>Toevoegen</Button>
                </div>
            </div>

            <div className="space-y-4">
                {progress.experiments.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">Nog geen experimenten gepland.</p>
                        <p className="text-sm text-gray-400 mt-1">Bedenk iets leuks om te doen in de echte wereld!</p>
                    </div>
                )}
                {progress.experiments.map(exp => (
                    <div key={exp.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${exp.status === 'completed' ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
                            <div>
                                <h3 className={`font-bold text-lg ${exp.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                    {exp.title}
                                </h3>
                                <span className="text-xs text-gray-500">
                                    {exp.status === 'completed' ? 'Voltooid' : 'Nog te doen'}
                                </span>
                            </div>
                        </div>
                        <Button variant={exp.status === 'completed' ? 'outline' : 'primary'} size="sm" onClick={() => toggleStatus(exp.id)}>
                             {exp.status === 'completed' ? 'Heropenen' : 'Afronden'}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  };

  // --- Main Router Switch ---
  return (
    <div className="font-sans text-gray-900">
      {view === 'intro' && <IntroView />}
      {view === 'reflection' && (
        <ReflectionView 
          reflection={reflection} 
          onToggleOption={toggleReflectionOption}
          onUpdateCustom={updateCustomAnswer}
          onNext={() => setView('dashboard')}
          onBack={() => setView('intro')}
        />
      )}
      {view === 'dashboard' && <DashboardView />}
      {view === 'route_detail' && <RouteDetailView />}
      {view === 'summary' && <SummaryView />}
      {view === 'experiments' && <ExperimentsView />}
      
      {/* Persistent Nav/Reset for Demo Purposes */}
      {view !== 'intro' && (
        <div className="fixed bottom-4 left-4 z-50">
          <button 
             onClick={() => {
                if(window.confirm("Wil je echt opnieuw beginnen? Alles wordt gewist.")) {
                    setReflection(INITIAL_REFLECTION);
                    setProgress(INITIAL_PROGRESS);
                    setView('intro');
                    localStorage.removeItem('talentenreis_data');
                }
             }}
             className="bg-gray-800 text-white text-xs px-3 py-1 rounded opacity-50 hover:opacity-100 transition-opacity"
          >
            Reset App
          </button>
        </div>
      )}
    </div>
  );
}

export default App;