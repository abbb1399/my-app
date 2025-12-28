import { ReactNode } from "react";
import { ClerkProvider as OriginalClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

export function ClerkProvider({ children }: { children: ReactNode }) {
  return (
    <OriginalClerkProvider localization={koKR}>
      {children}
    </OriginalClerkProvider>
  );
}
