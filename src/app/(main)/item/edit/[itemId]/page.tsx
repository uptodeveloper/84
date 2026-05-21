import MemberOnlyLayout from "@/components/layout/member-only-layout";
import ItemCreatePage from "@/screens/item-create-page";

export default function ItemEdit() {
  return (
    <MemberOnlyLayout>
      <ItemCreatePage />
    </MemberOnlyLayout>
  );
}
