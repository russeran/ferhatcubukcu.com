import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-patina">404</p>
      <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-umber-deep">Not found</h1>
      <p className="mt-4 text-umber/65">
        The page or artwork you requested does not exist.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex rounded-md bg-umber-deep px-8 py-3 text-sm font-semibold text-parchment hover:bg-oxide"
      >
        Home
      </Link>
    </div>
  );
}
