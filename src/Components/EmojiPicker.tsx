import { useState } from 'react';

// Organized emoji sets for restaurant/stock management
const emojiCategories: Record<string, string[]> = {
  'Hotpot Bases': ['🍲', '🌶️', '🌿', '🍄', '🧄', '🧅', '🫕', '🥘'],
  'Meats': ['🥩', '🐑', '🐷', '🐔', '🐄', '🥓', '🍖', '🌭'],
  'Seafood': ['🦐', '🦀', '🦑', '🐟', '🦞', '🐙', '🦪', '🐚'],
  'Vegetables': ['🥬', '🥦', '🥕', '🌽', '🍅', '🥒', '🧈', '🫑', '🧅', '🥔', '🍆', '🌶️'],
  'Noodles & Rice': ['🍜', '🍝', '🍚', '🍙', '🍘', '🥡'],
  'Drinks': ['🍹', '🍺', '🍻', '🥤', '🧃', '🍋', '🫖', '☕', '🍵', '💧'],
  'Sauces': ['🧂', '🫙', '🥫', '🍶', '🥢'],
  'Other': ['📦', '🍽️', '🔥', '⭐', '💎', '🎁', '📋', '🔪', '🧊', '🫧'],
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
  currentEmoji?: string;
}

const EmojiPicker = ({ onSelect, onClose, currentEmoji }: EmojiPickerProps) => {
  const [activeCategory, setActiveCategory] = useState<string>(Object.keys(emojiCategories)[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmojis = searchTerm
    ? Object.values(emojiCategories)
        .flat()
        .filter((e, i, arr) => arr.indexOf(e) === i)
    : emojiCategories[activeCategory] || [];

  const uniqueEmojis = [...new Set(filteredEmojis)];

  return (
    <div className="bg-[#1e2128] border border-gray-600 rounded-xl p-3 w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-sm">Pick an Emoji</h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg leading-none">
            ×
          </button>
        )}
      </div>

      {/* Current emoji preview */}
      {currentEmoji && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-[#272a30] rounded-lg">
          <span className="text-3xl">{currentEmoji}</span>
          <span className="text-gray-400 text-sm">Current</span>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search emoji..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 mb-3 rounded-lg bg-[#272a30] border border-gray-600 text-white text-sm outline-none focus:border-yellow-500"
      />

      {/* Category tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {Object.keys(emojiCategories).map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setSearchTerm(''); }}
            className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap transition ${
              activeCategory === cat
                ? 'bg-yellow-500 text-black'
                : 'bg-[#272a30] text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
        {uniqueEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className={`text-2xl p-1 rounded hover:bg-[#272a30] transition ${
              emoji === currentEmoji ? 'ring-2 ring-yellow-500' : ''
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Quick select */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-gray-500 text-xs mb-2">Quick: Common Items</p>
        <div className="flex gap-1 flex-wrap">
          {['🍲', '🥩', '🦐', '🥬', '🍜', '🍹', '🧂', '📦'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className={`text-xl p-1 rounded hover:bg-[#272a30] transition ${
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
