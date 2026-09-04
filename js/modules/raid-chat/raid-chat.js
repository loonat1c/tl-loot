// ====================================================
// raid-chat.js — модуль чата для страницы рейда
// ====================================================

import { db } from "../../firebase.js";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  getDocs,
  startAfter,
  deleteDoc,
  where,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { currentUser, currentRole, getUserData } from "../auth.js";
import { CHAT_CONFIG } from "./raid-chat-config.js";

export class RaidChat {
  constructor(options = {}) {
    this.raidId = options.raidId;
    this.container = options.container || document.body;
    this.currentUser = options.currentUser || currentUser;
    this.currentRole = options.currentRole || currentRole;
    
    this.isOpen = false;
    this.isMinimized = false;
    this.messages = [];
    this.unsubscribe = null;
    this.lastVisible = null;
    this.isLoadingHistory = false;
    this.lastCleanupTime = 0;
    this.cleanupInterval = null;
    
    this.init();
  }
  
  // ====================================================
  // Инициализация
  // ====================================================
  
  async init() {
    this.createChatElements();
    this.bindEvents();
    await this.loadMessages();
    this.subscribeToMessages();
    this.createFloatingIcon();
    
    // Запускаем очистку при инициализации
    await this.cleanupFirestoreMessages();
    
    // Периодическая очистка
    this.cleanupInterval = setInterval(() => {
      this.cleanupFirestoreMessages();
    }, CHAT_CONFIG.cleanupInterval);
  }
  
  createChatElements() {
    // Главный контейнер
    this.chatContainer = document.createElement('div');
    this.chatContainer.className = 'raid-chat-container';
    this.chatContainer.innerHTML = `
      <div class="raid-chat-window">
        <div class="raid-chat-header">
          <div class="raid-chat-title">
            <span class="chat-icon">💬</span>
            Чат рейда
          </div>
          <div class="raid-chat-controls">
            <button class="chat-btn-minimize" title="Свернуть">—</button>
            <button class="chat-btn-close" title="Закрыть">✕</button>
          </div>
        </div>
        
        <div class="raid-chat-messages">
          <div class="chat-loading">Загрузка сообщений...</div>
        </div>
        
        <div class="raid-chat-reactions">
          ${CHAT_CONFIG.reactions.map(emoji => 
            `<button class="reaction-btn" data-emoji="${emoji}">${emoji}</button>`
          ).join('')}
        </div>
        
        <div class="raid-chat-input">
          <input 
            type="text" 
            class="chat-input" 
            placeholder="Написать сообщение..." 
            maxlength="500"
          />
          <button class="chat-btn-send" title="Отправить">➤</button>
        </div>
      </div>
    `;
    
    this.container.appendChild(this.chatContainer);
    
    // Ссылки на элементы (используем классы вместо ID)
    this.messagesContainer = this.chatContainer.querySelector('.raid-chat-messages');
    this.chatInput = this.chatContainer.querySelector('.chat-input');
    this.reactionsContainer = this.chatContainer.querySelector('.raid-chat-reactions');
    this.window = this.chatContainer.querySelector('.raid-chat-window');
    this.minimizeBtn = this.chatContainer.querySelector('.chat-btn-minimize');
    this.closeBtn = this.chatContainer.querySelector('.chat-btn-close');
    this.sendBtn = this.chatContainer.querySelector('.chat-btn-send');
  }
  
  createFloatingIcon() {
    this.floatingIcon = document.createElement('div');
    this.floatingIcon.className = 'raid-chat-floating-icon';
    this.floatingIcon.innerHTML = '💬';
    this.floatingIcon.style.display = 'none';
    
    this.container.appendChild(this.floatingIcon);
  }
  
  bindEvents() {
    // Кнопки управления (проверяем существование)
    if (this.minimizeBtn) {
      this.minimizeBtn.addEventListener('click', () => this.minimize());
    }
    
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.hide());
    }
    
    // Отправка сообщений
    if (this.sendBtn) {
      this.sendBtn.addEventListener('click', () => this.sendMessage());
    }
    
    if (this.chatInput) {
      this.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    }
    
    // Реакции
    if (this.reactionsContainer) {
      this.reactionsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.reaction-btn');
        if (btn) {
          this.toggleReaction(btn.dataset.emoji);
        }
      });
    }
    
    // Плавающая иконка
    if (this.floatingIcon) {
      this.floatingIcon.addEventListener('click', () => this.unminimize());
    }
    
    // Загрузка истории при скролле
    if (this.messagesContainer) {
      this.messagesContainer.addEventListener('scroll', () => {
        if (this.messagesContainer.scrollTop === 0 && !this.isLoadingHistory) {
          this.loadOlderMessages();
        }
      });
    }
  }
  
  // ====================================================
  // Загрузка сообщений
  // ====================================================
  
  async loadMessages() {
    if (!this.raidId) return;
    
    const messagesRef = collection(db, CHAT_CONFIG.collection, this.raidId, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      limit(CHAT_CONFIG.maxMessages)
    );
    
    try {
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
        this.messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).reverse();
        
        this.renderMessages();
      }
      
      this.removeLoadingIndicator();
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
      this.showError('Не удалось загрузить сообщения');
    }
  }
  
  async loadOlderMessages() {
    if (!this.lastVisible || this.isLoadingHistory) return;
    
    this.isLoadingHistory = true;
    this.showLoadingIndicator();
    
    const messagesRef = collection(db, CHAT_CONFIG.collection, this.raidId, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      startAfter(this.lastVisible),
      limit(CHAT_CONFIG.maxMessages)
    );
    
    try {
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
        const olderMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).reverse();
        
        this.messages = [...olderMessages, ...this.messages];
        this.renderMessages();
      }
    } catch (error) {
      console.error('Ошибка загрузки старых сообщений:', error);
    } finally {
      this.isLoadingHistory = false;
      this.removeLoadingIndicator();
    }
  }
  
  subscribeToMessages() {
    if (!this.raidId) return;
    
    const messagesRef = collection(db, CHAT_CONFIG.collection, this.raidId, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'asc'),
      limit(1)
    );
    
    // Подписываемся на новые сообщения
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && !this.messages.find(m => m.id === change.doc.id)) {
          const message = {
            id: change.doc.id,
            ...change.doc.data()
          };
          
          // Проверяем, не старше ли сообщение 24 часов
          const messageTime = message.timestamp?.toDate?.() || new Date();
          if (Date.now() - messageTime.getTime() < CHAT_CONFIG.messageLifetime) {
            this.messages.push(message);
            this.renderMessages();
            this.scrollToBottom();
          }
        }
      });
    });
  }
  
  // ====================================================
  // Отправка сообщений
  // ====================================================
  
  async sendMessage() {
    const text = this.chatInput.value.trim();
    if (!text || !this.raidId || !this.currentUser) return;
    
    this.chatInput.value = '';
    
    try {
      const userData = await getUserData(this.currentUser.uid);
      const userName = userData?.username || this.currentUser.email?.split('@')[0] || 'User';
      
      const messageData = {
        userId: this.currentUser.uid,
        userName: userName,
        userRole: this.currentRole,
        text: text,
        type: 'user',
        timestamp: serverTimestamp(),
        reactions: {}
      };
      
      const messagesRef = collection(db, CHAT_CONFIG.collection, this.raidId, 'messages');
      await addDoc(messagesRef, messageData);
      
      // Очистка старых сообщений при отправке
      this.cleanupFirestoreMessages();
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      this.showError('Не удалось отправить сообщение');
    }
  }
  
  async addSystemEvent(eventType, eventData = {}) {
    if (!this.raidId) return;
    
    const eventConfig = CHAT_CONFIG.systemEvents[eventType];
    if (!eventConfig) return;
    
    let text = eventConfig.template;
    
    // Подставляем данные в шаблон
    Object.keys(eventData).forEach(key => {
      text = text.replace(`{${key}}`, eventData[key]);
    });
    
    const messageData = {
      userId: 'system',
      userName: 'Система',
      userRole: 'system',
      text: `${eventConfig.icon} ${text}`,
      type: eventType,
      timestamp: serverTimestamp(),
      reactions: {}
    };
    
    try {
      const messagesRef = collection(db, CHAT_CONFIG.collection, this.raidId, 'messages');
      await addDoc(messagesRef, messageData);
    } catch (error) {
      console.error('Ошибка отправки системного события:', error);
    }
  }
  
  // ====================================================
  // Очистка старых сообщений
  // ====================================================
  
  async cleanupFirestoreMessages() {
    const now = Date.now();
    if (now - this.lastCleanupTime < CHAT_CONFIG.minCleanupInterval) {
      return;
    }
    
    this.lastCleanupTime = now;
    const cutoffTime = new Date(now - CHAT_CONFIG.messageLifetime);
    
    try {
      const messagesRef = collection(db, CHAT_CONFIG.collection, this.raidId, 'messages');
      const q = query(
        messagesRef,
        where('timestamp', '<', cutoffTime),
        limit(100)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`✅ Очищено ${snapshot.size} старых сообщений`);
      }
    } catch (error) {
      console.error('❌ Ошибка очистки старых сообщений:', error);
    }
  }
  
  // ====================================================
  // Реакции
  // ====================================================
  
  async toggleReaction(emoji) {
    if (!this.currentUser) return;
    
    const lastMessage = this.messages[this.messages.length - 1];
    if (!lastMessage || lastMessage.userId === 'system') return;
    
    const messageRef = doc(db, CHAT_CONFIG.collection, this.raidId, 'messages', lastMessage.id);
    
    try {
      const reactions = lastMessage.reactions || {};
      const users = reactions[emoji] || [];
      
      if (users.includes(this.currentUser.uid)) {
        await updateDoc(messageRef, {
          [`reactions.${emoji}`]: arrayRemove(this.currentUser.uid)
        });
      } else {
        await updateDoc(messageRef, {
          [`reactions.${emoji}`]: arrayUnion(this.currentUser.uid)
        });
      }
    } catch (error) {
      console.error('Ошибка обновления реакции:', error);
    }
  }
  
  // ====================================================
  // Рендеринг
  // ====================================================
  
  renderMessages() {
    if (!this.messagesContainer) return;
    
    this.messagesContainer.innerHTML = '';
    
    let lastTimestamp = null;
    
    this.messages.forEach(message => {
      const messageTime = message.timestamp?.toDate?.() || new Date();
      if (!lastTimestamp || messageTime - lastTimestamp > 300000) {
        this.renderTimeDivider(messageTime);
        lastTimestamp = messageTime;
      }
      
      this.renderMessage(message);
    });
  }
  
  renderMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${message.type === 'system' ? 'system-message' : ''}`;
    messageEl.dataset.messageId = message.id;
    
    const roleConfig = CHAT_CONFIG.roles[message.userRole] || CHAT_CONFIG.roles.user;
    
    if (message.type === 'system' || message.userId === 'system') {
      messageEl.innerHTML = `
        <div class="system-message-content">
          ${message.text}
        </div>
      `;
    } else {
      messageEl.innerHTML = `
        <div class="message-avatar" style="background: ${roleConfig.color}20; color: ${roleConfig.color}">
          ${roleConfig.badge || message.userName[0].toUpperCase()}
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-author" style="color: ${roleConfig.color}">
              ${roleConfig.badge} ${message.userName}
            </span>
            ${roleConfig.label !== 'Игрок' ? `<span class="role-badge" style="background: ${roleConfig.color}20; color: ${roleConfig.color}">${roleConfig.label}</span>` : ''}
            <span class="message-time">${this.formatTime(message.timestamp?.toDate?.() || new Date())}</span>
          </div>
          <div class="message-text">${this.escapeHtml(message.text)}</div>
          ${this.renderReactions(message)}
        </div>
      `;
    }
    
    this.messagesContainer.appendChild(messageEl);
  }
  
  renderReactions(message) {
    const reactions = message.reactions || {};
    const reactionKeys = Object.keys(reactions);
    
    if (reactionKeys.length === 0) return '';
    
    return `
      <div class="message-reactions">
        ${reactionKeys.map(emoji => `
          <span class="reaction-badge ${reactions[emoji].includes(this.currentUser?.uid) ? 'active' : ''}" 
                data-message-id="${message.id}" 
                data-emoji="${emoji}">
            ${emoji} ${reactions[emoji].length}
          </span>
        `).join('')}
      </div>
    `;
  }
  
  renderTimeDivider(timestamp) {
    const divider = document.createElement('div');
    divider.className = 'chat-time-divider';
    divider.textContent = this.formatDate(timestamp);
    this.messagesContainer.appendChild(divider);
  }
  
  // ====================================================
  // Управление окном
  // ====================================================
  
  open() {
    if (!this.chatContainer || !this.floatingIcon) return;
    
    this.isOpen = true;
    this.isMinimized = false;
    this.chatContainer.classList.add('open');
    this.floatingIcon.style.display = 'none';
    setTimeout(() => {
      this.scrollToBottom();
      if (this.chatInput) this.chatInput.focus();
    }, 300);
  }
  
  close() {
    if (!this.chatContainer) return;
    
    this.isOpen = false;
    this.chatContainer.classList.remove('open');
  }
  
  hide() {
    this.close();
    if (this.floatingIcon) {
      this.floatingIcon.style.display = 'flex';
    }
  }
  
  minimize() {
    if (!this.chatContainer || !this.floatingIcon) return;
    
    this.isMinimized = true;
    this.chatContainer.classList.add('minimized');
    this.floatingIcon.style.display = 'flex';
  }
  
  unminimize() {
    if (!this.chatContainer || !this.floatingIcon) return;
    
    this.isMinimized = false;
    this.floatingIcon.style.display = 'none';
    this.chatContainer.classList.remove('minimized');
    setTimeout(() => {
      this.scrollToBottom();
      if (this.chatInput) this.chatInput.focus();
    }, 300);
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  // ====================================================
  // Вспомогательные функции
  // ====================================================
  
  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }
  
  formatTime(date) {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  formatDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long' 
      });
    }
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  showLoadingIndicator() {
    if (!this.messagesContainer) return;
    
    const loading = document.createElement('div');
    loading.className = 'chat-loading';
    loading.textContent = 'Загрузка...';
    this.messagesContainer.insertBefore(loading, this.messagesContainer.firstChild);
  }
  
  removeLoadingIndicator() {
    if (!this.messagesContainer) return;
    
    const loading = this.messagesContainer.querySelector('.chat-loading');
    if (loading) loading.remove();
  }
  
  showError(message) {
    if (!this.messagesContainer) return;
    
    const error = document.createElement('div');
    error.className = 'chat-error';
    error.textContent = message;
    this.messagesContainer.appendChild(error);
    setTimeout(() => error.remove(), 3000);
  }
  
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    if (this.chatContainer) {
      this.chatContainer.remove();
    }
    
    if (this.floatingIcon) {
      this.floatingIcon.remove();
    }
  }
}

// ====================================================
// Экспорт для удобства
// ====================================================

export function createRaidChat(options) {
  return new RaidChat(options);
}
