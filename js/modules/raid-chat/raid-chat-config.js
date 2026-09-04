// ====================================================
// raid-chat-config.js — конфигурация чата рейда
// Адаптировано под Throne & Liberty тему
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
      color: '#ff6b6b',
      badge: '👑'
    },
    guild_leader: {
      label: 'Глава гильдии',
      color: '#c9aa71',
      badge: '⚔️'
    },
    moderator: {
      label: 'Модератор',
      color: '#6bbaff',
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
      template: 'Начат розыгрыш лута: {item}'
    },
    loot_winner: {
      icon: '🏆',
      template: 'Победитель лута: {winner} (бросок: {roll}) — {item}'
    }
  },
  
  // Эмодзи для реакций
  reactions: ['🔥', '👍', '👀', '🎉', '💪', '😱']
};
