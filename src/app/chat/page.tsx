'use client';

import { ChatMessage } from '../../shared/types';
import { useState } from 'react';
import { useHandleChat } from '../../lib/handle-chat';
import { ChatInput } from '../../components/chat-input';
import { Header } from '../../components/header';
import { useDAppConnector } from '../../components/client-providers';
import { Chat } from '../../components/chat';

export default function ChatPage() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState('');
  const { mutateAsync, isPending } = useHandleChat();

  const dAppContext = useDAppConnector();
  const dAppConnector = dAppContext?.dAppConnector;

  async function handleUserMessage() {
    if (!dAppConnector?.signers?.[0]) {
      console.error('No wallet connected');
      return;
    }

    const currentPrompt = prompt;
    setPrompt('');

    setChatHistory((v) => [
      ...v,
      {
        type: 'human',
        content: currentPrompt,
      },
    ]);

    const agentResponse = await mutateAsync({
      userAccountId: dAppConnector.signers[0].getAccountId().toString(),
      input: currentPrompt,
      history: chatHistory,
    });

    setChatHistory((v) => [
      ...v,
      {
        type: 'ai',
        content: agentResponse.message,
      },
    ]);

    if (agentResponse.transactionBytes) {
      const result = await dAppConnector.signAndExecuteTransaction({
        signerAccountId: dAppConnector.signers[0].getAccountId().toString(),
        transactionList: agentResponse.transactionBytes,
      });
      const transactionId = 'transactionId' in result ? result.transactionId : null;

      setChatHistory((v) => [
        ...v,
        {
          type: 'ai',
          content: `Transaction signed and executed sucessfully, txId: ${transactionId}`,
        },
      ]);
    }
  }

  return (
    <div className="h-screen w-full bg-zinc-900 flex flex-col overflow-hidden">
      <div className="flex-none">
        <Header />
      </div>

      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 pb-4 min-h-0">
        <div className="flex-1 overflow-hidden mb-4">
          <Chat chatHistory={chatHistory} isLoading={isPending} />
        </div>

        <div className="flex-none">
          <ChatInput
            handleUserMessage={handleUserMessage}
            prompt={prompt}
            setPrompt={setPrompt}
            isPending={isPending}
          />
        </div>
      </main>
    </div>
  );
}
