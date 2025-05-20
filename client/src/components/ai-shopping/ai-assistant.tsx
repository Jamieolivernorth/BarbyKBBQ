import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIAssistant({ bookingContext }: { bookingContext?: any }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your BBQ planning assistant. How can I help you with your beach BBQ booking today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Automatically scroll to the bottom when messages change
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to the chat
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Send request to backend for AI response
      const response = await apiRequest("POST", "/api/ai-shopping/assistance", {
        question: input,
        bookingContext
      });
      
      const data = await response.json();
      
      // Add AI response to the chat
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting AI assistance:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from the assistant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="border-[#C8913B] border-2 h-[500px] flex flex-col">
      <CardHeader className="bg-[#C8913B] text-white py-3">
        <CardTitle className="text-lg flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
            />
          </svg>
          BBQ Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-0">
        <div className="flex-grow overflow-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  message.role === "user" 
                    ? "bg-[#C8913B] text-white rounded-tr-none" 
                    : "bg-gray-100 text-gray-900 rounded-tl-none"
                }`}
              >
                <div className="text-sm">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.role === "user" ? "text-white/70" : "text-gray-500"
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about your BBQ booking..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={loading}
              className="flex-grow"
            />
            <Button 
              onClick={sendMessage} 
              disabled={loading || !input.trim()}
              className="bg-[#C8913B] hover:bg-[#b17d33]"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                  />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}