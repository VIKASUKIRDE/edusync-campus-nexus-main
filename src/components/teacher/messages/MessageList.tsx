
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Star, 
  Paperclip, 
  Image, 
  FileText, 
  Link as LinkIcon,
  Clock,
  User,
  Users
} from 'lucide-react';
import { Message } from '@/hooks/useMessages';

interface MessageListProps {
  messages: Message[];
  onMessageClick: (message: Message) => void;
  onToggleStar: (messageId: string, isStarred: boolean) => void;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  onMessageClick, 
  onToggleStar 
}) => {
  const getMessageIcon = (messageType: string) => {
    switch (messageType) {
      case 'image':
        return <Image className="h-4 w-4 text-blue-500" />;
      case 'pdf':
      case 'file':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'link':
        return <LinkIcon className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getRecipientIcon = (recipientType?: string) => {
    if (recipientType === 'class' || recipientType === 'semester' || recipientType === 'section') {
      return <Users className="h-4 w-4 text-purple-500" />;
    }
    return <User className="h-4 w-4 text-slate-500" />;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Star className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No messages found</h3>
        <p className="text-slate-500">Start a conversation by composing a new message.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-200">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
            !message.is_read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          }`}
          onClick={() => onMessageClick(message)}
        >
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                {message.sender_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <p className={`text-sm font-medium ${!message.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
                    {message.sender_name}
                  </p>
                  {getRecipientIcon(message.recipient_type)}
                  {message.recipient_name && (
                    <span className="text-xs text-slate-500">→ {message.recipient_name}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {message.scheduled_at && (
                    <div title="Scheduled message">
                      <Clock className="h-4 w-4 text-orange-500" />
                    </div>
                  )}
                  {message.is_important && (
                    <Badge variant="destructive" className="text-xs">Important</Badge>
                  )}
                  <span className="text-xs text-slate-500">
                    {formatTime(message.created_at)}
                  </span>
                </div>
              </div>

              {/* Subject */}
              {message.subject && (
                <p className={`text-sm mb-1 ${!message.is_read ? 'font-medium text-slate-900' : 'text-slate-700'}`}>
                  {message.subject}
                </p>
              )}

              {/* Content Preview */}
              <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                {message.content}
              </p>

              {/* Message Type and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getMessageIcon(message.message_type)}
                  {message.file_name && (
                    <div className="flex items-center space-x-1">
                      <Paperclip className="h-3 w-3 text-slate-400" />
                      <span className="text-xs text-slate-500 truncate max-w-32">
                        {message.file_name}
                      </span>
                    </div>
                  )}
                  {!message.is_read && (
                    <Badge variant="secondary" className="text-xs">New</Badge>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(message.id, message.is_starred);
                  }}
                  className={`p-1 h-auto ${message.is_starred ? 'text-yellow-500' : 'text-slate-400'}`}
                >
                  <Star className={`h-4 w-4 ${message.is_starred ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
