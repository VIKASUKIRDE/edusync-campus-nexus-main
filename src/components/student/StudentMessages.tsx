
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Star, StarOff, Plus, User, Download, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { useStudentMessages } from '@/hooks/useStudentMessages';

const StudentMessages: React.FC = () => {
  const { messages, teachers, loading, sendMessage, markAsRead, toggleStar } = useStudentMessages();
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [composeData, setComposeData] = useState({
    recipient_id: '',
    subject: '',
    content: ''
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!composeData.recipient_id || !composeData.content.trim()) {
      return;
    }

    const { error } = await sendMessage(composeData);
    
    if (!error) {
      setComposeData({ recipient_id: '', subject: '', content: '' });
      setShowCompose(false);
    }
  };

  const handleMessageClick = async (message: any) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      await markAsRead(message.id);
    }
  };

  const handleDownloadAttachment = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'zip':
      case 'rar':
        return '📦';
      default:
        return '📎';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-page-enter">
      <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-xl p-6 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">Messages</h1>
          <p className="text-green-100">
            Communicate with your teachers and receive important updates
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Messages</h2>
        <Button onClick={() => setShowCompose(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Compose Message
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No messages yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        !message.is_read ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => handleMessageClick(message)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                              {message.sender_name}
                            </span>
                            {!message.is_read && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                            {message.file_url && (
                              <Paperclip className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          {message.subject && (
                            <h4 className="font-medium mt-1">{message.subject}</h4>
                          )}
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                            {message.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(message.id, message.is_starred);
                          }}
                        >
                          {message.is_starred ? (
                            <Star className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Detail or Compose */}
        <div className="lg:col-span-1">
          {showCompose ? (
            <Card>
              <CardHeader>
                <CardTitle>Compose Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">To Teacher</Label>
                    <Select
                      value={composeData.recipient_id}
                      onValueChange={(value) =>
                        setComposeData({ ...composeData, recipient_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject (Optional)</Label>
                    <Input
                      id="subject"
                      value={composeData.subject}
                      onChange={(e) =>
                        setComposeData({ ...composeData, subject: e.target.value })
                      }
                      placeholder="Enter subject"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Message</Label>
                    <Textarea
                      id="content"
                      value={composeData.content}
                      onChange={(e) =>
                        setComposeData({ ...composeData, content: e.target.value })
                      }
                      placeholder="Type your message..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCompose(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : selectedMessage ? (
            <Card>
              <CardHeader>
                <CardTitle>Message Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>From</Label>
                    <p className="font-medium">{selectedMessage.sender_name}</p>
                  </div>
                  {selectedMessage.subject && (
                    <div>
                      <Label>Subject</Label>
                      <p className="font-medium">{selectedMessage.subject}</p>
                    </div>
                  )}
                  <div>
                    <Label>Date</Label>
                    <p className="text-sm text-gray-600">
                      {format(new Date(selectedMessage.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div>
                    <Label>Message</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                    </div>
                  </div>
                  {selectedMessage.file_url && selectedMessage.file_name && (
                    <div>
                      <Label>Attachment</Label>
                      <div className="mt-2 p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {getFileIcon(selectedMessage.file_name)}
                            </span>
                            <div>
                              <p className="font-medium text-sm">{selectedMessage.file_name}</p>
                              {selectedMessage.file_size && (
                                <p className="text-xs text-gray-500">
                                  {(selectedMessage.file_size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadAttachment(selectedMessage.file_url, selectedMessage.file_name)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a message to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentMessages;
