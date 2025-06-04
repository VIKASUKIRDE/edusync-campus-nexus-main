
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Plus, 
  Users, 
  Mail,
  Send,
  Inbox,
  Star,
  Archive,
  Activity
} from 'lucide-react';
import MessageList from './messages/MessageList';
import ComposeMessage from './messages/ComposeMessage';
import MessageDetail from './messages/MessageDetail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMessages } from '@/hooks/useMessages';

const Messages: React.FC = () => {
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  
  const { messages, loading, markAsRead, toggleStar } = useMessages();

  // Filter messages based on tab
  const getFilteredMessages = () => {
    switch (activeTab) {
      case 'sent':
        return messages.filter(msg => msg.sender_type === 'teacher');
      case 'important':
        return messages.filter(msg => msg.is_starred || msg.is_important);
      case 'archive':
        return []; // Archive functionality can be added later
      default: // inbox
        return messages.filter(msg => msg.sender_type !== 'teacher');
    }
  };

  const filteredMessages = getFilteredMessages();

  // Calculate stats
  const stats = {
    totalMessages: messages.length,
    unreadMessages: messages.filter(msg => !msg.is_read).length,
    sentMessages: messages.filter(msg => msg.sender_type === 'teacher').length,
    importantMessages: messages.filter(msg => msg.is_starred || msg.is_important).length
  };

  const handleMessageClick = (message: any) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  const handleToggleStar = (messageId: string, isStarred: boolean) => {
    toggleStar(messageId, isStarred);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  // If a message is selected, show the detail view
  if (selectedMessage) {
    return (
      <div className="space-y-4 sm:space-y-8 p-3 sm:p-0">
        <MessageDetail
          message={selectedMessage}
          onBack={() => setSelectedMessage(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8 p-3 sm:p-0">
      {/* Enhanced Header Section - Red Theme for Messages */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-pink-700 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-white/5 rounded-full -translate-y-24 sm:-translate-y-48 translate-x-24 sm:translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/5 rounded-full translate-y-16 sm:translate-y-32 -translate-x-16 sm:-translate-x-32"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl">
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Messages</h1>
              <p className="text-lg sm:text-xl text-white/90 mb-2 sm:mb-3">
                Communicate with students, parents, and colleagues
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-8">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-semibold">{stats.totalMessages}</span>
                  <span className="text-white/80 text-sm sm:text-base">Total Messages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Inbox className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-semibold">{stats.unreadMessages}</span>
                  <span className="text-white/80 text-sm sm:text-base">Unread</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            size="lg" 
            className="w-full lg:w-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/20 text-white shadow-xl"
            onClick={() => setShowComposeModal(true)}
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Compose Message
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Unread Messages</CardTitle>
            <Mail className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{stats.unreadMessages}</div>
            <p className="text-xs text-red-600 mt-1">Need attention</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-50 to-rose-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-700">Sent Messages</CardTitle>
            <Send className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-900">{stats.sentMessages}</div>
            <p className="text-xs text-rose-600 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-700">Important</CardTitle>
            <Star className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900">{stats.importantMessages}</div>
            <p className="text-xs text-pink-600 mt-1">Starred messages</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Response Rate</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">92%</div>
            <p className="text-xs text-red-600 mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-red-100 p-1 rounded-xl">
              <TabsTrigger value="inbox" className="data-[state=active]:bg-white rounded-lg">
                Inbox
              </TabsTrigger>
              <TabsTrigger value="sent" className="data-[state=active]:bg-white rounded-lg">
                Sent
              </TabsTrigger>
              <TabsTrigger value="important" className="data-[state=active]:bg-white rounded-lg">
                Important
              </TabsTrigger>
              <TabsTrigger value="archive" className="data-[state=active]:bg-white rounded-lg">
                Archive
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="mt-6">
              <MessageList 
                messages={filteredMessages}
                onMessageClick={handleMessageClick}
                onToggleStar={handleToggleStar}
              />
            </TabsContent>

            <TabsContent value="sent" className="mt-6">
              <MessageList 
                messages={filteredMessages}
                onMessageClick={handleMessageClick}
                onToggleStar={handleToggleStar}
              />
            </TabsContent>

            <TabsContent value="important" className="mt-6">
              <MessageList 
                messages={filteredMessages}
                onMessageClick={handleMessageClick}
                onToggleStar={handleToggleStar}
              />
            </TabsContent>

            <TabsContent value="archive" className="mt-6">
              <div className="text-center py-12">
                <Archive className="h-16 w-16 mx-auto mb-4 text-red-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Archived Messages</h3>
                <p className="text-gray-600">No archived messages found</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Compose Message Modal */}
      {showComposeModal && (
        <ComposeMessage
          onClose={() => setShowComposeModal(false)}
          onSent={() => setShowComposeModal(false)}
        />
      )}
    </div>
  );
};

export default Messages;
