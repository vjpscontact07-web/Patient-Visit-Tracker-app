import { useState } from "react";
import { api } from "../api";
import { useApp } from "../context/AppContext";
import useFilteredPagination from "../hooks/useFilteredPagination";
import useOptimisticAction from "../hooks/useOptimisticAction";
import { filterClinician } from "../utils/filters";
import { formatDate } from "../utils/dates";
import { clinicianVisitsPath } from "../utils/routes";
import {
    buildOptimisticClinician,
    patchVisitsForClinician,
    removeVisitsForClinician,
    replaceTempItem,
    sortByName,
} from "../utils/storeHelpers";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import SearchBar from "../components/SearchBar";
import LoadMoreButton from "../components/LoadMoreButton";
import ClinicianCard from "./ClinicianCard";
import ClinicianFormModal from "./ClinicianFormModal";

export default function CliniciansPage() {
    const {
        clinicians,
        setClinicians,
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

    const pagination = useFilteredPagination(
        clinicians,
        filterClinician,
        search,
    );

    function handleDelete(item) {
        askConfirm({
            title: "Delete Clinician?",
            message: `This will permanently remove ${item.name} and all linked visits. This cannot be undone.`,
            confirmLabel: "Delete Clinician",
            cancelLabel: "Keep Clinician",
            intent: "danger",
            action: () =>
                runOptimistic(`delete-clinician-${item.id}`, {
                    apply: () => {
                        const snapshot = { clinicians, visits, visitList };
                        setClinicians((prev) =>
                            prev.filter((x) => x.id !== item.id),
                        );
                        setVisits((prev) =>
                            removeVisitsForClinician(prev, item.id),
                        );
                        setVisitList((prev) =>
                            removeVisitsForClinician(prev, item.id),
                        );
                        return snapshot;
                    },
                    request: () => api.clinicians.delete(item.id),
                    onSuccess: async () => {
                        await Promise.all([
                            refreshAllVisits(),
                            refreshVisitList(),
                        ]);
                    },
                    onError: (snapshot) => {
                        setClinicians(snapshot.clinicians);
                        setVisits(snapshot.visits);
                        setVisitList(snapshot.visitList);
                    },
                    successMessage: "Clinician deleted",
                }),
        });
    }

    async function handleSave(data) {
        const mode = modal.mode;
        const item = modal.item;
        setModal(null);

        if (mode === "add") {
            const temp = buildOptimisticClinician(data);
            await runOptimistic(`add-clinician-${temp.id}`, {
                apply: () => {
                    const snapshot = clinicians;
                    setClinicians((prev) => sortByName([...prev, temp]));
                    return snapshot;
                },
                request: () => api.clinicians.create(data),
                onSuccess: (created) => {
                    setClinicians((prev) =>
                        sortByName(replaceTempItem(prev, temp.id, created)),
                    );
                },
                onError: (snapshot) => setClinicians(snapshot),
                successMessage: "Clinician added",
            });
            return;
        }

        await runOptimistic(`edit-clinician-${item.id}`, {
            apply: () => {
                const snapshot = { clinicians, visits, visitList };
                setClinicians((prev) =>
                    sortByName(
                        prev.map((x) =>
                            x.id === item.id
                                ? { ...x, ...data, _optimistic: true }
                                : x,
                        ),
                    ),
                );
                setVisits((prev) =>
                    patchVisitsForClinician(prev, item.id, data),
                );
                setVisitList((prev) =>
                    patchVisitsForClinician(prev, item.id, data),
                );
                return snapshot;
            },
            request: () => api.clinicians.update(item.id, data),
            onSuccess: (updated) => {
                setClinicians((prev) =>
                    sortByName(
                        prev.map((x) => (x.id === updated.id ? updated : x)),
                    ),
                );
                setVisits((prev) =>
                    patchVisitsForClinician(prev, updated.id, updated),
                );
                setVisitList((prev) =>
                    patchVisitsForClinician(prev, updated.id, updated),
                );
            },
            onError: (snapshot) => {
                setClinicians(snapshot.clinicians);
                setVisits(snapshot.visits);
                setVisitList(snapshot.visitList);
            },
            successMessage: "Clinician updated",
        });
    }

    return (
        <>
            <section className="soft-panel">
                <PageHeader
                    title="Clinicians"
                    count={pagination.filtered.length}
                    showing={pagination.visible.length}
                    onAdd={() => setModal({ mode: "add" })}
                    addLabel="Add New"
                />
                <div className="mb-4">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Search by name or specialty..."
                    />
                </div>
                {clinicians.length === 0 ? (
                    <EmptyState message="No clinicians yet. Click Add New to get started." />
                ) : pagination.filtered.length === 0 ? (
                    <EmptyState message="No clinicians match your search." />
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {pagination.visible.map((c) => (
                                <ClinicianCard
                                    key={c.id}
                                    clinician={c}
                                    formatDate={formatDate}
                                    isPending={c._optimistic}
                                    onEdit={(item) =>
                                        setModal({ mode: "edit", item })
                                    }
                                    onDelete={handleDelete}
                                    visitsTo={clinicianVisitsPath(c.id)}
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
                <ClinicianFormModal
                    title={
                        modal.mode === "add"
                            ? "Add New Clinician"
                            : "Edit Clinician"
                    }
                    initial={modal.item}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                />
            )}
        </>
    );
}
