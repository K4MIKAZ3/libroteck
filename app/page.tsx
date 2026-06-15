import { permanentRedirect } from "next/navigation";
import { HOME_PATH } from "@/lib/routes";

export default function RootPage() {
  permanentRedirect(HOME_PATH);
}
