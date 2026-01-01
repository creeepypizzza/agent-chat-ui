"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigation } from "../../hooks/useNavigation";

export function Sidebar() {
  const pathname = usePathname();
  const { items, loading, error } = useNavigation();
  
  return (
    <nav className="w-16 lg:w-56 flex flex-col border-r border-[#30363d] bg-[#161b22] shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center justify-center lg:justify-start lg:px-4 border-b border-[#30363d]">
        <div className="w-8 h-8 bg-gradient-to-br from-[#58a6ff] to-[#238636] rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">H</span>
        </div>
        <span className="hidden lg:block ml-3 font-bold text-[#f0f6fc]">Hacker AI</span>
      </div>
      
      {/* Nav Items */}
      <div className="flex-1 py-4">
        {loading ? (
          <div className="text-center text-[#8b949e] text-sm py-4">
            Loading...
          </div>
        ) : (
          items.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                title={item.description}
                className={`flex items-center h-10 px-4 mx-2 rounded-md transition-colors ${
                  isActive 
                    ? "bg-[#1f6feb26] text-[#58a6ff] border-l-2 border-[#58a6ff]" 
                    : "text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="hidden lg:block ml-3 text-sm font-medium">{item.label}</span>
              </Link>
            );
          })
        )}
        
        {error && (
          <div className="hidden lg:block text-xs text-[#f85149] px-4 mt-2">
            ⚠ Using offline mode
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-[#30363d]">
        <div className="hidden lg:block text-xs text-[#8b949e]">
          <div>v0.1.0</div>
          <div className="text-[#484f58]">Phase 11</div>
        </div>
      </div>
    </nav>
  );
}
