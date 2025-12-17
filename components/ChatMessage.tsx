import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, AlertCircle } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';
import SourceCard from './SourceCard';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`flex gap-4 md:gap-6 ${isUser ? 'flex-row-reverse' : 'flex-row'} w-full max-w-4xl mx-auto py-6`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-gray-200' : isError ? 'bg-red-100 text-red-600' : 'bg-brand-600 text-white'}`}>
        {isUser ? <User size={18} className="text-gray-600" /> : isError ? <AlertCircle size={18} /> : <Bot size={18} />}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : 'text-left'}`}>
        {isError ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-800 flex items-start gap-3 inline-block text-left">
             <div className="flex-1">
               <h4 className="font-semibold mb-1 text-sm">Unable to complete request</h4>
               <p className="text-sm opacity-90">{message.content}</p>
             </div>
          </div>
        ) : (
          <div className={`prose prose-slate max-w-none dark:prose-invert 
            ${isUser ? 'bg-gray-100 rounded-2xl px-5 py-3 inline-block text-left' : ''}`}>
             {isUser ? (
               <p className="whitespace-pre-wrap text-gray-800 m-0">{message.content}</p>
             ) : (
               <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Style links to look like citations if they adhere to the format, or standard links
                    a: ({node, ...props}) => <a {...props} className="text-brand-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer" />,
                    // Ensure tables are scrollable
                    table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table {...props} className="min-w-full divide-y divide-gray-200 border" /></div>,
                    thead: ({node, ...props}) => <thead {...props} className="bg-gray-50" />,
                    th: ({node, ...props}) => <th {...props} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b" />,
                    td: ({node, ...props}) => <td {...props} className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 border-b" />,
                    // Custom blockquote styling
                    blockquote: ({node, ...props}) => <blockquote {...props} className="border-l-4 border-brand-500 pl-4 italic text-gray-600 my-4" />,
                    // Headers
                    h2: ({node, ...props}) => <h2 {...props} className="text-xl font-bold text-gray-900 mt-6 mb-3" />,
                    h3: ({node, ...props}) => <h3 {...props} className="text-lg font-semibold text-gray-800 mt-4 mb-2" />,
                  }}
               >
                 {message.content}
               </ReactMarkdown>
             )}
          </div>
        )}
        
        {/* Sources Grid for Model Response */}
        {!isUser && !isError && message.sources && message.sources.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
              Sources
            </h4>
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {message.sources.map((source, idx) => (
                <SourceCard key={`${source.uri}-${idx}`} source={source} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;