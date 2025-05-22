import React, { useState, useEffect, useRef } from 'react';
import { MessageSquarePlus, Send, Trash2, MessageSquare, Edit2 } from 'lucide-react';
import { chatService } from '../../services/chatService';
import '../../styles/ChatPage.css';

const TypingIndicator = () => (
  <div className="typing-indicator">
    <div className="typing-dot"></div>
    <div className="typing-dot"></div>
    <div className="typing-dot"></div>
  </div>
);

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Ajustar altura del textarea automáticamente
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id);
      setEditingTitle(null);
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
      if (data.length > 0 && !currentConversation) {
        setCurrentConversation(data[0]);
      }
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  };

  const handleNewChat = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const newConversation = await chatService.createConversation();
      setConversations(prevConversations => {
        if (prevConversations.some(conv => conv.id === newConversation.id)) {
          return prevConversations;
        }
        return [newConversation, ...prevConversations];
      });
      setCurrentConversation(newConversation);
      setMessages([]);
    } catch (error) {
      console.error('Error al crear nueva conversación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (conversationId) => {
    try {
      await chatService.deleteConversation(conversationId);
      const updatedConversations = conversations.filter(c => c.id !== conversationId);
      setConversations(updatedConversations);
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(updatedConversations[0] || null);
      }
    } catch (error) {
      console.error('Error al eliminar conversación:', error);
    }
  };

  const handleEditTitle = async (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setEditingTitle(conversationId);
      setNewTitle(conversation.title);
    }
  };

  const handleSaveTitle = async (conversationId) => {
    try {
      await chatService.updateConversationTitle(conversationId, newTitle);
      setConversations(conversations.map(conv =>
        conv.id === conversationId ? { ...conv, title: newTitle } : conv
      ));
      setEditingTitle(null);
    } catch (error) {
      console.error('Error al actualizar título:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentConversation || isLoading) return;

    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: inputMessage
    }]);
    
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    adjustTextareaHeight();

    try {
      const { message, updatedTitle } = await chatService.sendMessage(currentConversation.id, messageToSend);
      
      // Actualizar mensajes
      setMessages(prev => [...prev, message]);
      
      // Actualizar título si es necesario
      if (updatedTitle) {
        setConversations(prevConversations => 
          prevConversations.map(conv =>
            conv.id === currentConversation.id 
              ? { ...conv, title: updatedTitle }
              : conv
          )
        );
        setCurrentConversation(prev => ({ ...prev, title: updatedTitle }));
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    adjustTextareaHeight();
  };

  return (
    <div className="chat-container">
      <aside className="chat-sidebar">
        <button className="new-chat-button" onClick={handleNewChat}>
          <MessageSquarePlus size={20} />
          <span>Nueva conversación</span>
        </button>
        
        <div className="chat-history">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`chat-history-item ${currentConversation?.id === conv.id ? 'active' : ''}`}
              onClick={() => setCurrentConversation(conv)}
            >
              <MessageSquare size={16} />
              {editingTitle === conv.id ? (
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={() => handleSaveTitle(conv.id)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle(conv.id)}
                  autoFocus
                  className="title-input"
                />
              ) : (
                <>
                  <span>{conv.title || 'Nueva conversación'}</span>
                  <div className="chat-history-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTitle(conv.id);
                      }}
                      className="action-button"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(conv.id);
                      }}
                      className="action-button"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-main">
        <div className="chat-messages">
          {messages.map(message => (
            <div
              key={message.id}
              className={`message-container ${message.role} message-appear`}
            >
              <div className={`message-avatar ${message.role}`}>
                {message.role === 'user' ? 'U' : 'A'}
              </div>
              <div className="message-content">
                {message.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-container assistant">
              <div className="message-avatar assistant">A</div>
              <TypingIndicator />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <form onSubmit={handleSendMessage} className="chat-input-wrapper">
            <textarea
              ref={textareaRef}
              className="chat-input"
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Envía un mensaje..."
              rows={1}
              disabled={isLoading || !currentConversation}
            />
            <button
              type="submit"
              className="send-button"
              disabled={!inputMessage.trim() || isLoading || !currentConversation}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChatPage; 