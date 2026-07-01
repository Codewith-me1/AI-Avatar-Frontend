// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { Mic, Settings, BookOpen, Layers } from "lucide-react";
// import { motion } from "framer-motion";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen text-slate-800 flex overflow-hidden relative">
//       {/* Glow effects in background */}
//       <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#DCD6F7]/20 rounded-full blur-[120px] pointer-events-none" />
//       <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#A6B1E1]/10 rounded-full blur-[150px] pointer-events-none" />

//       {/* Sidebar - Clean Transparent Sidebar matching Reference Image */}
//       <nav className="relative z-10 w-64 flex flex-col p-6 pr-4 gap-1 flex-none">
//         <div className="mb-8 px-2">
//           <Link href="/" className="flex items-center gap-3 group">
//             <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A6B1E1] to-[#424874] flex items-center justify-center text-white font-bold shadow-md shadow-[#424874]/10 transition-transform group-hover:scale-105">
//               <Mic size={18} className="animate-pulse" />
//             </div>
//             <div>
//               <span className="font-extrabold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#424874] to-slate-800">
//                 VoiceAgent
//               </span>
//               <p className="text-[9px] text-[#A6B1E1] font-bold tracking-wider uppercase">Console</p>
//             </div>
//           </Link>
//         </div>

//         <div className="space-y-1 flex-1">
//           <p className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Workspace</p>
//           <NavItem href="/dashboard" label="Agents" icon={<Layers size={16} />} />
//           <NavItem href="/dashboard/settings" label="Settings" icon={<Settings size={16} />} />
//           <NavItem href="/docs" label="Docs" icon={<BookOpen size={16} />} external />
//         </div>

//         <div className="mt-auto pt-6 border-t border-slate-200/40">
//           <div className="px-3 py-2.5 rounded-xl bg-white/50 border border-slate-200/30 flex flex-col gap-1 shadow-sm">
//             <div className="flex items-center justify-between">
//               <span className="text-[10px] font-semibold text-slate-500">Console Version</span>
//               <span className="px-1.5 py-0.5 rounded bg-[#DCD6F7]/80 text-[9px] text-[#424874] font-extrabold shadow-sm">v1.0</span>
//             </div>
//             <div className="flex items-center gap-1.5 mt-1">
//               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-400/50" />
//               <span className="text-[10px] text-slate-500 font-semibold">System Online</span>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Main Container - Rounded Borders with Spacing in Page Sides */}
//       <main className="relative z-10 flex-1 flex flex-col min-w-0 my-4 mr-4 ml-1 bg-white border border-slate-200/50 rounded-[24px] shadow-sm overflow-hidden">
//         <div className="flex-1 overflow-auto">
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// }

// function NavItem({
//   href,
//   label,
//   icon,
//   external,
// }: {
//   href: string;
//   label: string;
//   icon: React.ReactNode;
//   external?: boolean;
// }) {
//   const pathname = usePathname();
//   const isActive = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));

//   return (
//     <Link
//       href={href}
//       target={external ? "_blank" : undefined}
//       rel={external ? "noopener noreferrer" : undefined}
//       className={`
//         relative px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all duration-200 group
//         ${
//           isActive
//             ? "text-[#424874] bg-[#DCD6F7]/85 shadow-sm border border-white/60 font-bold"
//             : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/40 border border-transparent"
//         }
//       `}
//     >
//       <span className={isActive ? "text-[#424874]" : "text-slate-400 group-hover:text-slate-500 transition-colors"}>
//         {icon}
//       </span>
//       <span>{label}</span>

//       {isActive && (
//         <motion.div
//           layoutId="sidebar-indicator"
//           className="absolute left-0 w-0.5 h-5 bg-[#424874] rounded-r"
//           transition={{ type: "spring", stiffness: 380, damping: 30 }}
//         />
//       )}
//     </Link>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Layers,
  Volume2,
  Code,
  Activity,
  MessageSquare,
  ChevronRight,
  Gem,
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-white font-sans text-gray-900 selection:bg-gray-200">
      {/* Sidebar - Matching Reference Image */}
      <nav className="w-[260px] flex-shrink-0 bg-[#fbfbfb] border-r border-gray-200 flex flex-col h-screen relative z-20">
        {/* Header / Logo */}
        <div className="h-20 flex items-center px-6 mb-2">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-rose-500 rounded-full mr-1" />
            <span className="font-extrabold text-xl tracking-tight text-black">
              AVAT<span className="font-medium"> Avatar</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-8 no-scrollbar">
          {/* Playground Section */}
          <div>
            <p className="px-3 text-[11px] font-medium text-gray-500 mb-3">
              Playground
            </p>
            <div className="space-y-0.5">
              <NavItem
                href="/dashboard"
                label="Avatars"
                icon={<User size={18} strokeWidth={2} />}
              />
            </div>
          </div>

          {/* Developers Section */}
          <div>
            <p className="px-3 text-[11px] font-medium text-gray-500 mb-3">
              Developers
            </p>
            <div className="space-y-0.5">
              <NavItem
                href="/dashboard/settings"
                label="Settings"
                icon={<Code size={18} strokeWidth={2} />}
              />
            </div>
          </div>
        </div>

        {/* Bottom Profile Section */}
        <div className="p-4 mt-auto">
          <div className="flex flex-col gap-3 px-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-gray-500 text-white text-[10px] font-bold">
                Free
              </span>
              <span className="text-sm font-medium text-gray-600">
                0.4 credits left
              </span>
            </div>
            <Link
              href="/pricing"
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <Gem size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">Pricing</span>
            </Link>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-medium">
                A
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 leading-none mb-1">
                  Default Space
                </span>
                <span className="text-xs text-gray-500 leading-none">Free</span>
              </div>
            </div>
            <ChevronRight
              size={16}
              className="text-gray-400 group-hover:text-gray-600"
            />
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative z-10 h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  // Using explicit logic to highlight "Contexts" when on /dashboard
  const isActive =
    pathname === href || (href === "/dashboard" && pathname === "/dashboard");

  return (
    <Link
      href={href}
      className={`
        relative p-2! rounded-lg text-sm flex items-center gap-3 transition-colors
        ${
          isActive
            ? "bg-gray-100/80 text-black font-semibold"
            : "text-gray-600 hover:text-black hover:bg-gray-50 font-medium"
        }
      `}
    >
      <span className={isActive ? "text-black" : "text-gray-500"}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
