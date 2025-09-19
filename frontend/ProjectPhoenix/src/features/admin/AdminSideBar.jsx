import {
  CalendarDays,
  Cctv,
  FileCheck,
  FolderGit2,
  GraduationCap,
  Home,
  Megaphone,
  Origami,
  Settings,
  ShieldCheck,
  BarChart3,
  HelpCircle,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { ROLES_LIST } from "@/lib/config";
import { isTabActive } from "@/lib/utils";
import CurrentClock from "../../components/CurrentClock";
import { useGetNoticesQuery } from "@/api/noticeApiSlice";

function AdminSideBar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const date = new Date();

  // Fetch notice count for sidebar
  const { data: noticesData } = useGetNoticesQuery({
    page: 1,
    limit: 1, // We only need the count, so limit to 1
  });
  
  const noticeCount = noticesData?.pagination?.totalItems || 0;

  return (
    <div className="hidden  border-r /40 md:block">
      <div className="sticky top-0 flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <div className="flex items-center gap-2 font-semibold select-none">
            <Origami className="h-5 w-5 lg:w-6 lg-h6" />
            <span className="hidden lg:block text-sm tracking-tight font-semibold leading-none">
              / Project Phoenix / Admin
            </span>
            <span className="block lg:hidden text-sm tracking-tight font-semibold leading-none">
              / Phoenix / Admin
            </span>
          </div>
        </div>
        <div className="flex-1">
          <nav className="grid  text-slate-600 items-start px-2 text-sm font-medium lg:px-4">
            <Link
              to={`/${ROLES_LIST.admin}/dashboard`}
              className={`flex items-center gap-3 rounded-md  px-3 py-2.5 ${
                isTabActive(currentPath, "dashboard")
                  ? "bg-slate-950 text-white"
                  : "hover:text-slate-950"
              } text-primary transition-all hover:pl-4`}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>

            <Link
              to={`/${ROLES_LIST.admin}/events`}
              className={`flex items-center gap-3 rounded-md  px-3 py-2.5 ${
                isTabActive(currentPath, "events")
                  ? "bg-slate-950 text-white"
                  : "hover:text-slate-950"
              } text-primary transition-all hover:pl-4`}
            >
              <CalendarDays className="h-4 w-4" />
              Events
            </Link>
            <Link
              to={`/${ROLES_LIST.admin}/defense`}
              className={`flex items-center gap-3 rounded-md  px-3 py-2.5 ${
                isTabActive(currentPath, "defense")
                  ? "bg-slate-950 text-white"
                  : "hover:text-slate-950"
              } text-primary transition-all hover:pl-4`}
            >
              <ShieldCheck className="h-4 w-4" />
              Defense
            </Link>
            <Link
              to={`/${ROLES_LIST.admin}/projects`}
              className={`flex items-center gap-3 rounded-md  px-3 py-2.5 ${
                isTabActive(currentPath, "projects")
                  ? "bg-slate-950 text-white"
                  : "hover:text-slate-950"
              } text-primary transition-all hover:pl-4`}
            >
              <FolderGit2 className="h-4 w-4" />
              Projects
            </Link>
            <Link
              to={`/${ROLES_LIST.admin}/students`}
              className={`flex items-center gap-3 rounded-md  px-3 py-2.5 ${
                isTabActive(currentPath, "students")
                  ? "bg-slate-950 text-white"
                  : "hover:text-slate-950"
              } text-primary transition-all hover:pl-4`}
            >
              <GraduationCap className="h-4 w-4" />
              Students
            </Link>
            <Link
              to={`/${ROLES_LIST.admin}/supervisors`}
              className={`flex items-center gap-3 rounded-md  px-3 py-2.5 ${
                isTabActive(currentPath, "supervisors")
                  ? "bg-slate-950 text-white"
                  : "hover:text-slate-950"
              } text-primary transition-all hover:pl-4 `}
            >
              <Cctv className="h-4 w-4" />
              Supervisors
            </Link>
            <Link
              to={`/${ROLES_LIST.admin}/user-management`}
              className={`flex items-center gap-3 rounded-md  px-3 py-2.5 ${
                isTabActive(currentPath, "user-management")
                  ? "bg-slate-950 text-white"
                  : "hover:text-slate-950"
              } text-primary transition-all hover:pl-4 `}
            >
              <Users className="h-4 w-4" />
              User Management
            </Link>
            <Link
              to={`/${ROLES_LIST.admin}/evaluators`}
              className={`flex items-center gap-3 rounded-md  px-3 py-2.5 ${
                isTabActive(currentPath, "evaluators")
                  ? "bg-slate-950 text-white"
                  : "hover:text-slate-950"
              } text-primary transition-all hover:pl-4 `}
            >
              <FileCheck className="h-4 w-4" />
              Evaluators
            </Link>
            <Link
              to={`/${ROLES_LIST.admin}/results`}
              className={`flex items-center gap-3 rounded-md  px-3 py-2.5 ${
                isTabActive(currentPath, "results")
                  ? "bg-slate-950 text-white"
                  : "hover:text-slate-950"
              } text-primary transition-all hover:pl-4`}
            >
              <BarChart3 className="h-4 w-4" />
              Results
            </Link>
            <Link
              to={`/${ROLES_LIST.admin}/help-support`}
              className={`flex items-center gap-3 rounded-md  px-3 py-2.5 ${
                isTabActive(currentPath, "help-support")
                  ? "bg-slate-950 text-white"
                  : "hover:text-slate-950"
              } text-primary transition-all hover:pl-4`}
            >
              <HelpCircle className="h-4 w-4" />
              Help & Support
            </Link>
            <Link
              to={`/${ROLES_LIST.admin}/notices`}
              className={`flex items-center gap-3 rounded-md  px-3 py-2.5 ${
                isTabActive(currentPath, "notices")
                  ? "bg-slate-950 text-white "
                  : "hover:text-slate-950"
              } text-primary transition-all hover:pl-4`}
            >
              <Megaphone className="h-4 w-4" />
              Notices
              {noticeCount > 0 && (
                <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                  isTabActive(currentPath, "notices")
                    ? "bg-slate-700 text-white"
                    : "bg-slate-200 text-slate-800"
                }`}>
                  {noticeCount}
                </span>
              )}
            </Link>
            <Link
              to={`/${ROLES_LIST.admin}/settings`}
              className={`flex items-center gap-3 rounded-md  px-3 py-2.5 ${
                isTabActive(currentPath, "settings")
                  ? "bg-slate-950 text-white"
                  : "hover:text-slate-950"
              } text-primary transition-all hover:pl-4`}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-4 ">
          <CurrentClock date={date} />
        </div>
      </div>
    </div>
  );
}

export default AdminSideBar;
