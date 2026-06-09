import {
  Table,
  TableBody,
  TableHeadCell,
  TableHeader,
  TableHeaderRow,
} from "../components/Table";
import VisitTableRow from "./VisitTableRow";

const COLUMNS = [
  { key: "date", label: "Date", width: "112px" },
  { key: "time", label: "Time", width: "88px" },
  { key: "patient", label: "Patient", width: "20%" },
  { key: "clinician", label: "Clinician", width: "20%" },
  { key: "status", label: "Status", width: "96px", align: "center" },
  { key: "notes", label: "Notes" },
  { key: "actions", label: "Actions", width: "176px", align: "right" },
];

export default function VisitList({
  visits,
  formatVisitParts,
  onEdit,
  onReschedule,
  onCancel,
  onComplete,
  onDelete,
}) {
  return (
    <Table minWidth="820px" stickyHeader aria-label="Visit schedule">
      <TableHeader>
        <TableHeaderRow>
          {COLUMNS.map(({ key, label, width, align = "left" }) => (
            <TableHeadCell key={key} width={width} align={align}>
              {label}
            </TableHeadCell>
          ))}
        </TableHeaderRow>
      </TableHeader>
      <TableBody>
        {visits.map((visit) => (
          <VisitTableRow
            key={visit.id}
            visit={visit}
            formatVisitParts={formatVisitParts}
            isPending={visit._optimistic}
            onEdit={onEdit}
            onReschedule={onReschedule}
            onCancel={onCancel}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
}
