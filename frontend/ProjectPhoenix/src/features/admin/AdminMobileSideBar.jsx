import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ROLES_LIST } from "@/lib/config";
import {
  CalendarDays,
  Cctv,
  FileCheck,
  FolderGit2,
  GraduationCap,
  Home,
  Megaphone,
  Menu,
  Origami,
  Settings,
  ShieldCheck,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { isTabActive } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useGetNoticesQuery } from "@/api/noticeApiSlice";

function AdminMobileSideBar() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Fetch notice count for mobile sidebar
  const { data: noticesData } = useGetNoticesQuery({
    page: 1,
    limit: 1, // We only need the count, so limit to 1
  });
  
  const noticeCount = noticesData?.pagination?.totalItems || 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-slate-600 text-lg font-medium">
          <div className="hidden lg:flex items-center gap-2 text-base font-semibold ">
            <Origami className="h-6 w-6" />
            <span> / Project Phoenix / Admin</span>
          </div>
          <div className="flex lg:hidden items-center gap-2 text-base font-semibold ">
            <Origami className="h-6 w-6" />
            <span> / Phoenix / Admin</span>
          </div>
          <SheetClose asChild>
            <Link
              to={`/${ROLES_LIST.admin}/dashboard`}
              className={`mx-[-0.65rem] mt-4 flex items-center ${
                isTabActive(currentPath, "dashboard")
                  ? "bg-slate-950 text-white"
                  : ""
              }  gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground`}
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              to={`/${ROLES_LIST.admin}/events`}
              className={`mx-[-0.65rem]  flex items-center ${
                isTabActive(currentPath, "events")
                  ? "bg-slate-950 text-white"
                  : ""
              }  gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground`}
            >
              <CalendarDays className="h-5 w-5" />
              Events
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              to={`/${ROLES_LIST.admin}/defense`}
              className={`mx-[-0.65rem]  flex items-center ${
                isTabActive(currentPath, "defense")
                  ? "bg-slate-950 text-white"
                  : ""
              }  gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground`}
            >
              <ShieldCheck className="h-5 w-5" />
              Defense
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              to={`/${ROLES_LIST.admin}/projects`}
              className={`mx-[-0.65rem]  flex items-center ${
                isTabActive(currentPath, "projects")
                  ? "bg-slate-950 text-white"
                  : ""
              }  gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground`}
            >
              <FolderGit2 className="h-5 w-5" />
              Projects
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              to={`/${ROLES_LIST.admin}/students`}
              className={`mx-[-0.65rem]  flex items-center ${
                isTabActive(currentPath, "students")
                  ? "bg-slate-950 text-white"
                  : ""
              }  gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground`}
            >
              <GraduationCap className="h-5 w-5" />
              Students
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              to={`/${ROLES_LIST.admin}/supervisors`}
              className={`mx-[-0.65rem]  flex items-center ${
                isTabActive(currentPath, "supervisors")
                  ? "bg-slate-950 text-white"
                  : ""
              }  gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground`}
            >
              <Cctv className="h-5 w-5" />
              Supervisors
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              to={`/${ROLES_LIST.admin}/evaluators`}
              className={`mx-[-0.65rem]  flex items-center ${
                isTabActive(currentPath, "evaluators")
                  ? "bg-slate-950 text-white"
                  : ""
              }  gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground`}
            >
              <FileCheck className="h-5 w-5" />
              Evaluators
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              to={`/${ROLES_LIST.admin}/results`}
              className={`mx-[-0.65rem]  flex items-center ${
                isTabActive(currentPath, "results")
                  ? "bg-slate-950 text-white"
                  : ""
              }  gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground`}
            >
              <BarChart3 className="h-5 w-5" />
              Results
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              to={`/${ROLES_LIST.admin}/help-support`}
              className={`mx-[-0.65rem]  flex items-center ${
                isTabActive(currentPath, "help-support")
                  ? "bg-slate-950 text-white"
                  : ""
              }  gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground`}
            >
              <HelpCircle className="h-5 w-5" />
              Help & Support
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              to={`/${ROLES_LIST.admin}/notices`}
              className={`mx-[-0.65rem]  flex items-center ${
                isTabActive(currentPath, "notices")
                  ? "bg-slate-950 text-white"
                  : ""
              }  gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground`}
            >
              <Megaphone className="h-5 w-5" />
              Notices
              <Badge
                variant="secondary"
                className={`ml-auto flex shrink-0 items-center justify-center rounded-full ${
                  isTabActive(currentPath, "notices")
                    ? "bg-slate-700 text-white"
                    : "bg-slate-200 text-slate-800"
                }`}
              >
                {noticeCount}
              </Badge>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              to={`/${ROLES_LIST.admin}/settings`}
              className={`mx-[-0.65rem]  flex items-center ${
                isTabActive(currentPath, "settings")
                  ? "bg-slate-950 text-white"
                  : ""
              }  gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground`}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default AdminMobileSideBar;
