import MemberOnlyLayout from "@/components/layout/member-only-layout";
import ChatPage from "@/screens/chat-page";

export default function Chat() {
  return (
    <MemberOnlyLayout>
      <ChatPage />
    </MemberOnlyLayout>
  );
}
