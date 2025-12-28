import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <>
      <SignInButton />
      <UserButton />
      <ThemeToggle/>
      <Button>클릭</Button>
    </>
  );
}
