import MemberOnlyLayout from "@/components/layout/member-only-layout";
import ItemForm from "@/features/item/item-form";

export default function ItemUpload() {
  return (
    <MemberOnlyLayout>
      <ItemForm />
    </MemberOnlyLayout>
  );
}
