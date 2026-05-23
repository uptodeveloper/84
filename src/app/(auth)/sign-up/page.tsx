import GuestOnlyLayout from "@/components/layout/guest-only-layout";
import SignUpForm from "@/features/auth/sign-up-form";

export default function SignUp() {
  return (
    <GuestOnlyLayout>
      <SignUpForm />
    </GuestOnlyLayout>
  );
}
