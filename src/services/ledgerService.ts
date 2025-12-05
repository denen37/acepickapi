import { LedgerEntry } from "../models/LegderEntry";
import { Accounts, TransactionType } from "../utils/enum";

type LedgerSide = {
    transactionId: number;
    userId?: string | null;
    account: Accounts;
    type: TransactionType;
    amount: number;
    category?: string | null;
};

export class LedgerService {
    static async createEntry(entries: LedgerSide[]) {
        const newEntries = await LedgerEntry.bulkCreate(entries)
    }
}