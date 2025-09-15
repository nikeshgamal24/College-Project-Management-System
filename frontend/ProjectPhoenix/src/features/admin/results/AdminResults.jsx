import { useRef } from "react";
import { useGetAllEventsQuery } from "../adminApiSlice";
import Loader from "@/components/Loader";
import ApiError from "@/components/error/ApiError";
import { Button } from "@/components/ui/button";
import { ChevronLeft, File, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EVENT_STATUS, ROLES_LIST } from "@/lib/config";
import { useNavigate } from "react-router-dom";
import { ResultDataTable } from "./ResultDataTable";
import { ResultColumns } from "./ResultColumns";
import { numberOfValues, numberOfDevelopingProjects } from "@/lib/utils";
import {
  Activity,
  CalendarCheck2,
  CheckCheck,
  Hammer,
} from "lucide-react";

function AdminResults() {
  const navigate = useNavigate();
  const tableRef = useRef();

  const {
    data: events,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetAllEventsQuery();

  let content;
  let numberOfActiveEvents,
    numberOfCompleteEvents,
    noOfDevelopingProjects,
    activeEvents,
    completeEvents;

  if (events) {
    numberOfActiveEvents = numberOfValues(
      events?.data,
      "eventStatus",
      EVENT_STATUS.Active
    );
    numberOfCompleteEvents = numberOfValues(
      events?.data,
      "eventStatus",
      EVENT_STATUS.Complete
    );

    noOfDevelopingProjects = numberOfDevelopingProjects(
      events?.data,
      "eventStatus",
      EVENT_STATUS.Active
    );
  }

  if (events) {
    activeEvents = events.data.filter(
      (event) => event.eventStatus === EVENT_STATUS.Active
    );
    completeEvents = events.data.filter(
      (event) => event.eventStatus === EVENT_STATUS.Complete
    );
  }

  if (isLoading) {
    content = <Loader />;
  } else if (isSuccess) {
    if (!events) {
      content = (
        <div className="flex flex-1 items-center justify-center bg-slate-50 ">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              You have no Events
            </h3>
            <p className="text-sm text-gray-500">
              No events available to view results.
            </p>
          </div>
        </div>
      );
    } else {
      content = (
        <div>
          <div className="text-xl font-semibold tracking-tight flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            Results
          </div>
          <div className="grid gap-4 grid-cols-2 md:gap-8 xl:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Hosted Events
                </CardTitle>
                <CalendarCheck2 className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.data.length}</div>
                <p className="text-xs text-gray-500 text-right">all events</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Events
                </CardTitle>
                <Activity className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{numberOfActiveEvents}</div>
                <p className="text-xs text-gray-500 text-right">
                  running events
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Developing Projects
                </CardTitle>
                <Hammer className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {noOfDevelopingProjects}
                </div>
                <p className="text-xs text-gray-500 text-right">
                  enrolled projects
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Complete Events
                </CardTitle>
                <CheckCheck className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {numberOfCompleteEvents}
                </div>
                <p className="text-xs text-gray-500 text-right">
                  successful events
                </p>
              </CardContent>
            </Card>
          </div>
          <Tabs className="mt-4" defaultValue="active">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="complete" className="hidden lg:inline-flex">
                  Complete
                </TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className=" h-10 gap-1 text-sm"
                  onClick={() => tableRef.current?.exportCSV()}
                >
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Export</span>
                </Button>
              </div>
            </div>
            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <CardTitle>Active Events</CardTitle>
                  <CardDescription>
                    Currently active events on the system - Click to view results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResultDataTable
                    ref={tableRef}
                    columns={ResultColumns}
                    data={activeEvents}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="complete">
              <Card>
                <CardHeader>
                  <CardTitle>Complete Events</CardTitle>
                  <CardDescription>
                    All the completed events on the system - Click to view results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResultDataTable
                    ref={tableRef}
                    columns={ResultColumns}
                    data={completeEvents}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>All Events</CardTitle>
                  <CardDescription>
                    All the events on the system - Click to view results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResultDataTable
                    ref={tableRef}
                    columns={ResultColumns}
                    data={events.data}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      );
    }
  } else if (isError) {
    content = <ApiError error={error} />;
  }

  return content;
}

export default AdminResults;
