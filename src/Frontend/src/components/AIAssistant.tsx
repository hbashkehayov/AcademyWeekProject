'use client';

import { useState, useRef, useEffect } from 'react';
import { apiService } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  onBack: () => void;
  onEditTool?: (toolData: any) => void;
}

export default function AIAssistant({ onBack, onEditTool }: AIAssistantProps) {
  console.log('AIAssistant: onEditTool prop received:', !!onEditTool);
  const [pendingToolData, setPendingToolData] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI assistant for the ProjectAIWP platform. I can help you research and add new AI tools using internet data!\n\n🌐 **Research New Tools from the Internet:**\n• Type: **\"Research [Tool Name]\"** - I'll search and analyze the tool\n• Include URL for better results: **\"Research ChatGPT at https://chat.openai.com\"**\n• I'll extract features, pricing, and create a complete tool profile\n\n🔍 **What I Can Research:**\n📝 **Tool Descriptions** - Comprehensive features, pricing, and use cases from their websites\n🎯 **Role Recommendations** - Best tools for Frontend, Backend, QA, Designer, PM roles\n➕ **Add to Platform** - Automatically create tool submissions for admin approval\n🤖 **Platform Help** - Navigate features and understand how everything works\n\n**Try these examples:**\n• \"Research Cursor IDE\"\n• \"Research GitHub Copilot at https://github.com/features/copilot\"\n• \"Research DeepSeek Coder at https://www.deepseek.com\"\n• \"What tools are good for frontend developers?\"",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  const handleToolSubmission = async () => {
    if (!pendingToolData) return;

    console.log('AI Assistant: Submitting tool to platform:', pendingToolData);
    
    try {
      // Get CSRF token from cookies
      const getCsrfToken = () => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'XSRF-TOKEN') {
            return decodeURIComponent(value);
          }
        }
        return null;
      };

      // Ensure we have CSRF cookie
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
      await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      const csrfToken = getCsrfToken();

      // Map categories and roles to IDs (simplified for now)
      const categoryMapping: { [key: string]: number } = {
        'Code Generation': 1,
        'Testing & QA': 2,
        'Documentation': 3,
        'Design Tools': 4,
        'Project Management': 5,
        'Code Review': 6,
        'DevOps & CI/CD': 7,
        'Database Tools': 8,
        'Security': 9,
        'Analytics': 10
      };

      const roleMapping: { [key: string]: number } = {
        'frontend': 1,
        'backend': 2,
        'qa': 3,
        'designer': 4,
        'pm': 5,
        'owner': 6
      };

      const toolDataForSubmission = {
        name: pendingToolData.name,
        description: pendingToolData.description,
        website_url: pendingToolData.website_url,
        api_endpoint: pendingToolData.api_endpoint || null,
        logo_url: pendingToolData.logo_url || null,
        pricing_model: {
          type: pendingToolData.pricing_type || 'freemium',
          price: pendingToolData.price || null
        },
        features: pendingToolData.features || [],
        integration_type: pendingToolData.integration_type || 'redirect',
        suggested_role_id: roleMapping[pendingToolData.suggested_role?.toLowerCase()] || null,
        category_ids: pendingToolData.categories?.map((cat: string) => categoryMapping[cat]).filter(Boolean) || []
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-assistant/submit-tool`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken || '',
        },
        credentials: 'include',
        body: JSON.stringify({
          tool_data: toolDataForSubmission
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        const successMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ Great news! I've successfully added "${pendingToolData.name}" to the ProjectAIWP platform. It's now marked as "Pending Review" and will be available once approved by administrators. The tool has been categorized and tagged appropriately based on the information provided.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
        setPendingToolData(null);
      } else {
        throw new Error(result.message || 'Failed to submit tool');
      }
    } catch (error) {
      console.error('AI Assistant: Error submitting tool:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ I encountered an error while trying to add the tool. Please try again or contact support if the issue persists. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    // Detect if this is a research request
    const isResearchRequest = /(?:research|tell me about|describe|what is|add|find)\s+(.+?)(?:\s+tool|\s+AI|$)/i.test(inputMessage.trim());
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    if (isResearchRequest) {
      setIsResearching(true);
      // Add a research indicator message
      const researchMessage: Message = {
        id: (Date.now() + 0.5).toString(),
        role: 'assistant',
        content: "🔍 Researching the tool from the internet... This may take a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, researchMessage]);
    }

    try {
      console.log('AI Assistant: Sending request to backend API...');
      console.log('AI Assistant: Message history length:', messages.length);

      // First, get CSRF cookie
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
      const csrfResponse = await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('AI Assistant: CSRF cookie response:', csrfResponse.status);

      // Get CSRF token from cookies
      const getCsrfToken = () => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'XSRF-TOKEN') {
            return decodeURIComponent(value);
          }
        }
        return null;
      };

      const csrfToken = getCsrfToken();
      console.log('AI Assistant: CSRF token obtained:', csrfToken ? 'Yes' : 'No');

      // Prepare messages for API (excluding the initial welcome message)
      const conversationMessages = messages
        .filter(msg => msg.id !== '1') // Exclude welcome message
        .slice(-10) // Keep last 10 messages
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }))
        .concat([{
          role: 'user' as const,
          content: userMessage.content
        }]);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken || '',
        },
        credentials: 'include',
        body: JSON.stringify({
          messages: conversationMessages
        })
      });

      console.log('AI Assistant: Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('AI Assistant: API Error:', errorData);
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      console.log('AI Assistant: Received response from backend');
      console.log('AI Assistant: Response data:', data);

      // Check if the response contains a tool proposal
      const responseContent = data.content || "Sorry, I couldn't process your request.";
      
      // Parse tool proposal if present
      console.log('AI Assistant: Checking for tool proposals in response:', responseContent.substring(0, 200) + '...');
      const toolProposalMatch = responseContent.match(/\[TOOL_PROPOSAL\]([\s\S]*?)\[\/TOOL_PROPOSAL\]/);
      console.log('AI Assistant: Tool proposal match found:', !!toolProposalMatch);
      if (toolProposalMatch) {
        try {
          const toolData = JSON.parse(toolProposalMatch[1].trim());
          setPendingToolData(toolData);
          console.log('AI Assistant: Tool proposal detected and set:', toolData);
        } catch (e) {
          console.error('AI Assistant: Failed to parse tool proposal:', e);
        }
      } else {
        console.log('AI Assistant: No tool proposal found in response');
      }

      // Check if this is a confirmation to add the tool
      if (responseContent.includes('[CONFIRM_ADD_TOOL]') && pendingToolData) {
        await handleToolSubmission();
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent.replace(/\[TOOL_PROPOSAL\][\s\S]*?\[\/TOOL_PROPOSAL\]/g, '').replace('[CONFIRM_ADD_TOOL]', '').trim(),
        timestamp: new Date()
      };

      // Remove research indicator message if it exists and add the real response
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.content.includes("🔍 Researching the tool"));
        return [...filteredMessages, assistantMessage];
      });
      setIsResearching(false);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      // Remove research indicator on error too
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.content.includes("🔍 Researching the tool"));
        return [...filteredMessages, errorMessage];
      });
      setIsResearching(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="glass-morphism rounded-t-2xl p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-200 group"
            >
              <svg 
                className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-1">🤖 AI Assistant</h1>
            <p className="text-white/70 text-sm">Ask me anything about ProjectAIWP</p>
          </div>
          
          <div className="w-32"></div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="glass-morphism rounded-b-2xl overflow-hidden">
        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-6 space-y-4" style={{ scrollbarWidth: 'thin' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-500/20 border border-blue-400/30 text-white'
                    : 'bg-white/10 border border-white/20 text-white/90'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-60 mt-2">{formatTime(message.timestamp)}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">You</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl p-4 bg-white/10 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    {isResearching && (
                      <span className="text-xs text-white/70 ml-2">🔍 Researching...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>


        {/* Pending Tool Confirmation */}
        {pendingToolData && (
          <div className="border-t border-white/10 p-4 bg-blue-500/10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white/90 font-medium mb-1">
                  Ready to add &quot;{pendingToolData.name}&quot; to the platform?
                </p>
                <p className="text-xs text-white/60">
                  This tool will be submitted for review before being publicly available.
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={async () => {
                    const confirmMessage: Message = {
                      id: Date.now().toString(),
                      role: 'user',
                      content: 'Yes, please add this tool to the platform.',
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, confirmMessage]);
                    await handleToolSubmission();
                  }}
                  className="px-4 py-2 bg-green-500/20 border border-green-400/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  ✅ Confirm Add
                </button>
                <button
                  onClick={() => {
                    console.log('Edit button clicked, pendingToolData:', pendingToolData);
                    console.log('onEditTool function:', onEditTool);
                    if (onEditTool) {
                      onEditTool(pendingToolData);
                      setPendingToolData(null);
                    } else {
                      console.error('onEditTool function not provided to AIAssistant');
                      // Fallback: show error message
                      const errorMessage: Message = {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: 'Sorry, the edit function is not available right now. Please try refreshing the page or contact support.',
                        timestamp: new Date()
                      };
                      setMessages(prev => [...prev, errorMessage]);
                    }
                  }}
                  className="px-4 py-2 bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => {
                    setPendingToolData(null);
                    const cancelMessage: Message = {
                      id: Date.now().toString(),
                      role: 'assistant',
                      content: 'No problem! The tool submission has been cancelled. Let me know if you need help with anything else.',
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, cancelMessage]);
                  }}
                  className="px-4 py-2 bg-red-500/20 border border-red-400/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="border-t border-white/10 px-6 py-4 bg-white/5">
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setInputMessage("Research Claude AI")}
              className="px-3 py-1.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full text-xs hover:bg-blue-500/30 transition-colors"
              disabled={isLoading}
            >
              Research Claude AI
            </button>
            <button
              onClick={() => setInputMessage("Tell me about Cursor AI")}
              className="px-3 py-1.5 bg-green-500/20 border border-green-400/30 text-green-300 rounded-full text-xs hover:bg-green-500/30 transition-colors"
              disabled={isLoading}
            >
              Tell me about Cursor AI
            </button>
            <button
              onClick={() => setInputMessage("Describe DeepSeek Coder")}
              className="px-3 py-1.5 bg-purple-500/20 border border-purple-400/30 text-purple-300 rounded-full text-xs hover:bg-purple-500/30 transition-colors"
              disabled={isLoading}
            >
              Describe DeepSeek Coder
            </button>
            <button
              onClick={() => setInputMessage("What tools are good for frontend developers?")}
              className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 rounded-full text-xs hover:bg-yellow-500/30 transition-colors"
              disabled={isLoading}
            >
              Frontend Tools
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 p-6">
          <form onSubmit={sendMessage} className="flex space-x-4">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
                placeholder="Ask me anything about ProjectAIWP..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 resize-none min-h-[50px] max-h-32"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send</span>
                </>
              )}
            </button>
          </form>
          <div className="mt-3 text-center">
            <p className="text-xs text-white/40">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}