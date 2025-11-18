import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper";

export default function ColoringAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProviderWrapper>
      {children}
    </SessionProviderWrapper>
  );
}
