import React, { FC } from "react";

const NewMessagesCounter:FC<{messagesCounter: number}> = ({ messagesCounter }) => {
  return(
    <div className="bg-destructive rounded-full text-background text-xs leading-3 p-1 min-w-5 min-h-5 text-center">{messagesCounter}</div>
  );
};

export default NewMessagesCounter;
