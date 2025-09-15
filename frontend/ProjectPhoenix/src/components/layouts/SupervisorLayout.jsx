import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Input } from "@/components/ui/input";

import { Dot, Loader2, Search, Settings, User, HelpCircle, LogOut, Edit3 } from "lucide-react";

import useLogout from "@/hooks/useLogout";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  DESCRIPTION_CATEGORY_SET,
  PROGRAM_CODE,
  ROLES_LIST,
} from "@/lib/config";
import BreadCrumbGenerator from "../BreadCrumbGenerator";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn, getInitials } from "@/lib/utils";

import { useEffect, useState } from "react";

import { AlertDialog, AlertDialogContent } from "../ui/alert-dialog";
import { toast } from "../ui/use-toast";
import StudentSideBar from "@/features/student/StudentSideBar";
import StudentMobileSideBar from "@/features/student/StudentMobileSideBar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Controller, useForm } from "react-hook-form";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { useUpdateStudentMutation } from "@/features/student/studentApiSlice";
import { Badge } from "../ui/badge";
import { useUpdateSupervisorMutation } from "@/features/supervisor/supervisorApiSlice";
import SupervisorSideBar from "@/features/supervisor/SupervisorSideBar";
import SupervisorMobileSideBar from "@/features/supervisor/SupervisorMobileSideBar";
import { Helmet } from "react-helmet-async";

function SupervisorLayout() {
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm();
  const [logoutLoader, setLogoutLoader] = useState(false);
  const [skillSet, setSkillSet] = useState(DESCRIPTION_CATEGORY_SET);
  const location = useLocation();
  const logout = useLogout();

  const user = useSelector(selectCurrentUser);
  const [updateSupervisor] = useUpdateSupervisorMutation();

  const selectedSkillSet = skillSet.filter((skill) => skill.selected === true);

  // Calculate profile completion percentage
  const getProfileCompletion = () => {
    const fields = [
      user.fullname,
      user.email,
      user.phoneNumber,
      user.designation,
      user.institution,
      user.skillSet,
      user.photo
    ];
    const completedFields = fields.filter(field => {
      if (Array.isArray(field)) {
        return field && field.length > 0;
      }
      return field && field !== "";
    }).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const crumbs = location.pathname.split("/").filter((crumb) => {
    if (crumb !== "" && crumb != ROLES_LIST.supervisor) {
      return crumb;
    }
  });

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
  const onUpdate = async (data) => {
    try {
      const creds = {
        data: {
          phoneNumber: user.phoneNumber || data.phoneNumber,
          designation: user.designation || data.designation,
          institution: user.institution || data.institution,
          skillSet: selectedSkillSet.map((skill) => skill.category),
        },
        id: user._id,
      };
      const res = await updateSupervisor(creds);

      if (!res.error) {
        reset();
        toast({
          title: "Account Updated successfully!",
          description: "You can now continue.",
        });
        navigate(0);
      } else {
        throw new Error("Try again");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something Went Wrong!!",
        description: error.message,
      });
    }
  };

  if (
    !user.phoneNumber ||
    !user.skillSet ||
    !user.designation ||
    !user.institution
  ) {
    return (
      <div className="w-full h-full fixed top-0 left-0 bg-white z-40 flex justify-center items-center">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-lg">
              Remaing Info for {user.fullname}
            </CardTitle>
            <CardDescription>
              Enter your information to complete your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onUpdate)} className="grid gap-4">
              {!user.designation && (
                <div className="grid gap-2">
                  <Label htmlFor="designation">
                    {errors.designation ? (
                      <span className="text-red-500">
                        {errors.designation.message}
                      </span>
                    ) : (
                      <span>Designation</span>
                    )}
                  </Label>
                  <Input
                    id="designation"
                    {...register("designation", {
                      required: "Designation is required",
                    })}
                    className={errors.designation ? "border-red-500" : ""}
                  />
                </div>
              )}
              {!user.institution && (
                <div className="grid gap-2">
                  <Label htmlFor="institution">
                    {errors.institution ? (
                      <span className="text-red-500">
                        {errors.institution.message}
                      </span>
                    ) : (
                      <span>
                        Institution{" "}
                        <span className="text-xs text-slate-400">
                          {" "}
                          (Abbreviation preferred)
                        </span>
                      </span>
                    )}
                  </Label>
                  <Input
                    id="institution"
                    {...register("institution", {
                      required: "Institute is required",
                    })}
                    className={errors.institution ? "border-red-500" : ""}
                  />
                </div>
              )}
              {!user.phoneNumber && (
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">
                    {errors.phoneNumber ? (
                      <span className="text-red-500">
                        {errors.phoneNumber.message}
                      </span>
                    ) : (
                      <span>Phone number</span>
                    )}
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="number"
                    {...register("phoneNumber", {
                      required: "Phone Number is required",
                      pattern: {
                        value: /^9\d{9}$/,
                        message: "Invalid phone number",
                      },
                    })}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                </div>
              )}

              <div className="grid gap-4 mb-4">
                <Label htmlFor="skillSet">
                  Your Expertiese{" "}
                  <span className="text-xs text-slate-400">
                    {" "}
                    (select atleast 3)
                  </span>
                </Label>
                <div className="flex flex-wrap gap-1">
                  {skillSet.map((skill) => {
                    return (
                      <Badge
                        variant={skill.selected ? "" : "outline"}
                        key={skill.id}
                        size="sm "
                        className="cursor-pointer"
                        onClick={() =>
                          setSkillSet((prev) => {
                            return prev.map((p) => {
                              if (p.id === skill.id) {
                                return {
                                  ...p,
                                  selected: !p.selected,
                                };
                              } else {
                                return {
                                  ...p,
                                };
                              }
                            });
                          })
                        }
                      >
                        {skill.category}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {isSubmitting ? (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting..
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={selectedSkillSet.length < 3}
                  className="w-full"
                >
                  Submit
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Phoenix | Supervisor</title>
      </Helmet>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <SupervisorSideBar />
        <div className="flex flex-col">
          <header className="flex sticky top-0 h-14 items-center gap-4 z-50 bg-slate-100/50 backdrop-filter backdrop-blur-lg px-4 lg:h-[60px] lg:px-6">
            <SupervisorMobileSideBar />
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem className="hidden lg:block">
                  {user.fullname ? user.fullname : "Supervisor"}
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden lg:block" />
                <BreadCrumbGenerator role={"supervisor"} crumbs={crumbs} />
              </BreadcrumbList>
            </Breadcrumb>

            <div className="relative ml-auto flex-1 md:grow-0">
              <Select>
                <SelectTrigger className="md:w-[200px] lg:w-[246px] ">
                  <div className="flex items-center gap-2">
                    <Dot
                      strokeWidth={8}
                      className={cn(
                        "w-5 h-5" && user.isAvailable
                          ? "text-green-500"
                          : "text-red-500"
                      )}
                    />
                    {user.isAvailable
                      ? "Accepting Projects"
                      : "Not Accepting Projects"}{" "}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex">Accepting Projects</div>
                  </SelectItem>
                  <SelectItem value="dark">Not Accepting Projects</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative">
                  <Avatar className="cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all">
                    <AvatarImage src={user.photo} />
                    <AvatarFallback className="bg-slate-200">
                      {getInitials(user.fullname)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Profile completion notification badge */}
                  {getProfileCompletion() < 100 && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">!</span>
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                {/* Profile Summary Card */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarImage src={user.photo} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {getInitials(user.fullname)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {user.fullname}
                      </h3>
                      <p className="text-xs text-gray-600 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Supervisor
                        </span>
                        {user.isAvailable && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Accepting Projects
                          </span>
                        )}
                      </div>
                      
                      {/* Profile Completion Indicator */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Profile Completion</span>
                          <span className="font-medium">{getProfileCompletion()}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              getProfileCompletion() >= 80 ? 'bg-green-500' : 
                              getProfileCompletion() >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${getProfileCompletion()}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Quick Complete Profile Button */}
                      {getProfileCompletion() < 100 && (
                        <div className="mt-3">
                          <button
                            onClick={() => navigate("/1984/settings")}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                          >
                            <Edit3 className="h-3 w-3" />
                            Complete Profile
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-2">
                  <DropdownMenuGroup>
                    <DropdownMenuItem 
                      onClick={() => navigate("/1984/settings")}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-blue-50"
                    >
                      <Settings className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium">Profile Settings</div>
                        <div className="text-xs text-gray-500">Manage your account</div>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => navigate("/1984/dashboard")}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-blue-50"
                    >
                      <User className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium">Dashboard</div>
                        <div className="text-xs text-gray-500">View your overview</div>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => navigate("/1984/archive")}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-blue-50"
                    >
                      <Edit3 className="h-4 w-4 text-purple-600" />
                      <div className="flex-1">
                        <div className="font-medium">Archive</div>
                        <div className="text-xs text-gray-500">View archived projects</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="my-2" />

                  {/* Support & Help */}
                  <DropdownMenuItem 
                    onClick={() => navigate(`/${ROLES_LIST.supervisor}/help-support`)}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-blue-50"
                  >
                    <HelpCircle className="h-4 w-4 text-orange-600" />
                    <div className="flex-1">
                      <div className="font-medium">Help & Support</div>
                      <div className="text-xs text-gray-500">Get assistance</div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-2" />

                  {/* Logout */}
                  <DropdownMenuItem 
                    onClick={handlelogout}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-red-50 text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">Sign Out</div>
                      <div className="text-xs text-gray-500">Logout from your account</div>
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
          <div className="flex justify-center items-center text-slate-600">
            <Loader2 className="h-6 w-6 animate-spin mr-4" />
            <span className="text-sm whitespace-nowrap">Logging Out</span>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default SupervisorLayout;
