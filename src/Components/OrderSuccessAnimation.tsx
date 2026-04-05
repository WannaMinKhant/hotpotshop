// Order placement success animation
import { useEffect, useState } from 'react';

interface OrderSuccessAnimationProps {
  orderNumber: string;
  onComplete: () => void;
}

const OrderSuccessAnimation = ({ orderNumber, onComplete }: OrderSuccessAnimationProps) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 400);
    const t3 = setTimeout(() => setPhase(3), 800);
    const t4 = setTimeout(() => onComplete(), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  const confetti = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    duration: `${1 + Math.random() * 1.5}s`,
    color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 6],
    size: 4 + Math.random() * 8,
  }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150]">
      {/* Confetti */}
      {phase >= 1 && confetti.map(c => (
        <div
          key={c.id}
          className="absolute top-0 animate-confetti-fall"
          style={{
            left: c.left,
            animationDelay: c.delay,
            animationDuration: c.duration,
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}

      {/* Success card */}
      <div className={`bg-[#272a30] rounded-2xl border border-green-500 p-8 text-center transition-all duration-500 ${
        phase >= 2 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
      }`}>
        {/* Checkmark animation */}
        <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center transition-all duration-500 ${
          phase >= 2 ? 'scale-100 rotate-0' : 'scale-0 -rotate-180'
        }`}>
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
        <p className="text-yellow-400 font-mono text-lg mb-1">{orderNumber}</p>
        <p className="text-gray-400 text-sm">Sent to kitchen</p>
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-fall {
          animation: confetti-fall 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OrderSuccessAnimation;
