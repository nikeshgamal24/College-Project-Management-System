import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CalendarClock } from "lucide-react";
import StudentEventsTimeline from "./StudentEventsTimeline";
import NoticeBoard from "@/components/NoticeBoard";

import TargetedEvent from "./TargetedEvent";
import StudentInfo from "./StudentInfo";

function StudentDashboard() {
  return (
    <main className="grid flex-1 items-start gap-4  md:gap-6 lg:grid-cols-2 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-6 lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4">
          <StudentInfo />
        </div>
        <TargetedEvent />
      </div>
      <div className="grid auto-rows-max items-start gap-4 md:gap-6 lg:col-span-2 xl:col-span-1">
        <NoticeBoard userRole="Student" limit={3} />
        <Card>
          <CardHeader className="flex flex-row rounded-t-md border-b py-4 bg-slate-100 justify-between items-center">
            <div>
              <CardTitle className="text-lg">Events Timeline</CardTitle>
              <CardDescription className="text-xs">
                Timeline of the ongoing events
              </CardDescription>
            </div>

            <CalendarClock className="text-slate-500" />
          </CardHeader>
          <CardContent className="text-sm pt-8 pb-0">
            <StudentEventsTimeline />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default StudentDashboard;
