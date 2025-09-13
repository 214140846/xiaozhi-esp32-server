import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { X, MessageSquare, User, Bot, Clock } from 'lucide-react';
import type { ChatMessage } from '../../types/agent';

export interface ChatHistoryDialogProps {
  /** 对话框显示状态 */
  open: boolean;
  /** 对话框状态变化回调 */
  onOpenChange: (open: boolean) => void;
  /** 智能体ID */
  agentId: string;
  /** 智能体名称 */
  agentName: string;
}

/**
 * 聊天记录对话框组件
 * 
 * 功能包括：
 * - 显示与特定智能体的聊天历史
 * - 消息列表滚动
 * - 时间戳显示
 * - 加载状态处理
 */
export function ChatHistoryDialog({ 
  open, 
  onOpenChange, 
  agentId, 
  agentName 
}: ChatHistoryDialogProps) {
  console.log('[ChatHistoryDialog] 对话框状态:', open, '智能体:', agentName);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 加载聊天记录
  const loadChatHistory = async () => {
    if (!agentId || !open) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('[ChatHistoryDialog] 加载聊天记录，智能体ID:', agentId);
      
      // TODO: 调用API获取聊天记录
      // const response = await getChatHistoryApi(agentId);
      
      // 模拟API调用和数据
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          sender: 'user',
          content: '你好，请介绍一下你自己',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'sent'
        },
        {
          id: '2',
          sender: 'agent',
          content: `你好！我是${agentName}，一个AI智能助手。我可以帮助您解决各种问题，包括回答问题、提供建议、处理任务等。有什么我可以为您做的吗？`,
          timestamp: new Date(Date.now() - 86390000).toISOString(),
          status: 'sent'
        },
        {
          id: '3',
          sender: 'user',
          content: '能帮我制定一个学习计划吗？',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'sent'
        },
        {
          id: '4',
          sender: 'agent',
          content: '当然可以！为了为您制定最适合的学习计划，我需要了解一些信息：\n\n1. 您想学习什么领域或技能？\n2. 您现在的基础水平如何？\n3. 您希望在多长时间内达到什么目标？\n4. 您每天能投入多少时间学习？\n\n请告诉我这些信息，我会为您量身定制一个学习计划。',
          timestamp: new Date(Date.now() - 3590000).toISOString(),
          status: 'sent'
        }
      ];
      
      setMessages(mockMessages);
    } catch (err) {
      console.error('[ChatHistoryDialog] 加载聊天记录失败:', err);
      setError('加载聊天记录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 当对话框打开时加载聊天记录
  useEffect(() => {
    if (open && agentId) {
      loadChatHistory();
    }
  }, [open, agentId]);

  // 处理关闭对话框
  const handleClose = () => {
    onOpenChange(false);
    // 延迟清理状态，避免动画过程中显示空状态
    setTimeout(() => {
      setMessages([]);
      setError('');
    }, 300);
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 对话框未打开时不渲染
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩层 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* 对话框主体 */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl h-[600px] mx-auto transform transition-all flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                聊天记录
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                与 {agentName} 的对话历史
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 聊天记录内容 */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">加载聊天记录中...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadChatHistory}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  重新加载
                </Button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">暂无聊天记录</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  开始与 {agentName} 对话吧！
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  {/* 头像 */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-blue-600' 
                      : 'bg-gradient-to-br from-green-500 to-blue-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* 消息内容 */}
                  <div className={`flex-1 max-w-[80%] ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    <div className={`inline-block p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                    
                    {/* 时间戳 */}
                    <div className={`flex items-center mt-1 text-xs text-gray-400 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              共 {messages.length} 条消息
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="text-gray-600 dark:text-gray-300"
            >
              关闭
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
