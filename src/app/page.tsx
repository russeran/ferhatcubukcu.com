import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

/** Fallback when middleware does not run; keeps `/` from 404-ing. */
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
