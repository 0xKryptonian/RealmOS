import { LoaderCircle, Bot, User } from 'lucide-react';
import { EmptyChat } from '@/components/empty-chat';
import { ChatMessage } from '@/shared/types';
import { ReactNode } from 'react';

type ChatProps = {
  isLoading: boolean;
  chatHistory: ChatMessage[];
};

function formatMessage(content: string): ReactNode {
  // Split by numbered lists
  const parts = content.split(/(\d+\.\s)/);
  const formatted: ReactNode[] = [];
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (/^\d+\.\s$/.test(part) && i + 1 < parts.length) {
      // This is a number, combine with next part
      formatted.push(
        <div key={i} className="ml-4 mb-2">
          <span className="font-semibold text-[#98ee2c]">{part}</span>
          {parts[i + 1]}
        </div>
      );
      i++; // Skip next part as we've already processed it
    } else if (part.includes('**')) {
      // Handle bold text
      const boldParts = part.split('**');
      formatted.push(
        <span key={i}>
          {boldParts.map((p, idx) => 
            idx % 2 === 1 ? <strong key={idx} className="font-bold text-white">{p}</strong> : p
          )}
        </span>
      );
    } else if (part.trim()) {
      formatted.push(<span key={i}>{part}</span>);
    }
  }
  
  return formatted.length > 0 ? formatted : content;
}

export function Chat({ chatHistory, isLoading }: ChatProps) {
  return (
    <div className="bg-zinc-800 grow rounded-lg flex flex-col gap-4 p-4 overflow-y-auto">
      {chatHistory.map((message, idx) => (
        <div key={idx} className="flex gap-3 items-start">
          {message.type === 'human' ? (
            <>
              <div className="flex-1" />
              <div className="bg-[#98ee2c]/20 border border-[#98ee2c]/30 max-w-[80%] px-4 py-3 rounded-lg">
                <p className="text-white whitespace-pre-wrap break-words">{message.content}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#98ee2c]/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-[#98ee2c]" />
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div className="bg-zinc-700/50 border border-zinc-600 max-w-[80%] px-4 py-3 rounded-lg">
                <div className="text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
                  {typeof message.content === 'string' && message.content.includes('\n') 
                    ? formatMessage(message.content)
                    : message.content
                  }
                </div>
              </div>
              <div className="flex-1" />
            </>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
          <div className="bg-zinc-700/50 border border-zinc-600 px-4 py-3 rounded-lg">
            <LoaderCircle className="animate-spin text-blue-400" />
          </div>
        </div>
      )}

      <EmptyChat isChatEmpty={chatHistory.length <= 0} />
    </div>
  );
}
