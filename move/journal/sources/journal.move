module journal::journal {
    use std::string::String;
    use sui::clock::Clock;
    use sui::tx_context::{TxContext};
    use sui::object;
    use sui::transfer;

    public struct Journal has key, store {
        id: UID,
        owner: address,
        title: String,
        entries: vector<Entry>,
    }

    public struct Entry has store {
        content: String,
        create_at_ms: u64,
    }

    public fun new_journal(title: String, ctx: &mut TxContext) {
        let journal = Journal {
            id: object::new(ctx),
            owner: ctx.sender(),
            title,
            entries: vector::empty<Entry>(),
        };

        // Transfer ownership of the new Journal to the transaction sender
        transfer::transfer(journal, ctx.sender());
    }

    public fun add_entry(
        journal: &mut Journal,
        content: String,
        clock: &Clock,
        ctx: &TxContext,
    ) {
        assert!(journal.owner == ctx.sender(), 0);

        let entry = Entry {
            content,
            create_at_ms: clock.timestamp_ms(),
        };

        journal.entries.push_back(entry);
    }
}