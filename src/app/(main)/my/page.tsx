import MemberOnlyLayout from "@/components/layout/member-only-layout";
import MyPage from "@/screens/my-page";

export default function My() {
  return (
    <MemberOnlyLayout>
      <MyPage />
    </MemberOnlyLayout>
  );
}
