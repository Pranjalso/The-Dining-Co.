import CafeThemeProvider from "@/components/CafeThemeProvider";

export default function CafeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CafeThemeProvider>{children}</CafeThemeProvider>;
}

