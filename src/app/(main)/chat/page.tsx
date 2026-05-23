import MemberOnlyLayout from "@/components/layout/member-only-layout";
import ChatRoom from "@/features/chat/chat-room";

export default function Chat() {
  return (
    <MemberOnlyLayout>
      <ChatRoom />
    </MemberOnlyLayout>
  );
}
