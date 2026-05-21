import MemberOnlyLayout from "@/components/layout/member-only-layout";
import ChatPage from "@/screens/chat-page";

export default function ChatRoom() {
  return (
    <MemberOnlyLayout>
      <ChatPage />
    </MemberOnlyLayout>
  );
}
