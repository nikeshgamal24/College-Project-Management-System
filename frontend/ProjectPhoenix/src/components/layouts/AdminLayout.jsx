import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Input } from "@/components/ui/input";

import { Loader2, Search } from "lucide-react";

import AdminSideBar from "../../features/admin/AdminSideBar";
import AdminMobileSideBar from "../../features/admin/AdminMobileSideBar";
import useLogout from "@/hooks/useLogout";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ROLES_LIST } from "@/lib/config";
import BreadCrumbGenerator from "../BreadCrumbGenerator";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/utils";
import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogContent } from "../ui/alert-dialog";
import { toast } from "../ui/use-toast";
import ScrollToTop from "../ScrollToTop";
import { Helmet } from "react-helmet-async";

function AdminLayout() {
  const [logoutLoader, setLogoutLoader] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();

  const user = useSelector(selectCurrentUser);

  const crumbs = location.pathname.split("/").filter((crumb) => {
    if (crumb !== "" && crumb != ROLES_LIST.admin) {
      return crumb;
    }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const handlelogout = async () => {
    try {
      setLogoutLoader(true);
      await logout();
      setLogoutLoader(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong!!",
        description: error.message,
      });
    }
  };

  const handleProfileSettings = () => {
    navigate(`/${ROLES_LIST.admin}/settings`);
  };

  const handleDashboard = () => {
    navigate(`/${ROLES_LIST.admin}/dashboard`);
  };

  const handleEvents = () => {
    navigate(`/${ROLES_LIST.admin}/events`);
  };

  const handleDefense = () => {
    navigate(`/${ROLES_LIST.admin}/defense`);
  };

  const handleSupervisors = () => {
    navigate(`/${ROLES_LIST.admin}/supervisors`);
  };

  const handleEvaluators = () => {
    navigate(`/${ROLES_LIST.admin}/evaluators`);
  };

  const handleNotices = () => {
    navigate(`/${ROLES_LIST.admin}/notices`);
  };
  return (
    <>
      <Helmet>
        <title>Phoenix | Admin</title>
      </Helmet>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <AdminSideBar />
        <div className="flex flex-col">
          <header className="flex sticky top-0 h-14 items-center gap-4 z-50 bg-slate-100/50 backdrop-filter backdrop-blur-lg px-4 lg:h-[60px] lg:px-6">
            <AdminMobileSideBar />
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem className="hidden lg:block">
                  {user.fullname ? user.fullname.split(" ")[0] : "Admin"}
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden lg:block" />
                <BreadCrumbGenerator role={"admin"} crumbs={crumbs} />
              </BreadcrumbList>
            </Breadcrumb>

            <div className="relative ml-auto flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search Projects, Students, .."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all">
                  <AvatarImage src={user.photo} />
                  <AvatarFallback className="bg-slate-200">
                    {getInitials(user.fullname)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                {/* Profile Overview Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                      <AvatarImage src={user.photo} />
                      <AvatarFallback className="text-lg font-bold bg-blue-100 text-blue-700">
                        {getInitials(user.fullname)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {user.fullname || "Admin User"}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {user.email || "admin@example.com"}
                      </p>
                      <div className="flex gap-1 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Admin
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          System Admin
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Profile Completion Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Profile Completion</span>
                      <span>100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                </div>

                {/* Navigation Menu */}
                <div className="py-2">
                  <DropdownMenuItem 
                    onClick={handleDashboard}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Dashboard</div>
                      <div className="text-sm text-gray-500">View your overview</div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    onClick={handleEvents}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Events</div>
                      <div className="text-sm text-gray-500">Manage events and schedules</div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    onClick={handleDefense}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Defense</div>
                      <div className="text-sm text-gray-500">Manage defense sessions</div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    onClick={handleSupervisors}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Supervisors</div>
                      <div className="text-sm text-gray-500">Manage supervisors</div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    onClick={handleEvaluators}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Evaluators</div>
                      <div className="text-sm text-gray-500">Manage evaluators</div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    onClick={handleNotices}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Notices</div>
                      <div className="text-sm text-gray-500">Manage notices and announcements</div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    onClick={handleProfileSettings}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Settings</div>
                      <div className="text-sm text-gray-500">Manage your account</div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Help & Support</div>
                      <div className="text-sm text-gray-500">Get assistance</div>
                    </div>
                  </DropdownMenuItem>

                  <div className="border-t my-2"></div>

                  <DropdownMenuItem 
                    onClick={handlelogout}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600"
                  >
                    <div className="p-2 bg-red-100 rounded-lg">
                      <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Sign Out</div>
                      <div className="text-sm text-red-500">Logout from your account</div>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex flex-1 flex-col  p-4  lg:px-6 bg-slate-50">
            <Outlet />
          </main>
        </div>
      </div>
      <AlertDialog open={logoutLoader} onOpenChange={setLogoutLoader}>
        <AlertDialogContent className="w-[200px]">
          <div className="flex justify-center items-center text-gray-600">
            <Loader2 className="h-6 w-6 animate-spin mr-4" />
            <span className="text-sm whitespace-nowrap">Logging Out</span>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default AdminLayout;
