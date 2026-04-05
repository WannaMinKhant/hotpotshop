import { useState } from 'react';

// Comprehensive emoji keyboard for all use cases
const emojiData: Record<string, Record<string, string[]>> = {
  '🍽️ Food': {
    'Hotpot & Soup': ['🍲', '🥘', '🫕', '🍜', '🍝', '🍛', '🍚', '🍙', '🍘', '🥡'],
    'Meat': ['🥩', '🍖', '🍗', '🥓', '🌭', '🍔', '🌮', '🌯', '🐑', '🐷', '🐔', '🐄'],
    'Seafood': ['🦐', '🦀', '🦞', '🦑', '🐟', '🐠', '🐡', '🦪', '🐙', '🦈'],
    'Vegetables': ['🥬', '🥦', '🥕', '🌽', '🍅', '🥒', '🍆', '🫑', '🧄', '🧅', '🥔', '🍄', '🌶️', '🫒', '🫙'],
    'Fruit': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🥝', '🥭', '🍍', '🥥'],
    'Dairy': ['🧈', '🧀', '🥛', '🥚', '🍳'],
    'Snacks': ['🍟', '🍕', '🥨', '🥯', '🧁', '🍰', '🎂', '🍩', '🍪', '🍫', '🍬', '🍭'],
  },
  '🥤 Drinks': {
    'Beverages': ['🍹', '🍺', '🍻', '🥤', '🧃', '🫖', '☕', '🍵', '🧉', '🧊', '💧', '🥛', '🍶', '🍷', '🥂', '🥃'],
    'Fruit Drinks': ['🍋', '🍊', '🍇', '🍓', '🥝', '🍍', '🥥', '🫐'],
  },
  '🧂 Condiments': {
    'Spices': ['🧂', '🌶️', '🫙', '🥫', '🍶', '🥢', '🧄', '🧅'],
  },
  '🏷️ Symbols': {
    'Numbers': ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'],
    'Shapes': ['⭐', '💎', '🔶', '🔷', '🔺', '🔻', '🔵', '🟢', '🟡', '🔴', '🟠', '🟣', '⬛', '⬜', '🟤'],
    'Arrows': ['➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️'],
    'Checks': ['✅', '❌', '⚠️', '🚫', '💯', '🔥', '💥', '✨', '🎉', '🎊'],
  },
  '👥 People': {
    'Roles': ['👨‍🍳', '👩‍🍳', '🤵', '💰', '👔', '🧹', '👷', '💁', '🙋', '🧑‍💼'],
    'Actions': ['👋', '👍', '👎', '👏', '🙏', '💪', '✌️', '🤝', '🫡', '👀', '🧠', '❤️', '💔', '💕'],
    'Families': ['👨‍👩‍👧', '👨‍👩‍👧‍👦', '👩‍👦', '👨‍👦', '👩‍👧', '👨‍👧'],
  },
  '🏢 Place & Objects': {
    'Restaurant': ['🪑', '🍽️', '🔪', '🥄', '🍴', '🫗', '🧊', '📦', '🛒', '📋', '📊', '📈', '📉'],
    'Building': ['🏠', '🏢', '🏬', '🏪', '🏗️', '🏭', '🏥', '🏫', '🏦', '🏨'],
    'Transport': ['🚗', '🚕', '🚙', '🚌', '🚚', '🚛', '🏍️', '🚲', '✈️', '🚁', '🚀'],
  },
  '⏰ Time & Money': {
    'Time': ['⏰', '⏱️', '⏲️', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '📅', '📆', '🗓️'],
    'Money': ['💰', '💵', '💴', '💶', '💷', '💳', '🪙', '💲', '📊', '📈'],
  },
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
  currentEmoji?: string;
}

const EmojiPicker = ({ onSelect, onClose, currentEmoji }: EmojiPickerProps) => {
  const [activeGroup, setActiveGroup] = useState<string>(Object.keys(emojiData)[0]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const groupKeys = Object.keys(emojiData);
  const currentGroup = emojiData[activeGroup] || {};
  const categoryKeys = Object.keys(currentGroup);

  // Auto-select first category when group changes
  useState(() => {
    if (!activeCategory || !categoryKeys.includes(activeCategory)) {
      setActiveCategory(categoryKeys[0] || '');
    }
  });

  // Get emojis to display
  const displayEmojis = searchTerm
    ? Object.values(currentGroup).flat()
    : (currentGroup[activeCategory] || []);

  const uniqueEmojis = [...new Set(displayEmojis)];

  return (
    <div className="bg-[#1e2128] border border-gray-600 rounded-xl overflow-hidden w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-white font-bold text-sm">😊 Emoji Keyboard</h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg leading-none">
            ×
          </button>
        )}
      </div>

      {/* Current emoji preview */}
      {currentEmoji && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700">
          <span className="text-3xl">{currentEmoji}</span>
          <span className="text-gray-400 text-sm">Current</span>
        </div>
      )}

      {/* Search */}
      <div className="px-3 py-2 border-b border-gray-700">
        <input
          type="text"
          placeholder="🔍 Search emoji..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-1.5 rounded bg-[#272a30] border border-gray-600 text-white text-sm outline-none focus:border-yellow-500"
        />
      </div>

      {/* Group tabs (top level) */}
      <div className="flex gap-0.5 px-2 py-1 border-b border-gray-700 overflow-x-auto">
        {groupKeys.map((group) => (
          <button
            key={group}
            onClick={() => { setActiveGroup(group); setSearchTerm(''); }}
            className={`px-2 py-1.5 rounded-t text-xs font-semibold whitespace-nowrap transition ${
              activeGroup === group
                ? 'bg-[#272a30] text-yellow-400'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Category sub-tabs */}
      {!searchTerm && categoryKeys.length > 1 && (
        <div className="flex gap-0.5 px-2 py-1 border-b border-gray-700 overflow-x-auto">
          {categoryKeys.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-1 rounded text-[10px] font-semibold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-yellow-500 text-black'
                  : 'bg-[#272a30] text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div className="grid grid-cols-10 gap-0.5 p-2 max-h-52 overflow-y-auto">
        {uniqueEmojis.length === 0 ? (
          <div className="col-span-10 text-center text-gray-500 text-sm py-4">No emojis found</div>
        ) : (
          uniqueEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className={`text-xl p-1.5 rounded hover:bg-[#272a30] transition ${
                emoji === currentEmoji ? 'ring-2 ring-yellow-500 bg-yellow-500/10' : ''
              }`}
            >
              {emoji}
            </button>
          ))
        )}
      </div>

      {/* Quick select row */}
      <div className="px-3 py-2 border-t border-gray-700">
        <p className="text-gray-500 text-[10px] mb-1">QUICK SELECT</p>
        <div className="flex gap-1 flex-wrap">
          {['🍲', '🥩', '🦐', '🥬', '🍜', '🍹', '🧂', '📦', '🔥', '⭐', '✅', '❌'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className={`text-lg p-1 rounded hover:bg-[#272a30] transition ${
                emoji === currentEmoji ? 'ring-2 ring-yellow-500' : ''
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker;
