"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Briefcase,
  FileText,
  Calendar,
  MessageSquare,
  Award,
  User,
  Users,
  BookOpen,
  BarChart,
  Settings,
  FolderOpen,
  GraduationCap,
  Handshake,
  Library,
  LayoutDashboard,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  role: "seeker" | "coach" | "both";
}

const getNavItems = (userRole: string): NavItem[] => [
  // Seeker Items
  {
    label: "Dashboard",
    href: "/seeker/dashboard",
    icon: <Briefcase className="h-[18px] w-[18px]" />,
    role: "seeker",
  },
  {
    label: "Documents",
    href: "/seeker/dashboard?section=documents",
    icon: <FolderOpen className="h-[18px] w-[18px]" />,
    role: "seeker",
  },
  {
    label: "Jobs",
    href: "/seeker/dashboard?section=jobs",
    icon: <Briefcase className="h-[18px] w-[18px]" />,
    role: "seeker",
  },
  {
    label: "Assessment",
    href: "/seeker/dashboard?section=assessment",
    icon: <GraduationCap className="h-[18px] w-[18px]" />,
    role: "seeker",
  },
  {
    label: "Coaches",
    href: "/seeker/dashboard?section=coaches",
    icon: <Handshake className="h-[18px] w-[18px]" />,
    role: "seeker",
  },
  {
    label: "Resources",
    href: "/seeker/dashboard?section=resources",
    icon: <Library className="h-[18px] w-[18px]" />,
    role: "seeker",
  },

  // Coach Items
  {
    label: "Dashboard",
    href: "/coach/dashboard",
    icon: <LayoutDashboard className="h-[18px] w-[18px]" />,
    role: "coach",
  },
  {
    label: "My Seekers",
    href: "/coach/seekers",
    icon: <Users className="h-[18px] w-[18px]" />,
    role: "coach",
  },
  {
    label: "Resources",
    href: "/coach/dashboard?section=resources",
    icon: <BookOpen className="h-[18px] w-[18px]" />,
    role: "coach",
  },
  {
    label: "Analytics",
    href: "/coach/analytics",
    icon: <BarChart className="h-[18px] w-[18px]" />,
    role: "coach",
  },

  // Shared Items
  {
    label: "Schedule",
    href: "/schedule",
    icon: <Calendar className="h-[18px] w-[18px]" />,
    role: "both",
  },
  {
    label: "Messages",
    href: userRole === "coach" ? "/coach/conversations" : "/seeker/conversations",
    icon: <MessageSquare className="h-[18px] w-[18px]" />,
    role: "both",
  },
];

export function DashboardSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Get the actual role from the session
  const userRole = session?.user?.role === "coach" ? "coach" : "seeker";

  const items = getNavItems(userRole);
  const filteredNavItems = items.filter(
    (item) => item.role === userRole || item.role === "both"
  );

  const isActiveLink = (href: string) => {
    if (href.includes("?")) {
      const [basePath, query] = href.split("?");
      const section = new URLSearchParams(query).get("section");
      return pathname === basePath && searchParams.get("section") === section;
    }
    return pathname === href;
  };

  return (
    <aside
      className="w-64 bg-background/60 backdrop-blur-sm border-r border-border/40 p-4 flex flex-col gap-6 shadow-sm"
      aria-label={`${userRole === "coach" ? "Coach" : "Job Seeker"} Dashboard Navigation`}
    >
      <div className="flex items-center gap-3 px-2" role="banner" aria-label="User Profile">
        <div
          className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center ring-1 ring-border/50"
          aria-hidden="true"
        >
          <User className="h-6 w-6 text-primary/80" />
        </div>
        <div>
          <h3 className="font-medium text-foreground/90" tabIndex={0}>
            {session?.user?.name || "User"}
          </h3>
          <p className="text-sm text-muted-foreground/80" aria-label="Account Type">
            {userRole === "coach" ? "Career Coach" : "Job Seeker"}
          </p>
        </div>
      </div>

      <nav
        className="flex flex-col gap-1"
        role="navigation"
        aria-label="Dashboard sections"
      >
        {filteredNavItems.map((item) => {
          const isActive = isActiveLink(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-3.5 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-foreground/70 hover:bg-primary/5 hover:text-foreground/90"
              }`}
              role="menuitem"
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={`transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-foreground/60 group-hover:text-primary/80"
                }`}
                aria-hidden="true"
              >
                {item.icon}
              </div>
              <span className={`text-[15px] ${isActive ? "font-medium" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}