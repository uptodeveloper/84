import GuestOnlyLayout from "@/components/layout/guest-only-layout";
import SignInPage from "@/screens/sign-in-page";

export default function SignIn() {
  return (
    <GuestOnlyLayout>
      <SignInPage />
    </GuestOnlyLayout>
  );
}
