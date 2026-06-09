import { Link } from "react-router-dom";
import { HiOutlineArrowRightOnRectangle } from "react-icons/hi2";

export default function AppHeader({ user, onSignOut }) {
    return (
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
                            Track clinician visits across your wound care
                            network
                        </p>
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <span className="hidden rounded-full bg-white/10 px-3 py-1 text-sm sm:inline">
                        {user.name}{" "}
                        <span className="text-teal-200/80">#{user.id}</span>
                    </span>
                    <button
                        type="button"
                        onClick={onSignOut}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3.5 py-2 text-sm font-medium transition hover:bg-white/10"
                        aria-label="Sign out"
                    >
                        <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    );
}
