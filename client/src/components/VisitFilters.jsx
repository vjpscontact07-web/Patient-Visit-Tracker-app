import SearchBar from "./SearchBar";
import { FilterSelect } from "./FormField";
import { fieldClass } from "../utils/formStyles";
import { todayDateKey } from "../utils/dates";

const filterFieldClass = fieldClass(false, "filter");

function FilterField({ label, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function VisitFilters({
  filters,
  onChange,
  clinicians,
  patients,
}) {
  const isToday = filters.visit_date === todayDateKey();

  const clinicianOptions = clinicians.map((c) => ({
    value: String(c.id),
    label: c.name,
    hint: c.specialty || "General Practice",
  }));

  const patientOptions = patients.map((p) => ({
    value: String(p.id),
    label: p.name,
    hint: p.mrn || "No MRN",
  }));

  return (
    <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-12">
        <FilterField label="Search" className="xl:col-span-4">
          <div className="[&_input]:h-10 [&_input]:border-slate-200 [&_input]:bg-white">
            <SearchBar
              value={filters.search}
              onChange={(search) => onChange({ ...filters, search })}
              placeholder="Search by patient, clinician, notes..."
            />
          </div>
        </FilterField>

        <FilterField label="Visit date" className="xl:col-span-3">
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.visit_date}
              onChange={(e) =>
                onChange({ ...filters, visit_date: e.target.value })
              }
              className={filterFieldClass}
            />
            <button
              type="button"
              onClick={() => onChange({ ...filters, visit_date: "" })}
              className={`shrink-0 rounded-lg border px-3 text-sm font-medium transition ${
                !filters.visit_date
                  ? "border-teal-200 bg-teal-50 text-teal-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:text-teal-700"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() =>
                onChange({ ...filters, visit_date: todayDateKey() })
              }
              className={`shrink-0 rounded-lg border px-3 text-sm font-medium transition ${
                isToday
                  ? "border-teal-200 bg-teal-50 text-teal-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:text-teal-700"
              }`}
            >
              Today
            </button>
          </div>
        </FilterField>

        <FilterField label="Clinician" className="xl:col-span-2">
          <FilterSelect
            value={filters.clinician_id}
            onChange={(e) =>
              onChange({ ...filters, clinician_id: e.target.value })
            }
            placeholder="All clinicians"
            options={clinicianOptions}
          />
        </FilterField>

        <FilterField label="Patient" className="xl:col-span-3">
          <FilterSelect
            value={filters.patient_id}
            onChange={(e) =>
              onChange({ ...filters, patient_id: e.target.value })
            }
            placeholder="All patients"
            options={patientOptions}
          />
        </FilterField>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => onChange({ ...filters, status: value })}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filters.status === value
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-teal-200 hover:text-teal-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
