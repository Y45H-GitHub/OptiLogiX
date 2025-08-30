import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Send, Mic, MicOff, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: string;
  suggestions?: string[];
}

const FloatingChatbot = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [size, setSize] = useState({ width: 384, height: 500 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      message: "Hello! I'm AskSupplyBot, your AI-powered supply chain assistant. How can I help you?",
      timestamp: 'Just now',
      suggestions: ['Route optimization', 'Compliance check', 'Inventory status']
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const sampleResponses = [
    "Based on current data, the most cost-effective route from LA to Amsterdam is: Sea freight via Rotterdam (€340, 12 days) + land transport (€45, 1 day). Total: €385, 13 days.",
    "I found 3 compliance issues with lithium batteries: 1) UN3480 labeling required, 2) IATA declaration needed, 3) Maximum 2 batteries per package.",
    "Current inventory analysis shows: 12 SKUs below reorder threshold, 3 critical stock-outs expected in 5 days."
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = Math.max(300, Math.min(800, e.clientX - (resizeRef.current?.getBoundingClientRect().left || 0)));
      const newHeight = Math.max(400, Math.min(800, e.clientY - (resizeRef.current?.getBoundingClientRect().top || 0)));
      
      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (message: string = currentMessage) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: message,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMessage]); // Append new message to the end
    setCurrentMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: sampleResponses[Math.floor(Math.random() * sampleResponses.length)],
        timestamp: 'Just now',
        suggestions: ['Tell me more', 'Compare options', 'Generate report']
      };
      setMessages(prev => [...prev, botMessage]); // Append new message to the end
      setIsLoading(false);
    }, 1500);
  };

  const toggleListening = () => setIsListening(!isListening);
  const toggleVoice = () => setIsVoiceEnabled(!isVoiceEnabled);

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-lg flex items-center justify-center z-50"
      >
        <Bot className="w-12 h-12 text-white" />
      </Button>
    );
  }

  return (
    <Card 
      ref={resizeRef}
      style={{ width: size.width, height: size.height }}
      className="fixed bottom-4 right-4 shadow-2xl bg-white/95 backdrop-blur-md border-2 border-cyan-200 z-50 overflow-hidden"
    >
      <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="w-6 h-6 text-cyan-600" />
          AskSupplyBot
        </CardTitle>
        <div className="flex gap-1 items-center">
          <Button
            size="sm"
            variant="ghost"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
            className="h-8 w-8 p-0 cursor-se-resize"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleVoice}
            className="h-8 w-8 p-0"
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleListening}
            className="h-8 w-8 p-0"
          >
            {isListening ? <Mic className="w-4 h-4 text-red-600" /> : <MicOff className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(false)}
            className="h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex flex-col h-[calc(100%-56px)]">
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-2 rounded-lg ${message.type === 'user' ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-cyan-100' : 'text-gray-500'}`}>
                  {message.timestamp}
                </p>
                
                {message.suggestions && (
                  <div className="mt-2 space-y-1">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="ghost"
                        className="text-xs h-6 px-2 w-full justify-start hover:bg-gray-200/50"
                        onClick={() => sendMessage(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-cyan-500"></div>
                  <span className="text-xs text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything..."
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={isLoading}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white p-2 rounded-lg shadow-md"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FloatingChatbot;