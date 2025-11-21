import { LayoutDashboard, BookOpen, Calendar, FileText } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "Journal", icon: BookOpen, url: "/journal" },
  { title: "Calendar", icon: Calendar, url: "/calendar" },
  { title: "Reports", icon: FileText, url: "/reports" },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">Chivunk</h1>
        <p className="text-xs text-muted-foreground mt-1">Trading Journal</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
                activeClassName="bg-secondary/50 text-primary font-medium border border-primary/20"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">Performance Today</p>
          <p className="text-success mt-1">+$420.50</p>
        </div>
      </div>
    </aside>
  );
}
