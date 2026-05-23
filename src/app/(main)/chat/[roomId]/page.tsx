import MemberOnlyLayout from "@/components/layout/member-only-layout";
import ChatRoom from "@/features/chat/chat-room";

export default function ChatRoomPage() {
  return (
    <MemberOnlyLayout>
      <ChatRoom />
    </MemberOnlyLayout>
  );
}
