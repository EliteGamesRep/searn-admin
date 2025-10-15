import React, { useState, useMemo , useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, Copy } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency, formatDateTime } from "../../utils/formatters";


const TransactionTable = ({
  transactions,
  showMerchant = false,
  onBlockIpClick,
  canBlockIp = true,
  onViewDetails,
}) => {
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const { user } = useAuth(); // assume user.role is "super_admin" | "manager" | "cashier"

  const truncateMiddle = (text, start = 6, end = 6) => {
    if (!text || text.length <= start + end + 3) return text;
    return `${text.slice(0, start)}...${text.slice(-end)}`;
  };

  // ✅ Sorting logic
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "createdAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [transactions, sortField, sortDirection]);

  useEffect(() => { setCurrentPage(1); }, [transactions]);

  // ✅ Pagination
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedTransactions.slice(startIndex, startIndex + pageSize);
  }, [sortedTransactions, currentPage, pageSize]);

  const totalPages = Math.ceil(transactions.length / pageSize);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: "success",
      pending: "warning",
      failed: "danger",
      expired: "danger",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getTypeBadge = (type, isInternal) => {
    const variants = {
      deposit: "success",
      withdrawal: "warning",
    };
    
    // Handle withdraw type based on isInternal flag
    if (type === "withdraw") {
      const displayText = isInternal ? "withdraw" : "redeem";
      return <Badge variant={variants[type] || "default"}>{displayText}</Badge>;
    }
    
    return <Badge variant={variants[type] || "default"}>{type}</Badge>;
  };

  const getTypeIcon = (type) =>
    type === "deposit" ? (
      <ArrowUpRight className="h-4 w-4 text-green-400" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-orange-400" />
    );

  return (
    <div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-700">
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort("createdAt")}
                >
                  Date {sortField === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Game
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Platform
                </th>
                {showMerchant && (
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Merchant
                  </th>
                )}
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort("amount")}
                >
                  Amount {sortField === "amount" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Address
                </th>                
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Action By / Reason
                </th>
                {['super_admin','super_manager'].includes(user.role) &&
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Commission
                  </th>
                }
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {paginatedTransactions.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center text-gray-400 py-6">
                    🚫 No transactions found.
                  </td>
                </tr>
              )}
              {paginatedTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDateTime(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(transaction.type)}
                        <div className="ml-2">
                          {getTypeBadge(transaction.type , transaction.isInternal)}
                          <p className="text-xs font-mono text-gray-400 mt-1">
                            {transaction.transactionId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.gameId || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.platformId?.name || "—"}
                    </td>
                    {showMerchant && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {transaction.merchantId?.name || "—"}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                      <span
                        className={
                          transaction.type === "deposit"
                            ? "text-green-400"
                            : "text-orange-400"
                        }
                      >
                        {transaction.type === "deposit" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.network}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.orderId || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.address?.trim() ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-200">
                            {truncateMiddle(transaction.address.trim(), 8, 8)}
                          </span>
                          <button
                            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded inline-flex items-center gap-1"
                            onClick={() => navigator.clipboard.writeText(transaction.address.trim())}
                            title="Copy address"
                          >
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.ip?.trim() ? (
                        canBlockIp ? (
                          <button
                            className="text-teal-400 underline"
                            onClick={() => onBlockIpClick?.(transaction.ip.trim())}
                            title="Block this IP"
                          >
                            {transaction.ip}
                          </button>
                        ) : (
                          <span className="text-gray-300">{transaction.ip}</span>
                        )
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.actionBy?.email || "—"}
                      {transaction.actionNote ? ` — ${transaction.actionNote}` : ""}
                    </td>
                    {['super_admin','super_manager'].includes(user.role) &&
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.type === "deposit"
                        ? transaction.commissionAmount ?? 0
                        : "—"}
                    </td>
                   }
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-100"
                        onClick={() => onViewDetails?.(transaction)}
                        title="View details"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* ✅ Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-700 border-t border-gray-600 flex items-center justify-between">
            <div className="text-sm text-gray-300">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, transactions.length)} of{" "}
              {transactions.length} transactions
            </div>
            <div className="flex space-x-2">
              <Button
                size="small"
                variant="secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </Button>
              <Button
                size="small"
                variant="secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TransactionTable;
