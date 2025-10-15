import React from "react";
import Modal from "../Modal";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

const Row = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-3 py-2 border-b border-gray-700 last:border-b-0">
    <div className="text-gray-400 text-sm">{label}</div>
    <div className="col-span-2 text-gray-200 text-sm break-all font-mono">{value ?? "—"}</div>
  </div>
);

const TransactionDetailsModal = ({ open, onClose, transaction }) => {
  if (!open || !transaction) return null;

  const isDeposit = transaction.type === "deposit";

  const safe = (v) => (v === 0 ? 0 : v ?? null);
  const nonEmpty = (v) => {
    if (v === 0) return true;
    if (v == null) return false;
    if (typeof v === 'string') return v.trim().length > 0;
    return true;
  };

  return (
    <Modal onClose={onClose} className="bg-gray-900 rounded-xl shadow-xl max-w-3xl">
      <div className="p-6 max-h-[85vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-4">Transaction Details</h3>

        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-4 grid grid-cols-2 gap-4 border-b border-gray-700">
            <div>
              <div className="text-xs uppercase text-gray-400">Type</div>
              <div className="text-sm text-gray-100">{transaction.type}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-gray-400">Status</div>
              <div className="text-sm text-gray-100">{transaction.status}</div>
            </div>
          </div>

          <div className="p-4">
            {nonEmpty(transaction.createdAt) && <Row label="Date" value={formatDateTime(transaction.createdAt)} />}
            {nonEmpty(transaction.transactionId) && <Row label="Transaction ID" value={transaction.transactionId} />}
            {nonEmpty(transaction.orderId) && <Row label="Order ID" value={transaction.orderId} />}
            {nonEmpty(safe(transaction.amount)) && <Row label="Amount" value={(isDeposit ? "+" : "-") + formatCurrency(Number(transaction.amount) || 0)} />}
            {nonEmpty(transaction.network) && <Row label="Network / Method" value={transaction.network} />}
            {nonEmpty(transaction.gameId) && <Row label="Game ID" value={transaction.gameId} />}
            {nonEmpty(transaction.platformId?.name) && <Row label="Platform" value={transaction.platformId?.name} />}
            {nonEmpty(transaction.merchantId?.name) && <Row label="Merchant" value={transaction.merchantId?.name} />}
            {nonEmpty(transaction.address) && <Row label="Address" value={transaction.address} />}
            {nonEmpty(transaction.ip) && <Row label="IP" value={transaction.ip} />}
            {nonEmpty(transaction.actionBy?.email) && <Row label="Action By" value={transaction.actionBy?.email} />}
            {nonEmpty(transaction.actionNote) && <Row label="Action Note" value={transaction.actionNote} />}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionDetailsModal;


