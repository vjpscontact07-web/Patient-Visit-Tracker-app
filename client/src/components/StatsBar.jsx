import {
    HiOutlineCalendarDays,
    HiOutlineClipboardDocumentList,
    HiOutlineUserGroup,
    HiOutlineUsers,
} from "react-icons/hi2";

function StatCard({ icon: Icon, label, value, accent }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-slate-100/80 bg-white/90 px-4 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}
            >
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-xl font-semibold text-slate-800">{value}</p>
            </div>
        </div>
    );
}

export default function StatsBar({ clinicians, patients, visits }) {
    const scheduled = visits.filter((v) => v.status === "scheduled").length;

    return (
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
                icon={HiOutlineUserGroup}
                label="Clinicians"
                value={clinicians.length}
                accent="bg-teal-500"
            />
            <StatCard
                icon={HiOutlineUsers}
                label="Patients"
                value={patients.length}
                accent="bg-emerald-500"
            />
            <StatCard
                icon={HiOutlineClipboardDocumentList}
                label="Total Visits"
                value={visits.length}
                accent="bg-sky-500"
            />
            <StatCard
                icon={HiOutlineCalendarDays}
                label="Scheduled"
                value={scheduled}
                accent="bg-indigo-500"
            />
        </div>
    );
}
