import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Cctv,
  FileCheck,
  GraduationCap,
  ShieldCheck,
  ShieldHalf,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ROLES_LIST, animationProps } from "@/lib/config";
import { motion } from "framer-motion";
import Phoenix from "./Phoenix";

function Landing() {
  return (
    <>
      <div className="col-span-12 max-w-lg mx-auto text-center pt-12 pb-10">
        <Phoenix className="mx-auto" />
        <h2 className="font-bold text-lg lg:text-xl pt-2 tracking-tight leading-none">
          Project Phoenix
        </h2>
        <h1 className="font-bold text-2xl lg:text-3xl pt-2 tracking-tight leading-10">
          New Proposal, Whole Notion
        </h1>
        <p className="text-slate-500">
          A Complete Solution for your College Projects.
        </p>
      </div>

      {/* Portals Card */}
      <Card className="mt-6 col-span-12 w-[350px] max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Portals</CardTitle>
          <CardDescription>
            Click the link below to access your portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to={`${ROLES_LIST.student}/login?tab=login`}>
            <Button className="w-full mt-0" variant="secondary">
              <GraduationCap className="mr-2 h-4 w-4" /> Student
            </Button>
          </Link>

          <Link to={`${ROLES_LIST.supervisor}/login?tab=login`}>
            <Button className="w-full mt-4" variant="secondary">
              <Cctv className="mr-2 h-4 w-4" /> Supervisor
            </Button>
          </Link>

          <Link to={`${ROLES_LIST.defense}/login`}>
            <Button className="w-full mt-4" variant="secondary">
              <ShieldCheck className="mr-2 h-4 w-4" /> Defense
            </Button>
          </Link>

          <Link to={`${ROLES_LIST.admin}/login`}>
            <Button className="w-full mt-4" variant="secondary">
              <ShieldHalf className="mr-2 h-4 w-4" />
              Administrator
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* ==== IMPROVED: Demo Credentials Section ==== */}
      <Card className="mt-10 col-span-12 max-w-2xl mx-auto border border-slate-200 shadow-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">Try It Out – Demo Access</CardTitle>
          <CardDescription className="text-base">
            Log in instantly with these demo accounts (all features unlocked for viewing)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <GraduationCap className="h-6 w-6 text-indigo-600" />
                <h3 className="font-bold text-indigo-900">Student</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-slate-600">Email:</span>
                  <code className="font-mono bg-white px-2 py-1 rounded border">nikesh.gamal24@gmail.com</code>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-600">Password:</span>
                  <code className="font-mono bg-white px-2 py-1 rounded border">Pokhara123$</code>
                </p>
              </div>
            </div>

            {/* Supervisor */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <Cctv className="h-6 w-6 text-purple-600" />
                <h3 className="font-bold text-purple-900">Supervisor</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-slate-600">Email:</span>
                  <code className="font-mono bg-white px-2 py-1 rounded border">nikesh.191624@ncit.edu.np</code>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-600">Password:</span>
                  <code className="font-mono bg-white px-2 py-1 rounded border">Pokhara123$</code>
                </p>
              </div>
            </div>


            {/* Administrator */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-200">
              <div className="flex items-center gap-3 mb-3">
                <ShieldHalf className="h-6 w-6 text-amber-700" />
                <h3 className="font-bold text-amber-900">Administrator</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-slate-600">Email:</span>
                  <code className="font-mono bg-white px-2 py-1 rounded border">nikesh.191624@ncit.edu.np</code>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-600">Password:</span>
                  <code className="font-mono bg-white px-2 py-1 rounded border">Pokhara123$</code>
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            No registration needed – just click any portal button above and log in!
          </p>
        </CardContent>
      </Card>

      <div className="col-span-12 max-w-lg mx-auto text-center my-14 text-slate-400 text-xs">
        <p>Made by the students for the students.</p>
      </div>
    </>
  );
}

export default Landing;