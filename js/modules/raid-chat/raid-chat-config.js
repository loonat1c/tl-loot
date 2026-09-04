// ====================================================
// raid-chat-config.js — конфигурация чата рейда
// ====================================================

export const CHAT_CONFIG = {
  // Firestore коллекция
  collection: 'raidChats',
  
  // Лимиты
  maxMessages: 50,           // Максимум сообщений для загрузки
  messageLifetime: 86400000, // 24 часа в миллисекундах
  cleanupInterval: 1800000,  // Очистка каждые 30 минут
  minCleanupInterval: 600000, // Минимум 10 минут между очистками
  
  // Роли и их стили
  roles: {
    admin: {
      label: 'Админ',
      color: '#ff4444',
      badge: '👑'
    },
    guild_leader: {
      label: 'Глава гильдии',
      color: '#ffaa00',
      badge: '⚔️'
    },
    moderator: {
      label: 'Модератор',
      color: '#44aaff',
      badge: '🛡️'
    },
    user: {
      label: 'Игрок',
      color: '#88cc88',
      badge: ''
    },
    guest: {
      label: 'Гость',
      color: '#aaaaaa',
      badge: ''
    }
  },
  
  // Системные события
  systemEvents: {
    loot_start: {
      icon: '🎲',
      template: 'Начат розыгрыш лута!'
    },
    loot_winner: {
      icon: '🏆',
      template: 'Победитель лута: {winner}'
    }
  },
  
  // Эмодзи для реакций
  reactions: ['🔥', '👍', '👀', '🎉', '💪', '😱']
};
