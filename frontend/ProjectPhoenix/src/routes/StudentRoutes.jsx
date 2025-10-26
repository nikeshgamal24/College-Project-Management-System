import StudentDashboard from "@/features/student/dashboard/StudentDashboard";
import StudentArchive from "@/features/student/archive/StudentArchive";
import ProjectDetails from "@/features/student/archive/ProjectDetails";
import StudentGuidelines from "@/features/student/StudentGuidelines";
import StudentProject from "@/features/student/project/StudentProject";
import StudentProfileSettings from "@/features/student/settings/StudentProfileSettings";
import StudentNotices from "@/features/student/notices/StudentNotices";
import StudentHelpSupport from "@/features/student/helpSupport/StudentHelpSupport";

import { Navigate } from "react-router-dom";
import Error from "@/components/error/Error";
import ProjectProgress from "@/features/student/project/ProjectProgress";

const StudentRoutes = [
  {
    index: true,
    element: <Navigate replace to="dashboard" />,
    errorElement: <Error />,
  },
  {
    path: "dashboard",
    element: <StudentDashboard />,
    errorElement: <Error />,
  },
  {
    path: "project",
    element: <StudentProject />,
    errorElement: <Error />,
  },
  {
    path: "project/progress",
    element: <ProjectProgress />,
    errorElement: <Error />,
  },
  {
    path: "archive",
    element: <StudentArchive />,
    errorElement: <Error />,
  },
  {
    path: "archive/:id",
    element: <ProjectDetails />,
    errorElement: <Error />,
  },
  {
    path: "guidelines",
    element: <StudentGuidelines />,
    errorElement: <Error />,
  },
  {
    path: "notices",
    element: <StudentNotices />,
    errorElement: <Error />,
  },
  {
    path: "help-support",
    element: <StudentHelpSupport />,
    errorElement: <Error />,
  },
  {
    path: "settings",
    element: <StudentProfileSettings />,
    errorElement: <Error />,
  },
  // Temporary test route
  {
    path: "test-settings",
    element: <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-green-600">✅ Settings Route Working!</h1>
      <p className="mt-4">The route is connected. Now let's check the component.</p>
    </div>,
    errorElement: <Error />,
  },
];

export default StudentRoutes;
