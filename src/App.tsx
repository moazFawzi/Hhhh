import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  BookOpen, 
  Brain, 
  Sparkles, 
  X, 
  Check, 
  RotateCcw, 
  ChevronRight,
  Trash2,
  Library,
  Clock
} from 'lucide-react';
import { addDays, isBefore, parseISO, format, formatDistanceToNow } from 'date-fns';
import { cn } from './lib/utils';
import { Card, ReviewDifficulty, SRS_INTERVALS } from './types';

// --- Local Storage Helper ---
const STORAGE_KEY = 'aether_lexicon_cards';

const loadCards = (): Card[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

const saveCards = (cards: Card[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
};

export default function App() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [view, setView] = useState<'study' | 'library'>('study');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Form state
  const [newTerm, setNewTerm] = useState('');
  const [newDefinition, setNewDefinition] = useState('');

  useEffect(() => {
    setCards(loadCards());
  }, []);

  useEffect(() => {
    saveCards(cards);
  }, [cards]);

  const dueCards = useMemo(() => {
    const now = new Date();
    return cards.filter(card => isBefore(parseISO(card.nextReviewDate), now));
  }, [cards]);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm || !newDefinition) return;

    const newCard: Card = {
      id: crypto.randomUUID(),
      term: newTerm,
      definition: newDefinition,
      level: 0,
      nextReviewDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setCards([...cards, newCard]);
    setNewTerm('');
    setNewDefinition('');
    setIsAdding(false);
  };

  const handleReview = (difficulty: ReviewDifficulty) => {
    const card = dueCards[currentCardIndex];
    let newLevel = card.level;

    switch (difficulty) {
      case 'again':
        newLevel = 0;
        break;
      case 'hard':
        newLevel = Math.max(0, newLevel - 1);
        break;
      case 'good':
        newLevel = Math.min(SRS_INTERVALS.length - 1, newLevel + 1);
        break;
      case 'easy':
        newLevel = Math.min(SRS_INTERVALS.length - 1, newLevel + 2);
        break;
    }

    const updatedCards = cards.map(c => {
      if (c.id === card.id) {
        return {
          ...c,
          level: newLevel,
          nextReviewDate: addDays(new Date(), SRS_INTERVALS[newLevel]).toISOString(),
        };
      }
      return c;
    });

    setCards(updatedCards);
    setIsFlipped(false);
    
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setIsStudying(false);
      setCurrentCardIndex(0);
    }
  };

  const deleteCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen relative p-6 md:p-12 overflow-hidden">
      <div className="nebula-bg" />
      
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 glass-card flex items-center justify-center text-aether-blue">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-3xl serif font-light tracking-widest text-glow">AETHER LEXICON</h1>
            <p className="text-xs uppercase tracking-[0.3em] opacity-50 font-medium">Spaced Knowledge Archive</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-4"
        >
          <button 
            onClick={() => setView(view === 'study' ? 'library' : 'study')}
            className="glass-button flex items-center gap-2 text-sm font-medium hover:scale-105 active:scale-95"
          >
            {view === 'study' ? <Library size={18} /> : <Brain size={18} />}
            {view === 'study' ? 'Open Grimoire' : 'Enter Nebula'}
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="glass-button flex items-center gap-2 text-sm font-medium hover:scale-105 active:scale-95 bg-aether-blue/20 border-aether-blue/30"
          >
            <Plus size={18} />
            Inscribe New
          </button>
        </motion.div>
      </header>

      <main className="max-w-6xl mx-auto pb-24">
        {!isStudying ? (
          view === 'study' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats / Study Prompt */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-aether-blue/50 to-transparent" />
                
                <div className="mb-8 relative">
                  <div className="absolute inset-0 bg-aether-blue/20 blur-3xl rounded-full" />
                  <Brain size={80} className="text-aether-blue relative z-10 animate-pulse" />
                </div>

                <h2 className="text-4xl serif mb-4 font-light text-glow">The Nebula Awaits</h2>
                <p className="text-white/60 max-w-md mb-10 leading-relaxed">
                  {dueCards.length > 0 
                    ? `You have ${dueCards.length} definitions ready for cosmic reinforcement. Shall we begin?`
                    : "Your archive is currently synchronized. No definitions require review at this moment."}
                </p>

                {dueCards.length > 0 ? (
                  <button 
                    onClick={() => setIsStudying(true)}
                    className="px-12 py-4 rounded-full bg-white text-nebula-deep font-bold tracking-widest hover:bg-aether-blue hover:text-white transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                  >
                    BEGIN RITUAL
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="px-8 py-3 rounded-full bg-aether-blue/20 text-aether-blue border border-aether-blue/30 font-bold tracking-widest hover:bg-aether-blue/30 transition-all"
                  >
                    INSCRIBE NEW KNOWLEDGE
                  </button>
                )}
              </motion.div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center gap-3 mb-6 opacity-70">
                    <Library size={18} />
                    <span className="text-xs uppercase tracking-widest font-bold">Archive Status</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-sm opacity-50">Total Inscriptions</span>
                      <span className="text-2xl font-light serif">{cards.length}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-sm opacity-50">Mastered (Lvl 5)</span>
                      <span className="text-2xl font-light serif text-aether-blue">
                        {cards.filter(c => c.level === 5).length}
                      </span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-4">
                      <div 
                        className="h-full bg-aether-blue transition-all duration-1000" 
                        style={{ width: `${(cards.filter(c => c.level === 5).length / (cards.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center gap-3 mb-4 opacity-70">
                    <Clock size={18} />
                    <span className="text-xs uppercase tracking-widest font-bold">Recent Archive</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
                    {cards.slice(-5).reverse().map(card => (
                      <div key={card.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center group">
                        <span className="text-sm truncate pr-2">{card.term}</span>
                        <button 
                          onClick={() => deleteCard(card.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {cards.length === 0 && <p className="text-xs opacity-30 italic">No inscriptions yet...</p>}
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            /* Library View (The Grimoire) */
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 min-h-[600px]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                <div>
                  <h2 className="text-3xl sm:text-4xl serif font-light text-glow">The Grimoire</h2>
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-40 mt-1">Full Archive of Knowledge</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="h-9 px-4 rounded-xl bg-aether-blue/10 hover:bg-aether-blue/20 border border-aether-blue/30 text-[9px] font-bold tracking-[0.15em] transition-all flex items-center gap-2 hover:shadow-[0_0_15px_rgba(0,212,255,0.2)] whitespace-nowrap"
                  >
                    <Plus size={12} />
                    NEW INSCRIPTION
                  </button>
                  <div className="h-8 w-[1px] bg-white/10 mx-1 hidden md:block" />
                  <div className="text-right">
                    <span className="text-[9px] opacity-40 block mb-0.5 uppercase tracking-widest">Archive Size</span>
                    <span className="text-xs sm:text-sm font-mono text-aether-blue">{cards.length} Items</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map(card => {
                  const isDue = isBefore(parseISO(card.nextReviewDate), new Date());
                  const timeToReview = formatDistanceToNow(parseISO(card.nextReviewDate), { addSuffix: true });
                  
                  return (
                    <div key={card.id} className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => deleteCard(card.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl serif text-white/90 mb-1">{card.term}</h3>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border",
                              isDue ? "bg-aether-pink/20 text-aether-pink border-aether-pink/30" : "bg-white/10 text-white/40 border-white/10"
                            )}>
                              {isDue ? 'Due Now' : 'Scheduled'}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-white/30">
                              Level {card.level}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-white/50 line-clamp-2 mb-4 italic">"{card.definition}"</p>
                      
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-40 font-bold">
                        <Clock size={12} />
                        Next Review: {timeToReview}
                      </div>
                    </div>
                  );
                })}
                {cards.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-20">
                    <Library size={48} className="mb-4" />
                    <p className="serif text-xl">The Grimoire is currently empty.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )
        ) : (
          /* Study Mode */
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <button 
                onClick={() => setIsStudying(false)}
                className="text-white/50 hover:text-white flex items-center gap-2 text-sm transition-colors"
              >
                <RotateCcw size={16} />
                Cease Ritual
              </button>
              <div className="text-xs tracking-widest opacity-50 font-bold">
                {currentCardIndex + 1} / {dueCards.length}
              </div>
            </div>

            <div className="relative h-[450px] perspective-1000 will-change-transform">
              <AnimatePresence mode="wait">
                <motion.div
                  key={dueCards[currentCardIndex].id + (isFlipped ? '-back' : '-front')}
                  initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  onClick={() => !isFlipped && setIsFlipped(true)}
                  className={cn(
                    "w-full h-full glass-card p-12 flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden",
                    isFlipped ? "bg-white/10" : "hover:bg-white/10"
                  )}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-aether-pink/50 via-aether-blue/50 to-aether-pink/50" />
                  
                  {!isFlipped ? (
                    <>
                      <span className="text-xs uppercase tracking-[0.4em] opacity-40 mb-8 font-bold">The Term</span>
                      <h3 className="text-5xl serif leading-tight text-glow">{dueCards[currentCardIndex].term}</h3>
                      <div className="mt-12 flex items-center gap-2 text-white/30 text-sm">
                        <span>Reveal Essence</span>
                        <ChevronRight size={16} />
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-xs uppercase tracking-[0.4em] opacity-40 mb-8 font-bold">The Essence</span>
                      <p className="text-2xl serif leading-relaxed max-w-lg">{dueCards[currentCardIndex].definition}</p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {isFlipped && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-4 gap-4 mt-8"
              >
                {[
                  { 
                    label: 'Again', 
                    type: 'again', 
                    color: 'bg-red-500/20 text-red-400 border-red-500/30',
                    interval: SRS_INTERVALS[0]
                  },
                  { 
                    label: 'Hard', 
                    type: 'hard', 
                    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
                    interval: SRS_INTERVALS[Math.max(0, dueCards[currentCardIndex].level - 1)]
                  },
                  { 
                    label: 'Good', 
                    type: 'good', 
                    color: 'bg-aether-blue/20 text-aether-blue border-aether-blue/30',
                    interval: SRS_INTERVALS[Math.min(SRS_INTERVALS.length - 1, dueCards[currentCardIndex].level + 1)]
                  },
                  { 
                    label: 'Easy', 
                    type: 'easy', 
                    color: 'bg-green-500/20 text-green-400 border-green-500/30',
                    interval: SRS_INTERVALS[Math.min(SRS_INTERVALS.length - 1, dueCards[currentCardIndex].level + 2)]
                  },
                ].map((btn) => (
                  <button
                    key={btn.type}
                    onClick={() => handleReview(btn.type as ReviewDifficulty)}
                    className={cn(
                      "p-4 rounded-2xl border backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-1",
                      btn.color
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest">{btn.label}</span>
                    <span className="text-[10px] opacity-60 font-mono">{btn.interval}d</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Add Card Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-nebula-deep/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-xl p-8 relative z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl serif tracking-widest">NEW INSCRIPTION</h2>
                <button onClick={() => setIsAdding(false)} className="text-white/50 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddCard} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest opacity-50 mb-2 font-bold">Term of Power</label>
                  <input 
                    autoFocus
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    placeholder="e.g. Potential Difference"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-aether-blue transition-colors serif text-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest opacity-50 mb-2 font-bold">The Essence (Definition)</label>
                  <textarea 
                    value={newDefinition}
                    onChange={(e) => setNewDefinition(e.target.value)}
                    placeholder="Describe its nature..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-aether-blue transition-colors serif text-xl resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-aether-blue text-white font-bold tracking-widest hover:bg-aether-blue/80 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  ARCHIVE INSCRIPTION
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
