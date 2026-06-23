import type { TransactionFilterStatus, TransactionType } from "./types";

const TYPE_LABEL_ES: Record<TransactionType, string> = {
  deposit: "Depósito",
  advance: "Adelanto",
  withdrawal: "Retiro",
  yield: "Rendimiento",
};

export function getTransactionTypeLabel(type: TransactionType): string {
  return TYPE_LABEL_ES[type];
}

export function mapDepositTypeToTransactionType(type: string): TransactionType {
  return type === "yield" ? "yield" : "deposit";
}

export function matchesStatusFilter(
  status: string,
  filter: TransactionFilterStatus,
): boolean {
  if (filter === "completed" && status === "liquidated") {
    return true;
  }
  return status === filter;
}
