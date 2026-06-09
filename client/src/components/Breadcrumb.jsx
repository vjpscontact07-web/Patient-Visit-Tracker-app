import { Link } from "react-router-dom";
import { HiOutlineChevronRight, HiOutlineHome } from "react-icons/hi2";

export default function Breadcrumb({ items }) {
    if (!items.length) return null;

    return (
        <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap items-center gap-1 text-sm"
        >
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <span
                        key={`${item.label}-${index}`}
                        className="inline-flex items-center gap-1"
                    >
                        {index > 0 && (
                            <HiOutlineChevronRight
                                className="h-3.5 w-3.5 shrink-0 text-slate-300"
                                aria-hidden
                            />
                        )}
                        {isLast ? (
                            <span className="font-medium text-slate-800">
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                to={item.to}
                                className="inline-flex items-center gap-1 text-slate-500 transition hover:text-teal-600"
                            >
                                {index === 0 && (
                                    <HiOutlineHome className="h-4 w-4" />
                                )}
                                {item.label}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
