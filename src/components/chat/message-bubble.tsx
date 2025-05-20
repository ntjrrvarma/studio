// src/components/chat/message-bubble.tsx
'use client';

import type { FC } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

export interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date | Timestamp | { seconds: number, nanoseconds: number };
  confidence?: 'high' | 'medium' | 'low' | 'uncertain';
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  const bubbleClasses = isUser
    ? 'bg-primary text-primary-foreground self-end rounded-l-lg rounded-br-lg'
    : 'bg-secondary text-secondary-foreground self-start rounded-r-lg rounded-bl-lg';

  const confidenceClasses: Record<string, string> = {
    high: 'text-green-700 dark:text-green-400',
    medium: 'text-yellow-700 dark:text-yellow-400',
    low: 'text-orange-700 dark:text-orange-400',
    uncertain: 'text-red-700 dark:text-red-400',
  };

  const formatTimestamp = (timestamp: Message['timestamp']): string => {
    let dateToShow: Date;
    if (!timestamp) {
      dateToShow = new Date();
    } else if (timestamp instanceof Date) {
      dateToShow = timestamp;
    } else if (typeof timestamp === 'object' && 'seconds' in timestamp && typeof timestamp.seconds === 'number') {
      dateToShow = new Date(timestamp.seconds * 1000);
    } else {
      dateToShow = new Date();
    }
    return dateToShow.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  
  return (
    <div className={`flex flex-col mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`p-3 max-w-xs md:max-w-md shadow-md ${bubbleClasses}`}>
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        {!isUser && message.confidence && (
          <div className={`text-xs mt-1.5 flex items-center ${confidenceClasses[message.confidence] || 'text-muted-foreground'}`}>
            {message.confidence === 'uncertain' && <AlertTriangle size={14} className="inline mr-1 shrink-0" />}
            <span className="leading-tight">
              {message.confidence === 'uncertain' ? "I may not have the full answer. Please verify critical information with HR." : `Confidence: ${message.confidence}`}
            </span>
          </div>
        )}
      </div>
      <p className={`text-xs text-muted-foreground mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
        {formatTimestamp(message.timestamp)}
      </p>
    </div>
  );
};

export default MessageBubble;
