import { X, ShieldCheck, Coins, Clock } from "lucide-react";

export const RulesModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
    <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
        <X size={24} />
      </button>
      
      <div className="p-8">
        <h2 className="text-2xl font-black text-white mb-6 tracking-tighter">PROTOCOL RULES</h2>
        
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="p-3 bg-purple-900/20 rounded-xl h-fit text-purple-400"><Clock size={24} /></div>
            <div>
              <h3 className="font-bold text-gray-200">The Timer</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                If the timer hits 00:00, the last King wins the entire Jackpot. Every bid resets the clock.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-3 bg-green-900/20 rounded-xl h-fit text-green-400"><Coins size={24} /></div>
            <div>
              <h3 className="font-bold text-gray-200">The Profit</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                If someone outbids you, you get your SOL back <span className="text-green-400 font-bold">+15% profit</span> instantly.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-3 bg-amber-900/20 rounded-xl h-fit text-amber-400"><ShieldCheck size={24} /></div>
            <div>
              <h3 className="font-bold text-gray-200">The Fee</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Bids increase by 30%. The difference feeds the Jackpot and your profit.
              </p>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="w-full mt-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
          UNDERSTOOD
        </button>
      </div>
    </div>
  </div>
);