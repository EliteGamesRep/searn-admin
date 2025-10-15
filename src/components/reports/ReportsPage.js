import React, { useEffect, useState } from "react";
import api from "../../utils/axios";
import { formatCurrency, formatNumber } from "../../utils/formatters";
import { useNotification } from "../../hooks/useNotification";

const toYmd = (date) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
};

const getPresetRange = (preset) => {
  const today = new Date();
  const todayYmd = toYmd(today);

  switch (preset) {
    case "today":
      return { from: todayYmd, to: todayYmd };
    case "yesterday": {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const ymd = toYmd(y);
      return { from: ymd, to: ymd };
    }
    case "this_week": {
      const start = new Date(today);
      const weekday = (today.getDay() + 6) % 7; // Monday as first day
      start.setDate(start.getDate() - weekday);
      return { from: toYmd(start), to: todayYmd };
    }
    case "last_7": {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { from: toYmd(start), to: todayYmd };
    }
    case "last_30": {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return { from: toYmd(start), to: todayYmd };
    }
    case "this_year": {
      const start = new Date(today.getFullYear(), 0, 1);
      return { from: toYmd(start), to: todayYmd };
    }
    default:
      return { from: "", to: "" };
  }
};

const presetOptions = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "this_week", label: "This Week" },
  { key: "last_7", label: "Last 7 Days" },
  { key: "last_30", label: "Last 30 Days" },
  { key: "this_year", label: "This Year" },
  { key: "custom", label: "Custom" },
];

const SATS_PER_BTC = 1e8;

const parseNumeric = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const pickNumeric = (...values) => {
  for (const value of values) {
    const parsed = parseNumeric(value);
    if (parsed !== null) return parsed;
  }
  return 0;
};

const pickNumericWithPresence = (...values) => {
  for (const value of values) {
    const parsed = parseNumeric(value);
    if (parsed !== null) {
      return { value: parsed, found: true };
    }
  }
  return { value: 0, found: false };
};

const toStoreAdminList = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);
  }
  return [];
};

const mergeStoreAdmins = (...candidates) => {
  const seen = new Set();
  candidates.forEach((candidate) => {
    toStoreAdminList(candidate).forEach((name) => {
      if (!seen.has(name)) {
        seen.add(name);
      }
    });
  });
  return [...seen];
};

const rowsFromPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.result)) return payload.result;

  if (payload.data && typeof payload.data === "object") {
    if (Array.isArray(payload.data.rows)) return payload.data.rows;
    if (Array.isArray(payload.data.items)) return payload.data.items;
    if (Array.isArray(payload.data.data)) return payload.data.data;
  }

  if (payload.payload && typeof payload.payload === "object") {
    if (Array.isArray(payload.payload.rows)) return payload.payload.rows;
    if (Array.isArray(payload.payload.items)) return payload.payload.items;
    if (Array.isArray(payload.payload.data)) return payload.payload.data;
  }

  return [];
};

const normalizeReportRow = (raw) => {
  if (!raw || typeof raw !== "object") return null;

  const totals = raw.totals && typeof raw.totals === "object" ? raw.totals : {};
  const summary = raw.summary && typeof raw.summary === "object" ? raw.summary : {};
  const depositTotals =
    (totals.deposit && typeof totals.deposit === "object" && totals.deposit) ||
    (totals.deposits && typeof totals.deposits === "object" && totals.deposits) ||
    (summary.deposit && typeof summary.deposit === "object" && summary.deposit) ||
    (summary.deposits && typeof summary.deposits === "object" && summary.deposits) ||
    {};
  const withdrawTotals =
    (totals.withdraw && typeof totals.withdraw === "object" && totals.withdraw) ||
    (totals.withdraws && typeof totals.withdraws === "object" && totals.withdraws) ||
    (summary.withdraw && typeof summary.withdraw === "object" && summary.withdraw) ||
    (summary.withdraws && typeof summary.withdraws === "object" && summary.withdraws) ||
    {};
  const payoutTotals =
    (totals.payout && typeof totals.payout === "object" && totals.payout) ||
    (totals.payouts && typeof totals.payouts === "object" && totals.payouts) ||
    (summary.payout && typeof summary.payout === "object" && summary.payout) ||
    (summary.payouts && typeof summary.payouts === "object" && summary.payouts) ||
    {};
  const commissionTotals =
    (totals.commission && typeof totals.commission === "object" && totals.commission) ||
    (totals.commissions && typeof totals.commissions === "object" && totals.commissions) ||
    (summary.commission && typeof summary.commission === "object" && summary.commission) ||
    (summary.commissions && typeof summary.commissions === "object" && summary.commissions) ||
    {};
  const pendingTotals =
    (totals.pendingWithdraw && typeof totals.pendingWithdraw === "object" && totals.pendingWithdraw) ||
    (totals.pending && typeof totals.pending === "object" && totals.pending) ||
    (summary.pendingWithdraw && typeof summary.pendingWithdraw === "object" && summary.pendingWithdraw) ||
    (summary.pending && typeof summary.pending === "object" && summary.pending) ||
    {};

  const totalDepositCustomer = pickNumeric(
    raw.totalDepositCustomer,
    raw.customerDeposit,
    raw.customerDeposits,
    raw.depositCustomer,
    depositTotals.customer,
    depositTotals.customers
  );
  const totalDepositAdmin = pickNumeric(
    raw.totalDepositAdmin,
    raw.adminDeposit,
    raw.adminDeposits,
    raw.depositAdmin,
    depositTotals.admin
  );
  const totalWithdrawCustomer = pickNumeric(
    raw.totalWithdrawCustomer,
    raw.customerWithdraw,
    raw.customerWithdraws,
    raw.withdrawCustomer,
    withdrawTotals.customer,
    withdrawTotals.customers
  );
  const totalWithdrawAdmin = pickNumeric(
    raw.totalWithdrawAdmin,
    raw.adminWithdraw,
    raw.adminWithdraws,
    raw.withdrawAdmin,
    withdrawTotals.admin
  );

  const totalDeposit = pickNumeric(
    raw.totalDeposit,
    raw.totalDepositAmount,
    raw.depositTotal,
    depositTotals.total,
    depositTotals.amount,
    totalDepositCustomer + totalDepositAdmin
  );
  const totalWithdraw = pickNumeric(
    raw.totalWithdraw,
    raw.withdrawTotal,
    withdrawTotals.total,
    withdrawTotals.amount,
    totalWithdrawCustomer + totalWithdrawAdmin
  );
  const totalPayout = pickNumeric(
    raw.totalPayout,
    raw.payoutTotal,
    payoutTotals.total,
    payoutTotals.amount
  );
  const totalPendingWithdrawRequests = pickNumeric(
    raw.totalPendingWithdrawRequests,
    raw.pendingWithdrawRequests,
    raw.pendingWithdrawCount,
    pendingTotals.total,
    pendingTotals.count
  );
  const totalCommission = pickNumeric(
    raw.totalCommission,
    raw.commissionTotal,
    raw.commissionAmount,
    commissionTotals.total,
    commissionTotals.amount
  );
  const { value: trySpeedBalanceUsd, found: hasTrySpeedBalanceUsd } = pickNumericWithPresence(
    raw.trySpeedBalanceUsd,
    raw.tryspeedBalanceUsd,
    raw.trySpeedUsd,
    raw.speedBalanceUsd,
    raw.speedBalanceUSD,
    raw.usdBalance,
    raw.balanceUsd
  );
  const { value: trySpeedBalanceSats, found: hasTrySpeedBalanceSats } = pickNumericWithPresence(
    raw.trySpeedBalanceSats,
    raw.trySpeedSats,
    raw.speedBalanceSats,
    raw.satsBalance,
    raw.balanceSats
  );
  const { value: trySpeedUsdRateRaw, found: hasTrySpeedUsdRate } = pickNumericWithPresence(
    raw.trySpeedUsdRate,
    raw.speedUsdRate,
    raw.usdRate
  );

  let trySpeedUsdRate = hasTrySpeedUsdRate ? trySpeedUsdRateRaw : null;
  if ((!trySpeedUsdRate || trySpeedUsdRate <= 0) && hasTrySpeedBalanceUsd && hasTrySpeedBalanceSats && trySpeedBalanceSats > 0) {
    const btcAmount = trySpeedBalanceSats / SATS_PER_BTC;
    if (btcAmount > 0) {
      trySpeedUsdRate = trySpeedBalanceUsd / btcAmount;
    }
  }
  if (trySpeedUsdRate && trySpeedUsdRate <= 0) {
    trySpeedUsdRate = null;
  }

  const fallbackBalance = pickNumeric(
    raw.currentBalance,
    totals.balance,
    totals.currentBalance,
    summary.balance,
    summary.currentBalance,
    totalDeposit - totalWithdraw
  );
  const currentBalance = hasTrySpeedBalanceUsd ? trySpeedBalanceUsd : fallbackBalance;

  const merchantId =
    raw.merchantId ||
    raw.id ||
    raw._id ||
    (raw.merchant && (raw.merchant.id || raw.merchant._id)) ||
    null;

  const merchantName =
    raw.merchantName ||
    raw.merchant_name ||
    (raw.merchant && (raw.merchant.name || raw.merchant.merchantName)) ||
    raw.name ||
    "Unknown Merchant";

  return {
    ...raw,
    merchantId,
    merchantName,
    storeAdmins: mergeStoreAdmins(
      raw.storeAdmins,
      raw.storeAdminNames,
      raw.store_admins,
      raw.storeAdminList
    ),
    totalDeposit,
    totalDepositCustomer,
    totalDepositAdmin,
    totalWithdraw,
    totalWithdrawCustomer,
    totalWithdrawAdmin,
    totalPayout,
    totalPendingWithdrawRequests,
    totalCommission,
    currentBalance,
    trySpeedBalanceUsd: hasTrySpeedBalanceUsd ? trySpeedBalanceUsd : null,
    trySpeedBalanceSats: hasTrySpeedBalanceSats ? trySpeedBalanceSats : null,
    trySpeedUsdRate,
  };
};

const normalizeReportRows = (payload) =>
  rowsFromPayload(payload)
    .map((row) => normalizeReportRow(row))
    .filter(Boolean);

const ReportsPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [merchantId, setMerchantId] = useState("");
  const [storeAdmin, setStoreAdmin] = useState("");
  const [gameName, setGameName] = useState("");
  const [allMerchants, setAllMerchants] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const { addNotification } = useNotification();

  const fetchMerchants = async () => {
    try {
      const { data } = await api.get("/merchants", {
        params: { select: "_id,name" },
      });
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
      setAllMerchants(list);
    } catch (error) {
      console.error("Failed to load merchants", error);
      addNotification("Failed to load merchants", "error");
    }
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (merchantId) params.merchantId = merchantId;
      if (storeAdmin) params.storeAdminName = storeAdmin.trim();
      if (gameName) params.gameName = gameName.trim();
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const { data } = await api.get("/reports/hubs", { params });
      if (data && typeof data === "object" && data.success === false) {
        if (data.message) {
          addNotification(data.message, "error");
        }
        setRows([]);
        return;
      }

      const normalized = normalizeReportRows(data);
      setRows(normalized);
    } catch (error) {
      console.error("Failed to load reports", error);
      addNotification("Failed to load reports", "error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPreset = (presetKey) => {
    setDatePreset(presetKey);
    if (presetKey === "all") {
      setDateFrom("");
      setDateTo("");
      return;
    }
    if (presetKey === "custom") {
      return;
    }
    const { from, to } = getPresetRange(presetKey);
    setDateFrom(from);
    setDateTo(to);
  };

  const resetFilters = () => {
    setMerchantId("");
    setStoreAdmin("");
    setGameName("");
    setDateFrom("");
    setDateTo("");
    setDatePreset("all");
  };

  const handleDateChange = (setter) => (event) => {
    setter(event.target.value);
    setDatePreset("custom");
  };

  const downloadCsv = () => {
    const qs = new URLSearchParams();
    if (merchantId) qs.set("merchantId", merchantId);
    if (storeAdmin) qs.set("storeAdminName", storeAdmin.trim());
    if (gameName) qs.set("gameName", gameName.trim());
    if (dateFrom) qs.set("dateFrom", dateFrom);
    if (dateTo) qs.set("dateTo", dateTo);
    qs.set("exportCsv", "1");
    window.location.href = `/api/reports/hubs?${qs.toString()}`;
  };

  const renderCurrency = (value) => {
    if (typeof value !== "number" || Number.isNaN(value)) return formatCurrency(0);
    return formatCurrency(value);
  };

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold mb-4">Reports</h2>

      <div className="grid md:grid-cols-5 gap-3 bg-gray-900 p-3 rounded mb-4">
        <select
          value={merchantId}
          onChange={(e) => setMerchantId(e.target.value)}
          className="bg-gray-800 p-2 rounded"
        >
          <option value="">All Gaming Hubs</option>
          {allMerchants.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>

        {/* <input
          value={storeAdmin}
          onChange={(e) => setStoreAdmin(e.target.value)}
          placeholder="Search Store Admin"
          className="bg-gray-800 p-2 rounded"
        />

        <input
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          placeholder="Game / Platform"
          className="bg-gray-800 p-2 rounded"
        /> */}

        <input
          type="date"
          value={dateFrom}
          onChange={handleDateChange(setDateFrom)}
          className="bg-gray-800 p-2 rounded"
        />

        <input
          type="date"
          value={dateTo}
          onChange={handleDateChange(setDateTo)}
          className="bg-gray-800 p-2 rounded"
        />

        <div className="col-span-5 flex flex-wrap gap-2">
          {presetOptions.map((preset) => (
            <button
              key={preset.key}
              className={`px-3 py-1 rounded border transition-colors ${
                datePreset === preset.key ? 'bg-teal-600 border-teal-500' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              }`}
              onClick={() => applyPreset(preset.key)}
              type="button"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="col-span-5 flex flex-wrap gap-2">
          <button
            onClick={loadReports}
            className="px-4 py-2 bg-teal-600 rounded disabled:opacity-60"
            disabled={loading}
            type="button"
          >
            {loading ? "Filtering..." : "Filter"}
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-700 rounded"
            type="button"
          >
            Reset
          </button>
          {/* <button
            onClick={downloadCsv}
            className="px-4 py-2 bg-gray-600 rounded"
            type="button"
          >
            Export CSV
          </button> */}
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-300">Loading reports...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-3 text-left">Merchant Name</th>
                <th className="p-3 text-left">Total Deposit (by customers)</th>
                <th className="p-3 text-left">Total Deposit (by admin)</th>
                <th className="p-3 text-left">Total Withdraw (to customers)</th>
                <th className="p-3 text-left">Total Payout (Withdraw by Store-Admin)</th>
                <th className="p-3 text-left">Total Pending Withdraw requests (by customers)</th>
                <th className="p-3 text-left">Total Commission (to super-admin)</th>
                <th className="p-3 text-left">Current Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.merchantId || row._id || row.id} className="border-t border-gray-700">
                  <td className="p-3">
                    <div className="font-medium text-white">{row.merchantName}</div>
                    {row.storeAdmins?.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        Store Admin: {row.storeAdmins.join(", ")}
                      </div>
                    )}
                  </td>
                  <td className="p-3">{renderCurrency(row.totalDepositCustomer)}</td>
                  <td className="p-3">{renderCurrency(row.totalDepositAdmin)}</td>
                  <td className="p-3">{renderCurrency(row.totalWithdrawCustomer)}</td>
                  <td className="p-3">{renderCurrency(row.totalWithdrawAdmin ?? row.totalPayout)}</td>
                  <td className="p-3">{formatNumber(row.totalPendingWithdrawRequests || 0)}</td>
                  <td className="p-3">{renderCurrency(row.totalCommission)}</td>
                  <td className="p-3">
                    <div>
                      {row.trySpeedBalanceSats != null
                        ? `${renderCurrency(row.currentBalance)} / ${formatNumber(row.trySpeedBalanceSats)} sats`
                        : renderCurrency(row.currentBalance)}
                    </div>
                    {row.trySpeedUsdRate != null && (
                      <div className="text-xs text-gray-400 mt-1">
                        Rate: {renderCurrency(row.trySpeedUsdRate)} / BTC
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-gray-400" colSpan={8}>
                    No report data for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
