import { useState } from "react";
import { api } from "../api";
import { useApp } from "../context/AppContext";
import useFilteredPagination from "../hooks/useFilteredPagination";
import useOptimisticAction from "../hooks/useOptimisticAction";
import { filterPatient } from "../utils/filters";
import { formatDob } from "../utils/dates";
import { patientVisitsPath } from "../utils/routes";
import {
  buildOptimisticPatient,
  patchVisitsForPatient,
  removeVisitsForPatient,
  replaceTempItem,
  sortByName,
} from "../utils/storeHelpers";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import SearchBar from "../components/SearchBar";
import LoadMoreButton from "../components/LoadMoreButton";
import PatientCard from "./PatientCard";
import PatientFormModal from "./PatientFormModal";

export default function PatientsPage() {
  const {
    patients,
    setPatients,
    visits,
    setVisits,
    visitList,
    setVisitList,
    refreshAllVisits,
    refreshVisitList,
    askConfirm,
  } = useApp();

  const runOptimistic = useOptimisticAction();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  const pagination = useFilteredPagination(patients, filterPatient, search);

  function handleDelete(item) {
    askConfirm({
      title: "Delete Patient?",
      message: `This will permanently remove ${item.name} and all linked visits. This cannot be undone.`,
      confirmLabel: "Delete Patient",
      cancelLabel: "Keep Patient",
      intent: "danger",
      action: () =>
        runOptimistic(`delete-patient-${item.id}`, {
          apply: () => {
            const snapshot = { patients, visits, visitList };
            setPatients((prev) => prev.filter((x) => x.id !== item.id));
            setVisits((prev) => removeVisitsForPatient(prev, item.id));
            setVisitList((prev) => removeVisitsForPatient(prev, item.id));
            return snapshot;
          },
          request: () => api.patients.delete(item.id),
          onSuccess: async () => {
            await Promise.all([refreshAllVisits(), refreshVisitList()]);
          },
          onError: (snapshot) => {
            setPatients(snapshot.patients);
            setVisits(snapshot.visits);
            setVisitList(snapshot.visitList);
          },
          successMessage: "Patient deleted",
        }),
    });
  }

  async function handleSave(data) {
    const mode = modal.mode;
    const item = modal.item;
    setModal(null);

    if (mode === "add") {
      const temp = buildOptimisticPatient(data);
      await runOptimistic(`add-patient-${temp.id}`, {
        apply: () => {
          const snapshot = patients;
          setPatients((prev) => sortByName([...prev, temp]));
          return snapshot;
        },
        request: () => api.patients.create(data),
        onSuccess: (created) => {
          setPatients((prev) =>
            sortByName(replaceTempItem(prev, temp.id, created)),
          );
        },
        onError: (snapshot) => setPatients(snapshot),
        successMessage: "Patient added",
      });
      return;
    }

    await runOptimistic(`edit-patient-${item.id}`, {
      apply: () => {
        const snapshot = { patients, visits, visitList };
        setPatients((prev) =>
          sortByName(
            prev.map((x) =>
              x.id === item.id ? { ...x, ...data, _optimistic: true } : x,
            ),
          ),
        );
        setVisits((prev) => patchVisitsForPatient(prev, item.id, data));
        setVisitList((prev) => patchVisitsForPatient(prev, item.id, data));
        return snapshot;
      },
      request: () => api.patients.update(item.id, data),
      onSuccess: (updated) => {
        setPatients((prev) =>
          sortByName(prev.map((x) => (x.id === updated.id ? updated : x))),
        );
        setVisits((prev) => patchVisitsForPatient(prev, updated.id, updated));
        setVisitList((prev) =>
          patchVisitsForPatient(prev, updated.id, updated),
        );
      },
      onError: (snapshot) => {
        setPatients(snapshot.patients);
        setVisits(snapshot.visits);
        setVisitList(snapshot.visitList);
      },
      successMessage: "Patient updated",
    });
  }

  return (
    <>
      <section className="soft-panel">
        <PageHeader
          title="Patients"
          count={pagination.filtered.length}
          showing={pagination.visible.length}
          onAdd={() => setModal({ mode: "add" })}
          addLabel="Add New"
        />
        <div className="mb-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name or MRN..."
          />
        </div>
        {patients.length === 0 ? (
          <EmptyState message="No patients yet. Click Add New to get started." />
        ) : pagination.filtered.length === 0 ? (
          <EmptyState message="No patients match your search." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pagination.visible.map((p) => (
                <PatientCard
                  key={p.id}
                  patient={p}
                  formatDob={formatDob}
                  isPending={p._optimistic}
                  onEdit={(item) => setModal({ mode: "edit", item })}
                  onDelete={handleDelete}
                  visitsTo={patientVisitsPath(p.id)}
                />
              ))}
            </div>
            {pagination.hasMore && (
              <LoadMoreButton
                remaining={pagination.remaining}
                onClick={pagination.loadMore}
              />
            )}
          </>
        )}
      </section>

      {modal && (
        <PatientFormModal
          title={modal.mode === "add" ? "Add New Patient" : "Edit Patient"}
          initial={modal.item}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
