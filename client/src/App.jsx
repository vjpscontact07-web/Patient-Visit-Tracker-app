import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Navigate,
    Route,
    Routes,
    useLocation,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import { api, getAuthToken, setAuthToken } from "./api";
import { AppContext } from "./context/AppContext";
import { parseVisitSearchParams, visitsPath } from "./utils/routes";
import Login from "./Login";
import AppHeader from "./components/AppHeader";
import Breadcrumb from "./components/Breadcrumb";
import ConfirmModal from "./components/ConfirmModal";
import HomePage from "./components/HomePage";
import CliniciansPage from "./clinicians/CliniciansPage";
import PatientsPage from "./patients/PatientsPage";
import VisitsPage from "./visits/VisitsPage";

const VIEW_LABELS = {
    "/clinicians": "Clinicians",
    "/patients": "Patients",
    "/visits": "Visits",
};

export default function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState(null);
    const [authChecking, setAuthChecking] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [clinicians, setClinicians] = useState([]);
    const [patients, setPatients] = useState([]);
    const [visits, setVisits] = useState([]);
    const [visitList, setVisitList] = useState([]);
    const [confirm, setConfirm] = useState(null);

    const filters = useMemo(
        () => parseVisitSearchParams(searchParams),
        [searchParams],
    );

    const refreshAllVisits = useCallback(async () => {
        const data = await api.visits.list({});
        setVisits(data);
        return data;
    }, []);

    const refreshVisitList = useCallback(async () => {
        const data = await api.visits.list({
            ...parseVisitSearchParams(searchParams),
        });
        setVisitList(data);
        return data;
    }, [searchParams]);

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
                const [clinicianData, patientData, visitData] =
                    await Promise.all([
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
                if (!cancelled) toast.error(err.message);
            } finally {
                if (!cancelled) setInitialLoading(false);
            }
        }

        loadInitialData();
        return () => {
            cancelled = true;
        };
    }, [user]);

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
            const patient = patients.find(
                (p) => String(p.id) === filters.patient_id,
            );
            return [
                home,
                { label: "Patients", to: "/patients" },
                ...(patient
                    ? [
                          {
                              label: patient.name,
                              to: visitsPath({
                                  ...filters,
                                  patient_id: String(patient.id),
                              }),
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

    function askConfirm(config) {
        setConfirm(config);
    }

    function runConfirm() {
        if (!confirm) return;
        const action = confirm.action;
        setConfirm(null);
        action();
    }

    const appContext = {
        clinicians,
        setClinicians,
        patients,
        setPatients,
        visits,
        setVisits,
        visitList,
        setVisitList,
        refreshAllVisits,
        refreshVisitList,
        askConfirm,
    };

    if (authChecking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
            </div>
        );
    }

    if (!user) {
        return (
            <Login
                onLogin={(u) => {
                    setInitialLoading(true);
                    setUser(u);
                    navigate("/");
                }}
            />
        );
    }

    return (
        <AppContext.Provider value={appContext}>
            <div className="min-h-screen">
                <AppHeader
                    user={user}
                    onSignOut={() =>
                        askConfirm({
                            title: "Sign Out?",
                            message:
                                "You will need to sign in again to access the Patient Visit Tracker.",
                            confirmLabel: "Sign Out",
                            cancelLabel: "Stay Signed In",
                            intent: "warning",
                            action: handleLogout,
                        })
                    }
                />

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
                                    element={<CliniciansPage />}
                                />
                                <Route
                                    path="/patients"
                                    element={<PatientsPage />}
                                />
                                <Route
                                    path="/visits"
                                    element={<VisitsPage />}
                                />
                                <Route
                                    path="*"
                                    element={<Navigate to="/" replace />}
                                />
                            </Routes>
                        </>
                    )}
                </main>

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
        </AppContext.Provider>
    );
}
