import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-patina">404</p>
      <h1 className="mt-4 font-serif text-4xl text-umber-deep">Not found</h1>
      <p className="mt-4 text-umber/65">
        The page or artwork you requested does not exist.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex rounded-full bg-umber-deep px-8 py-3 text-sm font-medium text-parchment hover:bg-oxide"
      >
        Home
      </Link>
    </div>
  );
}
