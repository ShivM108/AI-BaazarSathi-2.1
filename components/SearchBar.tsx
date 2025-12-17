import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  initialValue?: string;
  variant?: 'centered' | 'top';
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading = false, initialValue = '', variant = 'centered' }) => {
  const [query, setQuery] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (variant === 'centered' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [variant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const isCentered = variant === 'centered';

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`relative w-full transition-all duration-300 ${isCentered ? 'max-w-2xl mx-auto' : 'max-w-3xl'}`}
    >
      <div className={`
        relative flex items-center bg-white border transition-all duration-300
        ${isCentered 
          ? 'h-14 rounded-full shadow-lg hover:shadow-xl border-gray-200' 
          : 'h-12 rounded-xl shadow-sm border-gray-300 bg-gray-50 focus-within:bg-white focus-within:shadow-md focus-within:border-brand-300'
        }
      `}>
        <div className="pl-4 text-gray-400">
          <Search size={isCentered ? 24 : 20} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything..."
          className="flex-1 bg-transparent border-none outline-none px-4 text-gray-900 placeholder-gray-400 font-medium"
          disabled={isLoading}
        />

        <div className="pr-2">
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className={`
              flex items-center justify-center transition-all duration-200
              ${isCentered 
                ? 'w-10 h-10 rounded-full bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:hover:bg-brand-600' 
                : 'w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30'
              }
            `}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;