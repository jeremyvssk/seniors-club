import React from 'react';

interface Message {
  id: number;
  name: string;
  preview: string;
  time: string;
  avatar: string;
}

const mockMessages: Message[] = [
  { id: 1, name: 'Sarah Johnson', preview: 'Hey! How are you?', time: '2m ago', avatar: 'SJ' },
  { id: 2, name: 'Jeremy Vaask', preview: 'jobu', time: '5m ago', avatar: 'JV' },
  // ... more messages
];

export const MessagesSection: React.FC = () => {
  return (
    <div className="space-y-3">
      {mockMessages.map((msg) => (
        <div key={msg.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 cursor-pointer transition-all">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {msg.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-gray-900">{msg.name}</h3>
                <span className="text-xs text-gray-500">{msg.time}</span>
              </div>
              <p className="text-sm text-gray-600 truncate">{msg.preview}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};