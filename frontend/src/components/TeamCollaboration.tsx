
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Bell, Send, User, Clock, AlertTriangle } from 'lucide-react';

interface Message {
  id: string;
  user: string;
  message: string;
  timestamp: string;
  type: 'chat' | 'alert' | 'system';
  priority?: 'high' | 'medium' | 'low';
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  lastActive: string;
}

const TeamCollaboration = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      user: 'System',
      message: 'Container stuck at Port of Long Beach - Dock 15',
      timestamp: '2 min ago',
      type: 'alert',
      priority: 'high'
    },
    {
      id: '2',
      user: 'Mike Chen',
      message: 'I can reroute the LA shipment through Oakland port',
      timestamp: '5 min ago',
      type: 'chat'
    },
    {
      id: '3',
      user: 'Sarah Wilson',
      message: 'Weather alert: Storm approaching Houston area, delays expected',
      timestamp: '8 min ago',
      type: 'alert',
      priority: 'medium'
    },
    {
      id: '4',
      user: 'James Rodriguez',
      message: 'Compliance check complete for shipment SH-445',
      timestamp: '12 min ago',
      type: 'chat'
    },
    {
      id: '5',
      user: 'System',
      message: 'New freight quote available for Europe route - 15% cheaper',
      timestamp: '15 min ago',
      type: 'system'
    }
  ]);

  const [teamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Mike Chen', role: 'Dock Supervisor', status: 'online', lastActive: 'Active now' },
    { id: '2', name: 'Sarah Wilson', role: 'Risk Analyst', status: 'online', lastActive: 'Active now' },
    { id: '3', name: 'James Rodriguez', role: 'Compliance Officer', status: 'busy', lastActive: '5 min ago' },
    { id: '4', name: 'Lisa Thompson', role: 'Route Optimizer', status: 'online', lastActive: 'Active now' },
    { id: '5', name: 'David Kim', role: 'Inventory Manager', status: 'offline', lastActive: '2 hours ago' }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('general');

  const channels = [
    { id: 'general', name: 'General', unread: 3 },
    { id: 'dispatch', name: 'Dispatch Team', unread: 1 },
    { id: 'compliance', name: 'Compliance Alerts', unread: 5 },
    { id: 'emergencies', name: 'Emergency Response', unread: 0 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getMessageTypeColor = (type: string, priority?: string) => {
    if (type === 'alert') {
      switch (priority) {
        case 'high': return 'bg-red-100 border-l-red-500';
        case 'medium': return 'bg-yellow-100 border-l-yellow-500';
        default: return 'bg-blue-100 border-l-blue-500';
      }
    }
    if (type === 'system') return 'bg-purple-100 border-l-purple-500';
    return 'bg-gray-50 border-l-gray-300';
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: Date.now().toString(),
        user: 'You',
        message: newMessage,
        timestamp: 'Just now',
        type: 'chat'
      };
      setMessages([newMsg, ...messages]);
      setNewMessage('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Team Members Panel */}
        <Card className="bg-white/90 backdrop-blur-md border-2 border-emerald-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-600" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{member.name}</p>
                    <p className="text-xs text-gray-600">{member.role}</p>
                    <p className="text-xs text-gray-500">{member.lastActive}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <div className="lg:col-span-3 space-y-4">
          {/* Channel Selector */}
          <Card className="bg-white/90 backdrop-blur-md border-2 border-teal-200 shadow-xl">
            <CardContent className="p-4">
              <div className="flex gap-2 flex-wrap">
                {channels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={selectedChannel === channel.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`relative ${selectedChannel === channel.id ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : ''}`}
                  >
                    {channel.name}
                    {channel.unread > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                        {channel.unread}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Message Feed */}
          <Card className="bg-white/90 backdrop-blur-md border-2 border-cyan-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-800 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-cyan-600" />
                Team Chat - #{selectedChannel}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg border-l-4 ${getMessageTypeColor(message.type, message.priority)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 text-sm">{message.user}</span>
                        {message.type === 'alert' && (
                          <Badge className={`text-xs ${message.priority === 'high' ? 'bg-red-500' : message.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'} text-white`}>
                            {message.priority?.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {message.timestamp}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{message.message}</p>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <Button
                  onClick={sendMessage}
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Real-time Notifications */}
      <Card className="bg-white/90 backdrop-blur-md border-2 border-orange-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-orange-600" />
            Real-time Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800 text-sm">High Priority Alert</p>
                <p className="text-xs text-red-600">Port congestion at LA Harbor</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800 text-sm">Delay Warning</p>
                <p className="text-xs text-yellow-600">Weather conditions affecting routes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 text-sm">Team Update</p>
                <p className="text-xs text-green-600">All compliance checks completed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamCollaboration;
