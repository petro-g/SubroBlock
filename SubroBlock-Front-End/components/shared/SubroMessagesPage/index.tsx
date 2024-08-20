import React from "react";
import Chat from "./Chat";
import Messages from "./Messages";

export default function SubroMessagesPage() {
  return (
    <div className="flex h-screen">
      <Messages />
      <Chat />
    </div>
  );
}
