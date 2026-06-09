import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../api";
import { useApp } from "../context/AppContext";
import useFilteredPagination from "../hooks/useFilteredPagination";
import useOptimisticAction from "../hooks/useOptimisticAction";
import { formatDate, formatVisitParts, todayDateKey } from "../utils/dates";
import {
    buildVisitSearchParams,
    parseVisitSearchParams,
} from "../utils/routes";
import { buildOptimisticVisit, sortVisitsByDate } from "../utils/storeHelpers";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import LoadMoreButton from "../components/LoadMoreButton";
import VisitFilters from "./VisitFilters";
import VisitList from "./VisitList";
import VisitFormModal from "./VisitFormModal";
import RescheduleModal from "./RescheduleModal";

export default function VisitsPage() {
    const {
        clinicians,
        patients,
        visits,
        setVisits,
        visitList,
        setVisitList,
        refreshAllVisits,
        refreshVisitList,
        askConfirm,
    } = useApp();

    const runOptimistic = useOptimisticAction();
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [visitModal, setVisitModal] = useState(null);
    const [rescheduleVisit, setRescheduleVisit] = useState(null);

    const filters = useMemo(
        () => parseVisitSearchParams(searchParams),
        [searchParams],
    );

    function updateFilters(next) {
        setSearchParams(buildVisitSearchParams(next), { replace: true });
    }

    useEffect(() => {
        if (!searchParams.get("date")) {
            setSearchParams(
                buildVisitSearchParams({
                    ...parseVisitSearchParams(searchParams),
                    visit_date: todayDateKey(),
                }),
                { replace: true },
            );
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(filters.search), 300);
        return () => clearTimeout(timer);
    }, [filters.search]);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const data = await api.visits.list({
                    ...filters,
                    search: debouncedSearch,
                });
                if (!cancelled) setVisitList(data);
            } catch (err) {
                if (!cancelled) toast.error(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [filters, debouncedSearch, setVisitList]);

    const pagination = useFilteredPagination(visitList, () => true, "");

    function patchVisitStatus(item, status) {
        runOptimistic(`${status}-visit-${item.id}`, {
            apply: () => {
                const snapshot = { visits, visitList };
                const patch = (prev) =>
                    prev.map((x) =>
                        x.id === item.id
                            ? { ...x, status, _optimistic: true }
                            : x,
                    );
                setVisits(patch);
                setVisitList(patch);
                return snapshot;
            },
            request: () =>
                status === "completed"
                    ? api.visits.complete(item.id)
                    : api.visits.cancel(item.id),
            onSuccess: async () => {
                await Promise.all([refreshAllVisits(), refreshVisitList()]);
            },
            onError: (snapshot) => {
                setVisits(snapshot.visits);
                setVisitList(snapshot.visitList);
            },
            successMessage:
                status === "completed"
                    ? "Visit marked completed"
                    : "Visit cancelled",
        });
    }

    async function handleVisitSave(data) {
        const mode = visitModal.mode;
        const item = visitModal.item;
        setVisitModal(null);

        if (mode === "add") {
            const temp = buildOptimisticVisit(data, clinicians, patients);
            await runOptimistic(`add-visit-${temp.id}`, {
                apply: () => {
                    const snapshot = { visits, visitList };
                    setVisits((prev) => sortVisitsByDate([temp, ...prev]));
                    setVisitList((prev) => sortVisitsByDate([temp, ...prev]));
                    return snapshot;
                },
                request: () => api.visits.create(data),
                onSuccess: async () => {
                    await Promise.all([refreshAllVisits(), refreshVisitList()]);
                },
                onError: (snapshot) => {
                    setVisits(snapshot.visits);
                    setVisitList(snapshot.visitList);
                },
                successMessage: "Visit recorded",
            });
            return;
        }

        const optimisticVisit = buildOptimisticVisit(
            data,
            clinicians,
            patients,
        );
        await runOptimistic(`edit-visit-${item.id}`, {
            apply: () => {
                const snapshot = { visits, visitList };
                const patch = (prev) =>
                    sortVisitsByDate(
                        prev.map((x) =>
                            x.id === item.id
                                ? {
                                      ...x,
                                      ...optimisticVisit,
                                      id: item.id,
                                      status: x.status,
                                      created_at: x.created_at,
                                      updated_at: new Date().toISOString(),
                                      _optimistic: true,
                                  }
                                : x,
                        ),
                    );
                setVisits(patch);
                setVisitList(patch);
                return snapshot;
            },
            request: () => api.visits.update(item.id, data),
            onSuccess: async () => {
                await Promise.all([refreshAllVisits(), refreshVisitList()]);
            },
            onError: (snapshot) => {
                setVisits(snapshot.visits);
                setVisitList(snapshot.visitList);
            },
            successMessage: "Visit updated",
        });
    }

    return (
        <>
            <section className="soft-panel">
                <PageHeader
                    title="Visits"
                    count={pagination.filtered.length}
                    showing={pagination.visible.length}
                    onAdd={() => setVisitModal({ mode: "add" })}
                    addLabel="Add New Visit"
                />
                <VisitFilters
                    filters={filters}
                    onChange={updateFilters}
                    clinicians={clinicians}
                    patients={patients}
                />
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
                    </div>
                ) : visitList.length === 0 ? (
                    <EmptyState message="No visits found for the selected date. Try another date or clear other filters." />
                ) : (
                    <>
                        <VisitList
                            visits={pagination.visible}
                            formatVisitParts={formatVisitParts}
                            onEdit={(item) =>
                                setVisitModal({ mode: "edit", item })
                            }
                            onReschedule={setRescheduleVisit}
                            onComplete={(item) =>
                                askConfirm({
                                    title: "Mark Visit Completed?",
                                    message: `Confirm that the visit for ${item.patient_name} with ${item.clinician_name} on ${formatDate(item.visit_date)} was completed.`,
                                    confirmLabel: "Mark Completed",
                                    cancelLabel: "Not Yet",
                                    intent: "success",
                                    action: () =>
                                        patchVisitStatus(item, "completed"),
                                })
                            }
                            onCancel={(item) =>
                                askConfirm({
                                    title: "Cancel This Visit?",
                                    message: `The visit for ${item.patient_name} on ${formatDate(item.visit_date)} will be marked as cancelled. The record will remain in the system.`,
                                    confirmLabel: "Cancel Visit",
                                    cancelLabel: "Keep Scheduled",
                                    intent: "warning",
                                    action: () =>
                                        patchVisitStatus(item, "cancelled"),
                                })
                            }
                            onDelete={(item) =>
                                askConfirm({
                                    title: "Delete Visit?",
                                    message: `This will permanently remove the visit for ${item.patient_name} on ${formatDate(item.visit_date)}. This cannot be undone.`,
                                    confirmLabel: "Delete Visit",
                                    cancelLabel: "Keep Visit",
                                    intent: "danger",
                                    action: () =>
                                        runOptimistic(
                                            `delete-visit-${item.id}`,
                                            {
                                                apply: () => {
                                                    const snapshot = {
                                                        visits,
                                                        visitList,
                                                    };
                                                    const remove = (prev) =>
                                                        prev.filter(
                                                            (x) =>
                                                                x.id !==
                                                                item.id,
                                                        );
                                                    setVisits(remove);
                                                    setVisitList(remove);
                                                    return snapshot;
                                                },
                                                request: () =>
                                                    api.visits.delete(item.id),
                                                onSuccess: async () => {
                                                    await Promise.all([
                                                        refreshAllVisits(),
                                                        refreshVisitList(),
                                                    ]);
                                                },
                                                onError: (snapshot) => {
                                                    setVisits(snapshot.visits);
                                                    setVisitList(
                                                        snapshot.visitList,
                                                    );
                                                },
                                                successMessage: "Visit deleted",
                                            },
                                        ),
                                })
                            }
                        />
                        {pagination.hasMore && (
                            <LoadMoreButton
                                remaining={pagination.remaining}
                                onClick={pagination.loadMore}
                            />
                        )}
                    </>
                )}
            </section>

            {visitModal && (
                <VisitFormModal
                    title={
                        visitModal.mode === "add"
                            ? "Record New Visit"
                            : "Edit Visit"
                    }
                    clinicians={clinicians}
                    patients={patients}
                    initial={visitModal.item}
                    onClose={() => setVisitModal(null)}
                    onSave={handleVisitSave}
                />
            )}

            {rescheduleVisit && (
                <RescheduleModal
                    visit={rescheduleVisit}
                    onClose={() => setRescheduleVisit(null)}
                    onSave={async (visitDate) => {
                        const visit = rescheduleVisit;
                        setRescheduleVisit(null);

                        await runOptimistic(`reschedule-visit-${visit.id}`, {
                            apply: () => {
                                const snapshot = { visits, visitList };
                                const patch = (prev) =>
                                    sortVisitsByDate(
                                        prev.map((x) =>
                                            x.id === visit.id
                                                ? {
                                                      ...x,
                                                      visit_date: visitDate,
                                                      status: "scheduled",
                                                      _optimistic: true,
                                                  }
                                                : x,
                                        ),
                                    );
                                setVisits(patch);
                                setVisitList(patch);
                                return snapshot;
                            },
                            request: () =>
                                api.visits.reschedule(visit.id, {
                                    visit_date: visitDate,
                                }),
                            onSuccess: async () => {
                                await Promise.all([
                                    refreshAllVisits(),
                                    refreshVisitList(),
                                ]);
                            },
                            onError: (snapshot) => {
                                setVisits(snapshot.visits);
                                setVisitList(snapshot.visitList);
                            },
                            successMessage: "Visit rescheduled",
                        });
                    }}
                />
            )}
        </>
    );
}
