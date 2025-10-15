import React, { useEffect, useRef, useState } from "react";
import { CreditCard, Download, RefreshCw } from "lucide-react";
import TransactionFilters from "./TransactionFilters";
import TransactionTable from "./TransactionTable";
import TransactionDetailsModal from "./TransactionDetailsModal";
import BlockIpModal from "../blocked/BlockIpModal";
import { useNotification } from "../../hooks/useNotification";
import api from "../../utils/axios";
import { useAuth } from "../../hooks/useAuth";

// remove empty values so we don't send junk params
const cleanParams = (obj = {}) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== "" && v != null));

// read filename from Content-Disposition, fallback to a default
const pickFilename = (disposition) => {
  if (!disposition) return "transactions.csv";
  const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(disposition);
  try {
    return match?.[1] ? decodeURIComponent(match[1]) : "transactions.csv";
  } catch {
    return "transactions.csv";
  }
};
const TransactionsPage = ({ isSuper = false }) => {
  const { user } = useAuth();
  const isSuperRole = ['super_admin', 'super_manager'].includes(user?.role);
  const canBlockIp = user?.role !== 'store_cashier';
  const [filters, setFilters] = useState({});
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({ open: false, tx: null });

  const [blockIp, setBlockIp] = useState({ open: false, ip: "" , editing: null });
  const { addNotification } = useNotification();

  // keep a ref to cancel previous loads on rapid filter changes
  const controllerRef = useRef(null);

  const load = async () => {
    // cancel any in-flight request
    controllerRef.current?.abort?.();
    controllerRef.current = new AbortController();

    setLoading(true);
    try {
      const params = cleanParams(filters);
      const { data } = await api.get("/transactions", {
        params,
        signal: controllerRef.current.signal,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
        console.error("Failed to load transactions", err);
        addNotification("Failed to load transactions", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const exportCsv = async () => {
    try {
      const params = cleanParams({ ...filters, exportCsv: 1 });
      const res = await api.get("/transactions", {
        params,
        responseType: "blob", // important for CSV
      });

      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = pickFilename(res.headers["content-disposition"]);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed", err);
      addNotification("CSV export failed", "error");
    }
  };

  const onBlockIpClick = async (ip) => {
    if (!ip || !canBlockIp) return;
    // setBlockIp({ open: true, ip });

   try {
     // Try server-side filter; if backend ignores ?ip=, we still find locally.
     const { data } = await api.get("/blocked-ips", { params: { ip } });
     const existing = Array.isArray(data) ? data.find(r => r.ip === ip) : null;

     if (existing && !isSuperRole) {
       addNotification('This IP is already blocked for your hub.', 'info');
       return;
     }

     setBlockIp({ open: true, ip, editing: existing || null });
   } catch {
     setBlockIp({ open: true, ip, editing: null });
   }

  };

  const onViewDetails = (tx) => {
    setDetails({ open: true, tx });
  };

  const handleBlockIpSaved = () => {
    addNotification(`IP ${blockIp.ip} blocked successfully`, "success");
    setBlockIp({ open: false, ip: ""  , editing: null});
    load(); // refresh list
  };

  return (
    <div className="p-4 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Transactions
        </h2>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 bg-gray-700 rounded inline-flex items-center gap-2"
            onClick={exportCsv}
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            className="px-3 py-2 bg-teal-600 rounded inline-flex items-center gap-2"
            onClick={load}
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <TransactionFilters onChange={setFilters} includeMerchant={isSuper} />

      {/* Table */}
      <div className="mt-4">
        {loading ? (
          <div className="bg-gray-900 rounded-xl p-6 text-gray-300">Loading…</div>
        ) : (
          <TransactionTable
            transactions={rows}
            showMerchant={isSuper}
            onBlockIpClick={onBlockIpClick}
            canBlockIp={canBlockIp}
            onViewDetails={onViewDetails}
          />
        )}
      </div>

      {/* Block this IP (overlay modal) */}
      {blockIp.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <BlockIpModal
              ip={blockIp.ip}
              editing={blockIp.editing}
              open={blockIp.open}
              onClose={() => setBlockIp({ open: false, ip: "" ,  editing: null})}
              onSaved={handleBlockIpSaved}
            />
          </div>
        </div>
      )}

      {/* Transaction details modal */}
      {details.open && (
        <TransactionDetailsModal
          open={details.open}
          transaction={details.tx}
          onClose={() => setDetails({ open: false, tx: null })}
        />
      )}
    </div>
  );
};

export default TransactionsPage;
