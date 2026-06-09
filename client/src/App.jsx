import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { HiOutlineInbox, HiOutlinePlus } from "react-icons/hi2";
import { api, getAuthToken, setAuthToken } from "./api";
import { useToast } from "./hooks/useToast";
import {
  formatDate,
  formatDob,
  formatVisitParts,
  todayDateKey,
} from "./utils/dates";
import Login from "./Login";
import ConfirmModal from "./components/ConfirmModal";
import SearchBar from "./components/SearchBar";
import ClinicianCard from "./components/ClinicianCard";
import PatientCard from "./components/PatientCard";
import VisitList from "./components/VisitList";
import VisitFilters from "./components/VisitFilters";
import HomePage from "./components/HomePage";
import Breadcrumb from "./components/Breadcrumb";
import LoadMoreButton from "./components/LoadMoreButton";
import ClinicianFormModal from "./components/forms/ClinicianFormModal";
import PatientFormModal from "./components/forms/PatientFormModal";
import VisitFormModal from "./components/forms/VisitFormModal";
import RescheduleModal from "./components/forms/RescheduleModal";
import useFilteredPagination from "./hooks/useFilteredPagination";
import useOptimisticAction from "./hooks/useOptimisticAction";
import {
  buildOptimisticClinician,
  buildOptimisticPatient,
  buildOptimisticVisit,
  patchVisitsForClinician,
  patchVisitsForPatient,
  removeVisitsForClinician,
  removeVisitsForPatient,
  replaceTempItem,
  sortByName,
  sortVisitsByDate,
} from "./utils/storeHelpers";
import { filterClinician, filterPatient } from "./utils/filters";
import {
  buildVisitSearchParams,
  clinicianVisitsPath,
  parseVisitSearchParams,
  patientVisitsPath,
  visitsPath,
} from "./utils/routes";

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-100 py-12 text-center">
      <HiOutlineInbox className="h-10 w-10 text-slate-200" />
      <p className="mt-2 text-sm text-slate-400">{message}</p>
    </div>
  );
}

const VIEW_LABELS = {
  "/clinicians": "Clinicians",
  "/patients": "Patients",
  "/visits": "Visits",
};

function PageHeader({ title, count, showing, onAdd, addLabel }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          {showing} of {count} records
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700"
      >
        <HiOutlinePlus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}

export default function App() {
  const { addToast } = useToast();
  const runOptimistic = useOptimisticAction(addToast);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [clinicians, setClinicians] = useState([]);
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [visitList, setVisitList] = useState([]);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [clinicianSearch, setClinicianSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [clinicianModal, setClinicianModal] = useState(null);
  const [patientModal, setPatientModal] = useState(null);
  const [visitModal, setVisitModal] = useState(null);
  const [rescheduleVisit, setRescheduleVisit] = useState(null);

  const filters = useMemo(
    () => parseVisitSearchParams(searchParams),
    [searchParams],
  );

  function updateVisitFilters(next) {
    setSearchParams(buildVisitSearchParams(next), { replace: true });
  }

  useEffect(() => {
    if (location.pathname !== "/visits" || searchParams.get("date")) return;
    setSearchParams(
      buildVisitSearchParams({
        ...parseVisitSearchParams(searchParams),
        visit_date: todayDateKey(),
      }),
      { replace: true },
    );
  }, [location.pathname, searchParams, setSearchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const refreshAllVisits = useCallback(async () => {
    const data = await api.visits.list({});
    setVisits(data);
    return data;
  }, []);

  const refreshVisitList = useCallback(
    async (overrides = {}) => {
      const data = await api.visits.list({
        ...filters,
        search: debouncedSearch,
        ...overrides,
      });
      setVisitList(data);
      return data;
    },
    [filters, debouncedSearch],
  );

  const clinicianPagination = useFilteredPagination(
    clinicians,
    filterClinician,
    clinicianSearch,
  );
  const patientPagination = useFilteredPagination(
    patients,
    filterPatient,
    patientSearch,
  );
  const visitPagination = useFilteredPagination(visitList, () => true, "");

  useEffect(() => {
    async function checkAuth() {
      if (!getAuthToken()) {
        setAuthChecking(false);
        return;
      }
      try {
        setUser(await api.auth.me());
      } catch {
        setAuthToken(null);
      } finally {
        setAuthChecking(false);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadInitialData() {
      try {
        const [clinicianData, patientData, visitData] = await Promise.all([
          api.clinicians.list(),
          api.patients.list(),
          api.visits.list({}),
        ]);
        if (!cancelled) {
          setClinicians(clinicianData);
          setPatients(patientData);
          setVisits(visitData);
        }
      } catch (err) {
        if (!cancelled) addToast(err.message, "error");
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    }

    loadInitialData();
    return () => {
      cancelled = true;
    };
  }, [user, addToast]);

  useEffect(() => {
    if (!user || location.pathname !== "/visits") return;

    let cancelled = false;

    async function loadVisitList() {
      setVisitsLoading(true);
      try {
        const data = await api.visits.list({
          ...filters,
          search: debouncedSearch,
        });
        if (!cancelled) setVisitList(data);
      } catch (err) {
        if (!cancelled) addToast(err.message, "error");
      } finally {
        if (!cancelled) setVisitsLoading(false);
      }
    }

    loadVisitList();
    return () => {
      cancelled = true;
    };
  }, [user, location.pathname, filters, debouncedSearch, addToast]);

  function handleLogout() {
    setAuthToken(null);
    setUser(null);
    setClinicians([]);
    setPatients([]);
    setVisits([]);
    setVisitList([]);
    setInitialLoading(true);
    navigate("/");
  }

  const breadcrumbs = useMemo(() => {
    const path = location.pathname;
    if (path === "/") return [];

    const home = { label: "Home", to: "/" };

    if (path === "/visits" && filters.clinician_id) {
      const clinician = clinicians.find(
        (c) => String(c.id) === filters.clinician_id,
      );
      return [
        home,
        { label: "Clinicians", to: "/clinicians" },
        ...(clinician
          ? [
              {
                label: clinician.name,
                to: visitsPath({
                  ...filters,
                  clinician_id: String(clinician.id),
                }),
              },
            ]
          : []),
        { label: "Visits" },
      ];
    }

    if (path === "/visits" && filters.patient_id) {
      const patient = patients.find((p) => String(p.id) === filters.patient_id);
      return [
        home,
        { label: "Patients", to: "/patients" },
        ...(patient
          ? [
              {
                label: patient.name,
                to: visitsPath({ ...filters, patient_id: String(patient.id) }),
              },
            ]
          : []),
        { label: "Visits" },
      ];
    }

    if (VIEW_LABELS[path]) {
      return [home, { label: VIEW_LABELS[path], to: path }];
    }

    return [];
  }, [location.pathname, filters, clinicians, patients]);

  function runConfirm() {
    if (!confirm) return;
    const action = confirm.action;
    setConfirm(null);
    action();
  }

  function askConfirm(config) {
    setConfirm(config);
  }

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
      </div>
    );
  }

  if (!user)
    return (
      <Login
        onLogin={(u) => {
          setInitialLoading(true);
          setUser(u);
          navigate("/");
        }}
      />
    );

  return (
    <div className="min-h-screen">
      <header className="border-b border-teal-900/10 bg-linear-to-br from-teal-700 via-teal-800 to-slate-900 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <Link to="/" className="block transition hover:opacity-90">
              <p className="text-xs font-medium uppercase tracking-widest text-teal-200/90">
                Woundtech Internal
              </p>
              <h1 className="text-lg font-semibold sm:text-xl">
                Patient Visit Tracker
              </h1>
              <p className="mt-0.5 hidden text-sm text-teal-100/80 sm:block">
                Track clinician visits across your wound care network
              </p>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-white/10 px-3 py-1 text-sm sm:inline">
              {user.name} <span className="text-teal-200/80">#{user.id}</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-white/20 px-3.5 py-2 text-sm font-medium transition hover:bg-white/10"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        {initialLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
          </div>
        ) : (
          <>
            <Breadcrumb items={breadcrumbs} />
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    clinicians={clinicians}
                    patients={patients}
                    visits={visits}
                  />
                }
              />
              <Route
                path="/clinicians"
                element={
                  <section className="soft-panel">
                    <PageHeader
                      title="Clinicians"
                      count={clinicianPagination.filtered.length}
                      showing={clinicianPagination.visible.length}
                      onAdd={() => setClinicianModal({ mode: "add" })}
                      addLabel="Add New"
                    />
                    <div className="mb-4">
                      <SearchBar
                        value={clinicianSearch}
                        onChange={setClinicianSearch}
                        placeholder="Search by name or specialty..."
                      />
                    </div>
                    {clinicians.length === 0 ? (
                      <EmptyState message="No clinicians yet. Click Add New to get started." />
                    ) : clinicianPagination.filtered.length === 0 ? (
                      <EmptyState message="No clinicians match your search." />
                    ) : (
                      <>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {clinicianPagination.visible.map((c) => (
                            <ClinicianCard
                              key={c.id}
                              clinician={c}
                              formatDate={formatDate}
                              isPending={c._optimistic}
                              onEdit={(item) =>
                                setClinicianModal({ mode: "edit", item })
                              }
                              onDelete={(item) =>
                                askConfirm({
                                  title: "Delete Clinician?",
                                  message: `This will permanently remove ${item.name} and all linked visits. This cannot be undone.`,
                                  confirmLabel: "Delete Clinician",
                                  cancelLabel: "Keep Clinician",
                                  intent: "danger",
                                  action: () =>
                                    runOptimistic(
                                      `delete-clinician-${item.id}`,
                                      {
                                        apply: () => {
                                          const snapshot = {
                                            clinicians,
                                            visits,
                                            visitList,
                                          };
                                          setClinicians((prev) =>
                                            prev.filter(
                                              (x) => x.id !== item.id,
                                            ),
                                          );
                                          setVisits((prev) =>
                                            removeVisitsForClinician(
                                              prev,
                                              item.id,
                                            ),
                                          );
                                          setVisitList((prev) =>
                                            removeVisitsForClinician(
                                              prev,
                                              item.id,
                                            ),
                                          );
                                          return snapshot;
                                        },
                                        request: () =>
                                          api.clinicians.delete(item.id),
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
                                      },
                                    ),
                                })
                              }
                              visitsTo={clinicianVisitsPath(c.id)}
                            />
                          ))}
                        </div>
                        {clinicianPagination.hasMore && (
                          <LoadMoreButton
                            remaining={clinicianPagination.remaining}
                            onClick={clinicianPagination.loadMore}
                          />
                        )}
                      </>
                    )}
                  </section>
                }
              />
              <Route
                path="/patients"
                element={
                  <section className="soft-panel">
                    <PageHeader
                      title="Patients"
                      count={patientPagination.filtered.length}
                      showing={patientPagination.visible.length}
                      onAdd={() => setPatientModal({ mode: "add" })}
                      addLabel="Add New"
                    />
                    <div className="mb-4">
                      <SearchBar
                        value={patientSearch}
                        onChange={setPatientSearch}
                        placeholder="Search by name or MRN..."
                      />
                    </div>
                    {patients.length === 0 ? (
                      <EmptyState message="No patients yet. Click Add New to get started." />
                    ) : patientPagination.filtered.length === 0 ? (
                      <EmptyState message="No patients match your search." />
                    ) : (
                      <>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {patientPagination.visible.map((p) => (
                            <PatientCard
                              key={p.id}
                              patient={p}
                              formatDob={formatDob}
                              isPending={p._optimistic}
                              onEdit={(item) =>
                                setPatientModal({ mode: "edit", item })
                              }
                              onDelete={(item) =>
                                askConfirm({
                                  title: "Delete Patient?",
                                  message: `This will permanently remove ${item.name} and all linked visits. This cannot be undone.`,
                                  confirmLabel: "Delete Patient",
                                  cancelLabel: "Keep Patient",
                                  intent: "danger",
                                  action: () =>
                                    runOptimistic(`delete-patient-${item.id}`, {
                                      apply: () => {
                                        const snapshot = {
                                          patients,
                                          visits,
                                          visitList,
                                        };
                                        setPatients((prev) =>
                                          prev.filter((x) => x.id !== item.id),
                                        );
                                        setVisits((prev) =>
                                          removeVisitsForPatient(prev, item.id),
                                        );
                                        setVisitList((prev) =>
                                          removeVisitsForPatient(prev, item.id),
                                        );
                                        return snapshot;
                                      },
                                      request: () => api.patients.delete(item.id),
                                      onSuccess: async () => {
                                        await Promise.all([
                                          refreshAllVisits(),
                                          refreshVisitList(),
                                        ]);
                                      },
                                      onError: (snapshot) => {
                                        setPatients(snapshot.patients);
                                        setVisits(snapshot.visits);
                                        setVisitList(snapshot.visitList);
                                      },
                                      successMessage: "Patient deleted",
                                    }),
                                })
                              }
                              visitsTo={patientVisitsPath(p.id)}
                            />
                          ))}
                        </div>
                        {patientPagination.hasMore && (
                          <LoadMoreButton
                            remaining={patientPagination.remaining}
                            onClick={patientPagination.loadMore}
                          />
                        )}
                      </>
                    )}
                  </section>
                }
              />
              <Route
                path="/visits"
                element={
                  <section className="soft-panel">
                    <PageHeader
                      title="Visits"
                      count={visitPagination.filtered.length}
                      showing={visitPagination.visible.length}
                      onAdd={() => setVisitModal({ mode: "add" })}
                      addLabel="Add New Visit"
                    />
                    <VisitFilters
                      filters={filters}
                      onChange={updateVisitFilters}
                      clinicians={clinicians}
                      patients={patients}
                    />
                    {visitsLoading ? (
                      <div className="flex justify-center py-16">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
                      </div>
                    ) : visitList.length === 0 ? (
                      <EmptyState
                        message="No visits found for the selected date. Try another date or clear other filters."
                      />
                    ) : (
                      <>
                        <VisitList
                          visits={visitPagination.visible}
                          formatVisitParts={formatVisitParts}
                          onEdit={(item) =>
                            setVisitModal({ mode: "edit", item })
                          }
                          onReschedule={(item) => setRescheduleVisit(item)}
                          onComplete={(item) =>
                            askConfirm({
                              title: "Mark Visit Completed?",
                              message: `Confirm that the visit for ${item.patient_name} with ${item.clinician_name} on ${formatDate(item.visit_date)} was completed.`,
                              confirmLabel: "Mark Completed",
                              cancelLabel: "Not Yet",
                              intent: "success",
                              action: () =>
                                runOptimistic(`complete-visit-${item.id}`, {
                                  apply: () => {
                                    const snapshot = { visits, visitList };
                                    const patch = (prev) =>
                                      prev.map((x) =>
                                        x.id === item.id
                                          ? {
                                              ...x,
                                              status: "completed",
                                              _optimistic: true,
                                            }
                                          : x,
                                      );
                                    setVisits(patch);
                                    setVisitList(patch);
                                    return snapshot;
                                  },
                                  request: () => api.visits.complete(item.id),
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
                                  successMessage: "Visit marked completed",
                                }),
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
                                runOptimistic(`cancel-visit-${item.id}`, {
                                  apply: () => {
                                    const snapshot = { visits, visitList };
                                    const patch = (prev) =>
                                      prev.map((x) =>
                                        x.id === item.id
                                          ? {
                                              ...x,
                                              status: "cancelled",
                                              _optimistic: true,
                                            }
                                          : x,
                                      );
                                    setVisits(patch);
                                    setVisitList(patch);
                                    return snapshot;
                                  },
                                  request: () => api.visits.cancel(item.id),
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
                                  successMessage: "Visit cancelled",
                                }),
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
                                runOptimistic(`delete-visit-${item.id}`, {
                                  apply: () => {
                                    const snapshot = { visits, visitList };
                                    const remove = (prev) =>
                                      prev.filter((x) => x.id !== item.id);
                                    setVisits(remove);
                                    setVisitList(remove);
                                    return snapshot;
                                  },
                                  request: () => api.visits.delete(item.id),
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
                                  successMessage: "Visit deleted",
                                }),
                            })
                          }
                        />
                        {visitPagination.hasMore && (
                          <LoadMoreButton
                            remaining={visitPagination.remaining}
                            onClick={visitPagination.loadMore}
                          />
                        )}
                      </>
                    )}
                  </section>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </>
        )}
      </main>

      {clinicianModal && (
        <ClinicianFormModal
          title={
            clinicianModal.mode === "add"
              ? "Add New Clinician"
              : "Edit Clinician"
          }
          initial={clinicianModal.item}
          onClose={() => setClinicianModal(null)}
          onSave={async (data) => {
            const mode = clinicianModal.mode;
            const item = clinicianModal.item;
            setClinicianModal(null);

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
          }}
        />
      )}

      {patientModal && (
        <PatientFormModal
          title={
            patientModal.mode === "add" ? "Add New Patient" : "Edit Patient"
          }
          initial={patientModal.item}
          onClose={() => setPatientModal(null)}
          onSave={async (data) => {
            const mode = patientModal.mode;
            const item = patientModal.item;
            setPatientModal(null);

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
                      x.id === item.id
                        ? { ...x, ...data, _optimistic: true }
                        : x,
                    ),
                  ),
                );
                setVisits((prev) => patchVisitsForPatient(prev, item.id, data));
                setVisitList((prev) =>
                  patchVisitsForPatient(prev, item.id, data),
                );
                return snapshot;
              },
              request: () => api.patients.update(item.id, data),
              onSuccess: (updated) => {
                setPatients((prev) =>
                  sortByName(
                    prev.map((x) => (x.id === updated.id ? updated : x)),
                  ),
                );
                setVisits((prev) =>
                  patchVisitsForPatient(prev, updated.id, updated),
                );
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
          }}
        />
      )}

      {visitModal && (
        <VisitFormModal
          title={visitModal.mode === "add" ? "Record New Visit" : "Edit Visit"}
          clinicians={clinicians}
          patients={patients}
          initial={visitModal.item}
          onClose={() => setVisitModal(null)}
          onSave={async (data) => {
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
                  await Promise.all([
                    refreshAllVisits(),
                    refreshVisitList(),
                  ]);
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
          }}
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
                api.visits.reschedule(visit.id, { visit_date: visitDate }),
              onSuccess: async () => {
                await Promise.all([refreshAllVisits(), refreshVisitList()]);
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

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          cancelLabel={confirm.cancelLabel}
          intent={confirm.intent}
          onCancel={() => setConfirm(null)}
          onConfirm={runConfirm}
        />
      )}
    </div>
  );
}
