import { Transaction } from "@mysten/sui/transactions";
import { Button, Container, TextField } from "@radix-ui/themes";
import {
  useSignAndExecuteTransaction,
  useSuiClient,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { useNetworkVariable } from "./networkConfig";
import ClipLoader from "react-spinners/ClipLoader";
import { useState } from "react";

export function CreateJournal({
  onCreated,
}: {
  onCreated: (id: string) => void;
}) {
  const journalPackageId = useNetworkVariable("journalPackageId");
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [title, setTitle] = useState("");

  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();

  async function create() {
    if (!currentAccount || !journalPackageId) return;

    // 🧠 1. Create a new Transaction
    const tx = new Transaction();

    // 🧩 2. Call the Move function to create a new Journal
    tx.moveCall({
      target: `${journalPackageId}::journal::new_journal`,
      arguments: [tx.pure.string(title)],
    });

    // ⚡ 3. Sign & execute the transaction
    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async ({ digest }) => {
          // Wait for transaction to finish
          const { effects } = await suiClient.waitForTransaction({
            digest,
            options: { showEffects: true },
          });

          // 🔍 4. Extract created Journal object ID
          const journalId = effects?.created?.[0]?.reference?.objectId;
          if (journalId) onCreated(journalId);
        },
      }
    );
  }

  return (
    <Container>
      <TextField.Root
        placeholder="Enter journal title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        size="3"
        mb="3"
      />
      <Button
        size="3"
        onClick={create}
        disabled={isSuccess || isPending || !title.trim()}
      >
        {isSuccess || isPending ? <ClipLoader size={20} /> : "Create Journal"}
      </Button>
    </Container>
  );
}