import GuestOnlyLayout from "@/components/layout/guest-only-layout";
import SignUpPage from "@/screens/sign-up-page";

export default function SignUp() {
  return (
    <GuestOnlyLayout>
      <SignUpPage />
    </GuestOnlyLayout>
  );
}
