import { Link } from "react-router-dom";
import {
  HiOutlineArrowRight,
  HiOutlineCalendarDays,
  HiOutlineClipboardDocumentList,
  HiOutlineUserGroup,
  HiOutlineUsers,
} from "react-icons/hi2";
import StatsBar from "./StatsBar";

const SECTIONS = [
  {
    path: "/clinicians",
    title: "Clinician Directory",
    description:
      "Browse wound care providers, add new clinicians, edit details, or jump to their visit history.",
    icon: HiOutlineUserGroup,
    accent: "from-teal-500 to-teal-600",
    ring: "ring-teal-100 hover:ring-teal-200",
    countKey: "clinicians",
  },
  {
    path: "/patients",
    title: "Patient Registry",
    description:
      "Manage patient records with MRN and date of birth. Cards link directly to filtered visit lists.",
    icon: HiOutlineUsers,
    accent: "from-emerald-500 to-emerald-600",
    ring: "ring-emerald-100 hover:ring-emerald-200",
    countKey: "patients",
  },
  {
    path: "/visits",
    title: "Visit Schedule & History",
    description:
      "Record visits, filter by clinician or patient, reschedule or cancel. Newest visits listed first.",
    icon: HiOutlineClipboardDocumentList,
    accent: "from-sky-500 to-sky-600",
    ring: "ring-sky-100 hover:ring-sky-200",
    countKey: "visits",
  },
];

export default function HomePage({ clinicians, patients, visits }) {
  const counts = {
    clinicians: clinicians.length,
    patients: patients.length,
    visits: visits.length,
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back — here is an overview of your wound care network.
        </p>
      </div>

      <StatsBar clinicians={clinicians} patients={patients} visits={visits} />

      <h3 className="mb-3 text-sm font-medium text-slate-700">
        Quick navigation
      </h3>
      <div className="grid gap-4 md:grid-cols-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.path}
              to={section.path}
              className={`group soft-card flex flex-col p-5 text-left ring-2 ring-transparent transition-all ${section.ring}`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${section.accent} text-white shadow-sm`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {counts[section.countKey]}
                </span>
              </div>
              <h4 className="mt-4 text-base font-semibold text-slate-800 group-hover:text-teal-700">
                {section.title}
              </h4>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">
                {section.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 group-hover:gap-2.5 transition-all">
                Open
                <HiOutlineArrowRight className="h-4 w-4" />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-xl border border-slate-100 bg-white/80 px-4 py-3 text-sm text-slate-500">
        <HiOutlineCalendarDays className="h-4 w-4 shrink-0 text-teal-500" />
        <span>
          {visits.filter((v) => v.status === "scheduled").length} visits
          scheduled · {visits.filter((v) => v.status === "cancelled").length}{" "}
          cancelled
        </span>
      </div>
    </div>
  );
}
