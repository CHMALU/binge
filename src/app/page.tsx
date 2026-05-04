import { redirect } from "next/navigation";

// Proxy handles the redirect, but this is a fallback for direct hits to /
export default function RootPage() {
  redirect("/en");
}
