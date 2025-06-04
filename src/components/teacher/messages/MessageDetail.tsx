
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Star, 
  Download, 
  ExternalLink,
  Clock,
  User,
  Users,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { Message } from '@/hooks/useMessages';

interface MessageDetailProps {
  message: Message | null;
  onBack: () => void;
}

const MessageDetail: React.FC<MessageDetailProps> = ({ message, onBack }) => {
  if (!message) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Select a message to view details</p>
      </div>
    );
  }

  const getRecipientIcon = (recipientType?: string) => {
    if (recipientType === 'class' || recipientType === 'semester' || recipientType === 'section') {
      return <Users className="h-5 w-5 text-purple-500" />;
    }
    return <User className="h-5 w-5 text-slate-500" />;
  };

  const renderAttachment = () => {
    if (!message.file_url || !message.file_name) return null;

    const isImage = message.message_type === 'image' || 
                   message.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isPDF = message.message_type === 'pdf' || 
                 message.file_name.endsWith('.pdf');
    const isLink = message.message_type === 'link';

    return (
      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {isImage && <ImageIcon className="h-5 w-5 text-blue-500" />}
            {isPDF && <FileText className="h-5 w-5 text-red-500" />}
            {isLink && <LinkIcon className="h-5 w-5 text-green-500" />}
            <span className="font-medium text-slate-700">{message.file_name}</span>
            {message.file_size && (
              <span className="text-sm text-slate-500">
                ({(message.file_size / 1024 / 1024).toFixed(2)} MB)
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(message.file_url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {isLink ? 'Open Link' : 'View'}
            </Button>
            {!isLink && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = message.file_url!;
                  link.download = message.file_name!;
                  link.click();
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
        
        {isImage && (
          <div className="mt-3">
            <img 
              src={message.file_url} 
              alt={message.file_name}
              className="max-w-full max-h-96 rounded-lg shadow-sm"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Messages</span>
        </Button>
        
        <div className="flex items-center space-x-2">
          {message.scheduled_at && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Scheduled</span>
            </Badge>
          )}
          {message.is_important && (
            <Badge variant="destructive">Important</Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={message.is_starred ? 'text-yellow-500' : 'text-slate-400'}
          >
            <Star className={`h-4 w-4 ${message.is_starred ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Message Header */}
      <div className="mb-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16 ring-2 ring-white shadow-lg">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg">
              {message.sender_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-semibold text-slate-900">
                {message.sender_name}
              </h2>
              <div className="flex items-center space-x-2 text-slate-500">
                {getRecipientIcon(message.recipient_type)}
                <span className="text-sm">to {message.recipient_name}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <span>{new Date(message.created_at).toLocaleString()}</span>
              {message.scheduled_at && (
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Scheduled for {new Date(message.scheduled_at).toLocaleString()}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subject */}
      {message.subject && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {message.subject}
          </h3>
        </div>
      )}

      {/* Message Content */}
      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
        <div className="prose prose-slate max-w-none">
          <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
            {message.content}
          </div>
        </div>

        {/* Attachment */}
        {renderAttachment()}
      </div>

      {/* Message Info */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-slate-700">Type:</span>
            <p className="text-slate-600 capitalize">{message.message_type}</p>
          </div>
          <div>
            <span className="font-medium text-slate-700">Status:</span>
            <p className="text-slate-600">{message.is_read ? 'Read' : 'Unread'}</p>
          </div>
          <div>
            <span className="font-medium text-slate-700">Recipient Type:</span>
            <p className="text-slate-600 capitalize">{message.recipient_type}</p>
          </div>
          <div>
            <span className="font-medium text-slate-700">Sent:</span>
            <p className="text-slate-600">{new Date(message.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;
