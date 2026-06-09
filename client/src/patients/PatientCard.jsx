import { Link } from "react-router-dom";
import {
    HiOutlineArrowRight,
    HiOutlineCalendarDays,
    HiOutlineIdentification,
    HiOutlinePencilSquare,
    HiOutlineTrash,
} from "react-icons/hi2";
import Avatar from "../components/Avatar";
import ActionIconButton from "../components/ActionIconButton";

export default function PatientCard({
    patient,
    onEdit,
    onDelete,
    visitsTo,
    formatDob,
    isPending = false,
}) {
    return (
        <article
            className={`card-enter soft-card group relative flex h-full flex-col p-4 transition-all duration-200 hover:border-teal-100 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] ${
                isPending ? "opacity-75" : ""
            }`}
        >
            {isPending && (
                <div className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-teal-300" />
            )}
            <div className="absolute right-2 top-2 z-10 flex gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <ActionIconButton
                    label="Edit"
                    variant="edit"
                    onClick={() => onEdit(patient)}
                >
                    <HiOutlinePencilSquare className="h-4 w-4" />
                </ActionIconButton>
                <ActionIconButton
                    label="Delete"
                    variant="delete"
                    onClick={() => onDelete(patient)}
                >
                    <HiOutlineTrash className="h-4 w-4" />
                </ActionIconButton>
            </div>

            <div className="flex items-start gap-3">
                <Avatar name={patient.name} />
                <div className="min-w-0 flex-1 pr-10">
                    <h3
                        className="truncate text-base font-semibold text-slate-800"
                        title={patient.name}
                    >
                        {patient.name}
                    </h3>
                    <p className="mt-1 inline-flex max-w-full items-center gap-1 truncate rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-500">
                        <HiOutlineIdentification className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                            {patient.mrn || "No MRN"}
                        </span>
                    </p>
                </div>
            </div>

            <div className="mt-auto space-y-2.5 border-t border-slate-50 pt-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <HiOutlineCalendarDays className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                        DOB {formatDob(patient.date_of_birth)}
                    </span>
                </div>
                <Link
                    to={visitsTo}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-50 px-3 py-2.5 text-sm font-medium text-teal-700 transition hover:bg-teal-100"
                >
                    View Visits
                    <HiOutlineArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </article>
    );
}
