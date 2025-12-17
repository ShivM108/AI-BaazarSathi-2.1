import React, { useState, useRef, useEffect } from 'react';
import { Clock, Trash2, MoreVertical, RefreshCw, Info, ExternalLink, Plus } from 'lucide-react';
import { AppState, ChatMessage as ChatMessageType, SearchSource } from './types';
import { streamSearchResponse } from './services/geminiService';
import { SUGGESTED_QUERIES } from './constants';
import SearchBar from './components/SearchBar';
import ChatMessage from './components/ChatMessage';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentQuery, setCurrentQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [sources, setSources] = useState<SearchSource[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setAppState(AppState.SEARCHING);
    setCurrentQuery(query);
    setSources([]); // Reset sources for new search

    // Add user message
    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: Date.now()
    };
    
    // Create initial bot message placeholder
    const botMsgId = (Date.now() + 1).toString();
    const botMsg: ChatMessageType = {
      id: botMsgId,
      role: 'model',
      content: '',
      isStreaming: true,
      timestamp: Date.now() + 1
    };

    setMessages(prev => {
        // If we are in IDLE, just start fresh. If in RESULTS, append.
        if (appState === AppState.IDLE) {
            return [userMsg, botMsg];
        } else {
             return [...prev, userMsg, botMsg];
        }
    });
    setAppState(AppState.RESULTS);

    try {
      await streamSearchResponse(
        query,
        (text) => {
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, content: text } : msg
          ));
        },
        (newSources) => {
            // Merge sources if needed, but usually we just want to show relevant sources for the current answer
            // Here we update the specific message with sources
             setMessages(prev => prev.map(msg => 
                msg.id === botMsgId ? { ...msg, sources: newSources } : msg
              ));
        }
      );

      // Finish streaming
       setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, isStreaming: false } : msg
       ));

    } catch (error) {
      console.error("Search failed", error);
      
      let errorMessage = "I encountered an issue while processing your request. Please try again.";
      
      if (error instanceof Error) {
         const msg = error.message.toLowerCase();
         
         if (msg.includes('api key') || msg.includes('403') || msg.includes('permission denied')) {
             errorMessage = "Unable to authenticate. Please ensure a valid API key is configured.";
         } else if (msg.includes('429') || msg.includes('quota') || msg.includes('limit')) {
             errorMessage = "You've hit the usage limit. Please wait a moment before asking another question.";
         } else if (msg.includes('503') || msg.includes('500') || msg.includes('overloaded')) {
             errorMessage = "The AI service is temporarily unavailable. Please try again shortly.";
         } else if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('connection')) {
             errorMessage = "Connection failed. Please check your internet connection and try again.";
         } else if (msg.includes('safety') || msg.includes('blocked')) {
             errorMessage = "I cannot generate a response for this query due to safety guidelines.";
         }
      }

       setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { 
                ...msg, 
                content: errorMessage, 
                isStreaming: false,
                isError: true 
            } : msg
       ));
      setAppState(AppState.ERROR);
    }
  };

  const resetSearch = () => {
    setAppState(AppState.IDLE);
    setMessages([]);
    setCurrentQuery('');
    setSources([]);
  };

  const handleShowAbout = () => {
      alert("BaazarSathi AI\n\nA demonstration of a high-performance search assistant powered by Google Gemini.");
      setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 w-full bg-white z-50 border-b border-gray-100 transition-all duration-300 ${appState === AppState.IDLE ? 'h-16 border-transparent' : 'h-16 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={resetSearch}>
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                    <Logo className="w-5 h-5" />
                </div>
                <h1 className={`font-bold text-xl tracking-tight ${appState !== AppState.IDLE ? 'block' : 'hidden md:block'}`}>
                    Baazar<span>Sathi</span>
                </h1>
            </div>

            {appState !== AppState.IDLE && (
                <div className="flex-1 max-w-2xl mx-4">
                    <SearchBar 
                        onSearch={handleSearch} 
                        isLoading={messages[messages.length - 1]?.isStreaming} 
                        initialValue={currentQuery}
                        variant="top"
                    />
                </div>
            )}

            <div className="flex items-center gap-1 md:gap-2">
               {appState !== AppState.IDLE && (
                 <button 
                    onClick={resetSearch}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"
                    title="Start a new chat"
                 >
                     <Plus size={20} />
                     <span className="hidden md:inline text-sm font-medium">New Chat</span>
                 </button>
               )}
               
               <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" title="History">
                   <Clock size={20} />
               </button>
               
               {/* Three Dot Menu */}
               <div className="relative" ref={menuRef}>
                   <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors ${isMenuOpen ? 'bg-gray-100 text-gray-900' : ''}`}
                        title="More options"
                   >
                       <MoreVertical size={20} />
                   </button>
                   
                   {isMenuOpen && (
                       <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 transform origin-top-right animate-in fade-in zoom-in-95 duration-100">
                           <div className="px-4 py-2 border-b border-gray-50 mb-1">
                               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Options</p>
                           </div>
                           
                           <button 
                               onClick={() => { resetSearch(); setIsMenuOpen(false); }}
                               className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600 flex items-center gap-3 transition-colors"
                           >
                               <RefreshCw size={16} />
                               <span>New Chat</span>
                           </button>

                           <button 
                               onClick={() => { resetSearch(); setIsMenuOpen(false); }}
                               className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-3 transition-colors"
                           >
                               <Trash2 size={16} />
                               <span>Clear History</span>
                           </button>
                           
                           <button 
                               onClick={handleShowAbout}
                               className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600 flex items-center gap-3 transition-colors"
                           >
                               <Info size={16} />
                               <span>About</span>
                           </button>
                           
                           <a 
                               href="https://ai.google.dev" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               onClick={() => setIsMenuOpen(false)}
                               className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600 flex items-center gap-3 transition-colors"
                           >
                               <ExternalLink size={16} />
                               <span>Gemini API Docs</span>
                           </a>
                       </div>
                   )}
               </div>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 scroll-smooth">
        {appState === AppState.IDLE ? (
          <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 -mt-16">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mx-auto mb-6 shadow-sm">
                    <Logo className="w-10 h-10" />
                </div>
                <h2 className="text-4xl font-serif font-medium text-gray-900 mb-4">
                    Where knowledge begins
                </h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    Ask anything. Baazar<span>Sathi</span> searches the web and writes detailed, factual answers with citations.
                </p>
            </div>

            <div className="w-full max-w-2xl mb-12">
                <SearchBar onSearch={handleSearch} />
            </div>

            <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
                {SUGGESTED_QUERIES.map((q) => (
                    <button
                        key={q}
                        onClick={() => handleSearch(q)}
                        className="px-4 py-2 bg-gray-50 hover:bg-white border border-gray-200 hover:border-brand-200 rounded-lg text-sm text-gray-600 transition-colors shadow-sm"
                    >
                        {q}
                    </button>
                ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 pb-24 min-h-full">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {/* Loading Indicator for grounding or initial connection */}
            {appState === AppState.SEARCHING && messages.length === 0 && (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                        <p className="text-gray-500 text-sm animate-pulse">Researching...</p>
                    </div>
                </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;