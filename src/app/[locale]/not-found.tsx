import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center">
      <p className="editorial-eyebrow">404</p>
      <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-ink">Not found</h1>
      <p className="text-caption mt-4">
        The page or artwork you requested does not exist.
      </p>
      <Link href="/" className="btn-primary mt-10">
        Home
      </Link>
    </div>
  );
}
