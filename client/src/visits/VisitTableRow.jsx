import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXCircle,
} from "react-icons/hi2";
import ActionIconButton from "../components/ActionIconButton";
import { TableCell, TableRow } from "../components/Table";

const STATUS_STYLES = {
  scheduled: "bg-sky-50 text-sky-700 ring-sky-200",
  cancelled: "bg-red-50 text-red-600 ring-red-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export default function VisitTableRow({
  visit,
  onEdit,
  onReschedule,
  onCancel,
  onComplete,
  onDelete,
  formatVisitParts,
  isPending = false,
}) {
  const isCancelled = visit.status === "cancelled";
  const isCompleted = visit.status === "completed";
  const isScheduled = visit.status === "scheduled";
  const { date, time } = formatVisitParts(visit.visit_date);

  return (
    <TableRow
      className={`${
        isCancelled ? "bg-red-50/20" : isCompleted ? "bg-emerald-50/15" : ""
      } ${isPending ? "opacity-70" : ""}`}
    >
      <TableCell className="relative">
        {isPending && (
          <span className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-teal-400" />
        )}
        <span
          className={`block text-sm font-medium ${
            isCancelled ? "text-slate-400 line-through" : "text-slate-800"
          }`}
        >
          {date}
        </span>
      </TableCell>

      <TableCell>
        <span
          className={`block text-sm tabular-nums ${
            isCancelled ? "text-slate-400 line-through" : "text-slate-600"
          }`}
        >
          {time}
        </span>
      </TableCell>

      <TableCell
        title={`patients.id = ${visit.patient_id} · ${visit.patient_name}`}
      >
        <span className="block truncate font-medium text-slate-800">
          {visit.patient_name}
        </span>
        {visit.patient_mrn && (
          <span className="mt-0.5 block truncate text-xs text-slate-400">
            {visit.patient_mrn}
          </span>
        )}
      </TableCell>

      <TableCell
        title={`clinicians.id = ${visit.clinician_id} · ${visit.clinician_name}`}
      >
        <span className="block truncate text-slate-700">
          {visit.clinician_name}
        </span>
        {visit.clinician_specialty && (
          <span className="mt-0.5 block truncate text-xs text-slate-400">
            {visit.clinician_specialty}
          </span>
        )}
      </TableCell>

      <TableCell align="center">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${
            STATUS_STYLES[visit.status] || STATUS_STYLES.scheduled
          }`}
        >
          {visit.status}
        </span>
      </TableCell>

      <TableCell title={visit.notes || undefined}>
        <span className="block max-w-70 truncate text-slate-500">
          {visit.notes || "—"}
        </span>
      </TableCell>

      <TableCell align="right">
        <div className="inline-flex items-center justify-end gap-0.5">
          <ActionIconButton
            label="Edit"
            variant="edit"
            onClick={() => onEdit(visit)}
          >
            <HiOutlinePencilSquare className="h-4 w-4" />
          </ActionIconButton>
          {isScheduled && (
            <>
              <ActionIconButton
                label="Mark completed"
                variant="complete"
                onClick={() => onComplete(visit)}
              >
                <HiOutlineCheckCircle className="h-4 w-4" />
              </ActionIconButton>
              <ActionIconButton
                label="Reschedule"
                variant="reschedule"
                onClick={() => onReschedule(visit)}
              >
                <HiOutlineClock className="h-4 w-4" />
              </ActionIconButton>
              <ActionIconButton
                label="Cancel visit"
                variant="cancel"
                onClick={() => onCancel(visit)}
              >
                <HiOutlineXCircle className="h-4 w-4" />
              </ActionIconButton>
            </>
          )}
          <ActionIconButton
            label="Delete"
            variant="delete"
            onClick={() => onDelete(visit)}
          >
            <HiOutlineTrash className="h-4 w-4" />
          </ActionIconButton>
        </div>
      </TableCell>
    </TableRow>
  );
}
