import { redirect } from "next/navigation";

export default function CafeRootPage({ params }: { params: { menupages: string } }) {
  redirect(`/${params.menupages}/menu`);
}
