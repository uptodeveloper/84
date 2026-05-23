import GuestOnlyLayout from "@/components/layout/guest-only-layout";
import SignInForm from "@/features/auth/sign-in-form";

export default function SignIn() {
  return (
    <GuestOnlyLayout>
      <SignInForm />
    </GuestOnlyLayout>
  );
}
