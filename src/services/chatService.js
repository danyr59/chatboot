import { mockConversations, generateId, getRandomResponse } from './mockData';

// Simulación de delay para hacer más realista la experiencia
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Variable para prevenir creaciones simultáneas
let isCreatingConversation = false;

// Función para generar un título basado en el mensaje
const generateTitle = (message) => {
  // Limitar el título a 50 caracteres y agregar "..." si es más largo
  const maxLength = 50;
  let title = message.trim();
  
  if (title.length > maxLength) {
    // Cortar en el último espacio antes del límite para no cortar palabras
    const lastSpace = title.lastIndexOf(' ', maxLength);
    title = title.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
  }
  
  return title;
};

export const chatService = {
  async getConversations() {
    await delay(800);
    return [...mockConversations]; // Retornar una copia para evitar mutaciones directas
  },

  async getMessages(conversationId) {
    await delay(500);
    const conversation = mockConversations.find(c => c.id === conversationId);
    return conversation ? [...conversation.messages] : []; // Retornar una copia
  },

  async sendMessage(conversationId, message) {
    await delay(1500);
    
    const conversation = mockConversations.find(c => c.id === conversationId);
    if (!conversation) throw new Error('Conversación no encontrada');

    const userMessage = {
      id: generateId(),
      role: 'user',
      content: message
    };

    const aiMessage = {
      id: generateId(),
      role: 'assistant',
      content: getRandomResponse(message)
    };

    // Si es el primer mensaje en la conversación, actualizar el título
    if (conversation.messages.length === 0) {
      conversation.title = generateTitle(message);
    }

    conversation.messages.push(userMessage, aiMessage);
    return {
      message: aiMessage,
      updatedTitle: conversation.messages.length === 2 ? conversation.title : null
    };
  },

  async createConversation() {
    // Prevenir creaciones simultáneas
    if (isCreatingConversation) {
      throw new Error('Ya se está creando una conversación');
    }

    isCreatingConversation = true;

    try {
      await delay(500);
      
      const newConversation = {
        id: generateId(),
        title: 'Nueva conversación',
        messages: []
      };

      // Insertar al inicio del array
      mockConversations.unshift(newConversation);
      
      return { ...newConversation }; // Retornar una copia
    } finally {
      isCreatingConversation = false;
    }
  },

  async deleteConversation(conversationId) {
    await delay(300);
    
    const index = mockConversations.findIndex(c => c.id === conversationId);
    if (index !== -1) {
      mockConversations.splice(index, 1);
      return true;
    }
    return false;
  },

  // Método adicional para actualizar el título de la conversación
  async updateConversationTitle(conversationId, title) {
    await delay(300);
    
    const conversation = mockConversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.title = title;
      return true;
    }
    return false;
  }
}; 