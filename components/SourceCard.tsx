import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { SearchSource } from '../types';

interface SourceCardProps {
  source: SearchSource;
  index: number;
}

const SourceCard: React.FC<SourceCardProps> = ({ source, index }) => {
  // Extract domain for display
  let domain = '';
  try {
    domain = new URL(source.uri).hostname.replace('www.', '');
  } catch (e) {
    domain = 'Web';
  }

  return (
    <a 
      href={source.uri} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex-shrink-0 w-60 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer group flex flex-col gap-2"
    >
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-600">
           {index + 1}
        </div>
        <span className="truncate max-w-[120px]">{domain}</span>
      </div>
      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight group-hover:text-brand-600">
        {source.title}
      </h3>
    </a>
  );
};

export default SourceCard;