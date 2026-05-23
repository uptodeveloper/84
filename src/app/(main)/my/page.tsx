import MemberOnlyLayout from "@/components/layout/member-only-layout";
import MyShop from "@/features/my/my-shop";

export default function My() {
  return (
    <MemberOnlyLayout>
      <MyShop />
    </MemberOnlyLayout>
  );
}
