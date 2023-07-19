import { BaseVOData } from './base-vo';

export interface LedgerFinancialVOData extends BaseVOData {
  ledger_financialId: number;
  spaceDelta: number;
  fileDelta: number;
  fromAccountId: number;
  fromSpaceBefore: number;
  fromSpaceLeft: number;
  fromSpaceTotal: number;
  fromFileTotal: number;
  fromFileBefore: number;
  fromFileLeft: number;
  toAccountId: number;
  toSpaceBefore: number;
  toSpaceLeft: number;
  toSpaceTotal: number;
  toFileTotal: number;
  toFileBefore: number;
  toFileLeft: number;
  monetaryAmount;
  storageAmount;
  donationAmount;
  donationMatchAmount;
  transactionNbr: string;
  type;
  status;
}

export interface LedgerNonfinancialVOData extends BaseVOData {
  ledger_nonfinancialId: number;
  spaceDelta: number;
  fileDelta: number;
  fromAccountId: number;
  fromSpaceBefore: number;
  fromSpaceLeft: number;
  fromSpaceTotal: number;
  fromFileTotal: number;
  fromFileBefore: number;
  fromFileLeft: number;
  toAccountId: number;
  toSpaceBefore: number;
  toSpaceLeft: number;
  toSpaceTotal: number;
  toFileTotal: number;
  toFileBefore: number;
  toFileLeft: number;
  monetaryAmount;
  storageAmount;
  donationAmount;
  donationMatchAmount;
  transactionNbr: string;
  recordId: number;
  fileId: number;
  type;
  status;
}
export interface AccountStorage {
  accountSpaceId: string;
  accountId: string;
  spaceLeft: string;
  spaceTotal: string;
  filesLeft: string;
  filesTotal: string;
  status: string;
  type: string;
  createdDt: Date;
  updatedDt: Date;
}

