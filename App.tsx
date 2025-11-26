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
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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

  const handleRouteScore = (routeId: string, score: number) => {
    setProgress(prev => ({
      ...prev,
      routeScores: { ...prev.routeScores, [routeId]: score }
    }));
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
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Kies jouw Route 🌍</h1>
            <p className="text-gray-600">Klik op een tegel om de wereld te ontdekken.</p>
          </div>
          <Button variant="secondary" onClick={() => setView('summary')}>
            Mijn Paspoort
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ROUTES.map(route => {
            const isSuggested = suggestedRouteIds.includes(route.id);
            const score = progress.routeScores[route.id];

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
                {score && (
                   <div className="absolute top-4 right-4 bg-white/80 px-2 py-1 rounded-lg font-bold text-gray-700">
                     Score: {score}/4
                   </div>
                )}
                
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

    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className={`bg-${route.color}-100 p-6 border-b-4 border-${route.color}-200 sticky top-0 z-10`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button onClick={() => setView('dashboard')} className="flex items-center text-gray-700 hover:text-black font-semibold">
              <ArrowLeft className="mr-2" /> Terug naar kaart
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
                        className={`p-4 rounded-xl border-2 ${borderColor} cursor-pointer hover:shadow-lg transition-all flex justify-between items-center`}
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

          {/* Rating Section for the whole route */}
          <div className="mt-16 bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-bold mb-4">Wat vind je van {route.title}?</h3>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4].map(score => (
                <button
                  key={score}
                  onClick={() => handleRouteScore(route.id, score)}
                  className={`w-12 h-12 rounded-full font-bold text-xl transition-all ${
                    progress.routeScores[route.id] === score 
                      ? 'bg-blue-600 text-white transform scale-110' 
                      : 'bg-white border-2 border-gray-300 text-gray-500 hover:border-blue-400'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="text-center text-sm text-gray-500 mt-2 flex justify-between px-4 max-w-xs mx-auto">
              <span>Niet leuk</span>
              <span>Super!</span>
            </div>
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
    // Prepare data for charts
    const chartData = ROUTES.map(r => ({
      name: r.title.split(' ')[0], // Short name
      score: progress.routeScores[r.id] || 0,
      fill: r.color
    }));

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
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BarChart2 /> Mijn Routes</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} />
                  <YAxis domain={[0, 4]} ticks={[1,2,3,4]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                 <p className="leading-relaxed whitespace-pre-wrap mb-4">{mentorAdvice}</p>
                 {!studyAdvice && !loadingStudy && (
                   <div className="mt-6 pt-4 border-t border-white/20 text-center">
                      <p className="mb-3 font-medium">Wil je weten welke opleidingen hierbij passen?</p>
                      <Button 
                        onClick={getStudyAdviceText} 
                        className="bg-emerald-400 text-emerald-950 hover:bg-emerald-300 font-bold"
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
               <div className="mt-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm text-center animate-pulse">
                 <p>Coach zoekt passende opleidingen...</p>
               </div>
            )}
            
            {studyAdvice && (
              <div className="mt-6 bg-white text-gray-800 p-6 rounded-xl shadow-lg animate-fade-in">
                 <h3 className="text-2xl font-bold text-emerald-600 mb-4 flex items-center gap-2">
                    <GraduationCap /> Jouw Toekomst & Studie
                 </h3>
                 <p className="leading-relaxed whitespace-pre-wrap">{studyAdvice}</p>
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
    // Hardcoded simple experiments
    const tasks = [
      "Interview iemand met een beroep dat je leuk lijkt.",
      "Maak een tekening of poster over jouw favoriete route.",
      "Kijk een video op YouTube over een beroep.",
      "Help een middag mee (thuis, op school of bij de buren)."
    ];

    const toggleTask = (taskTitle: string) => {
       // Simple toggle logic for demo
       const exists = progress.experiments.find(e => e.title === taskTitle);
       if (exists) {
         // remove
         setProgress(prev => ({...prev, experiments: prev.experiments.filter(e => e.title !== taskTitle)}));
       } else {
         addExperiment({ id: Date.now().toString(), title: taskTitle, status: 'planned' });
       }
    };

    return (
       <div className="min-h-screen bg-orange-50 p-4 md:p-8">
         <header className="max-w-2xl mx-auto mb-8 flex items-center">
            <Button variant="outline" onClick={() => setView('summary')} className="mr-4"><ArrowLeft/></Button>
            <h1 className="text-3xl font-bold text-orange-800">Experimenteren 🧪</h1>
         </header>

         <div className="max-w-2xl mx-auto bg-white p-6 rounded-3xl shadow-lg">
           <p className="mb-6 text-gray-700">Kies een opdracht om uit te voeren. Zo leer je of het echt bij je past!</p>
           
           <div className="space-y-4">
             {tasks.map((task, idx) => {
               const isPlanned = progress.experiments.some(e => e.title === task);
               return (
                 <div key={idx} className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${isPlanned ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                   <span className={`font-medium ${isPlanned ? 'text-orange-900' : 'text-gray-600'}`}>{task}</span>
                   <Button 
                      size="sm" 
                      variant={isPlanned ? 'primary' : 'outline'}
                      onClick={() => toggleTask(task)}
                   >
                     {isPlanned ? <CheckCircle size={16} /> : "Kies"}
                   </Button>
                 </div>
               );
             })}
           </div>

           <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="font-bold mb-2">Mijn Reflectie</h3>
              <textarea 
                className="w-full border-2 border-gray-200 rounded-xl p-3" 
                rows={3} 
                placeholder="Wat heb je gedaan en hoe ging het?"
              ></textarea>
              <Button className="mt-2 w-full">Opslaan</Button>
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