import MemberOnlyLayout from "@/components/layout/member-only-layout";
import ItemCreatePage from "@/screens/item-create-page";

export default function ItemUpload() {
  return (
    <MemberOnlyLayout>
      <ItemCreatePage />
    </MemberOnlyLayout>
  );
}
