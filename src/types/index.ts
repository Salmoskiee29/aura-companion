export interface CompanionModel {
  id: string;
  name: string;
  age: number;
  nationality: string;
  languages: string[];
  personality: string;
  occupation: string;
  hobbies: string[];
  relationshipStyle: string;
  traits: string[];
  conversationSpeed: 'slow' | 'normal' | 'fast';
  emojiUsage: 'low' | 'medium' | 'high';
  messageLength: 'short' | 'medium' | 'long';
  avatar: string;
  online: boolean;
  instagramLink?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: 'user' | 'model' | 'chatter';
  message: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  modelId: string;
  assignedChatterId?: string;
  aiEnabled: boolean;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'chatter' | 'admin';
  freeMessagesUsed: number;
  subscriptionStatus: 'inactive' | 'active' | 'cancelled';
}

export type AppRole = 'user' | 'chatter' | 'admin' | 'developer';
