import React, { useEffect, useState, useRef } from "react";
import { useNotification } from "../../hooks/useNotification";
import api from "../../utils/axios";
import { useAuth } from "../../hooks/useAuth";

const toYMD = (d) => {
  const dt = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return dt.toISOString().slice(0, 10);
};

const getPresetRange = (preset) => {
  const today = new Date();
  const ymdToday = toYMD(today);

  switch (preset) {
    case "today":
      return { dateFrom: ymdToday, dateTo: ymdToday };
    case "yesterday": {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const ymd = toYMD(y);
      return { dateFrom: ymd, dateTo: ymd };
    }
    case "this_week": {
      const dow = (today.getDay() + 6) % 7; // Monday-start week
      const start = new Date(today);
      start.setDate(start.getDate() - dow);
      return { dateFrom: toYMD(start), dateTo: ymdToday };
    }
    case "last_7": {
      const start = new Date(today);
      start.setDate(start.getDate() - 6); // inclusive today
      return { dateFrom: toYMD(start), dateTo: ymdToday };
    }
    case "last_30": {
      const start = new Date(today);
      start.setDate(start.getDate() - 29); // inclusive today
      return { dateFrom: toYMD(start), dateTo: ymdToday };
    }
    case "this_year": {
      const start = new Date(today.getFullYear(), 0, 1);
      return { dateFrom: toYMD(start), dateTo: ymdToday };
    }
    default:
      return { dateFrom: "", dateTo: "" };
  }
};

const TransactionFilters = ({ onChange, includeMerchant = false }) => {
  const { user, allMerchants } = useAuth();
  const isStoreAdmin = user?.role === "store_admin";
  const [state, setState] = useState({
    q: "",
    orderId: "",
    type: "",
    status: "",
    method: "",
    actionBy: "",
    dateFrom: "",
    dateTo: "",
    merchantId: "",
    platformId: "", // New state for Platform
    datePreset: "all", // default = All (no date filter)
  });
  const [merchants, setMerchants] = useState([]);
  const [platforms, setPlatforms] = useState([]); // New state for Platforms
  const merchantsReqRef = useRef(null);
  const platformsReqRef = useRef(null);
  const { addNotification } = useNotification();

  useEffect(() => {
    if (!includeMerchant) return;

    // cancel any in-flight request for merchants
    merchantsReqRef.current?.abort?.();
    merchantsReqRef.current = new AbortController();

    (async () => {
      try {
        const { data } = await api.get("/merchants", {
          params: { select: "_id,name,subdomain" }, // keep payload small
          signal: merchantsReqRef.current.signal, // enable abort
        });
        // setMerchants(Array.isArray(data) ? data : []);
         const merchants = Array.isArray(data) ? data : [];
        // sort by name (case-insensitive)
        merchants.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

        setMerchants(merchants);
      } catch (err) {
        // ignore intentional cancels
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        console.error("Failed to load merchants", err);
        addNotification("Failed to load merchants", "error");
      }
    })();

    return () => merchantsReqRef.current?.abort?.();
  }, [includeMerchant]);

  // Fetch platforms from API
  useEffect(() => {
    console.log("Use effect called");
    platformsReqRef.current?.abort?.();
    platformsReqRef.current = new AbortController();

    (async () => {
      try {
        const { data } = await api.get("/platforms", {
          signal: platformsReqRef.current.signal, // enable abort
        });
        const platforms = Array.isArray(data) ? data : [];
        // sort by name (case-insensitive)
        platforms.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
        console.log("platforms>>>>>>", platforms);
        // If not including merchant selector (i.e., non-super roles), limit platforms to the user's merchant
        if (!includeMerchant) {
          // const merchant = allMerchants?.find(m => m._id === user?.merchantId);
          // const allowed = new Set((merchant?.platforms || []).map(String));
          // const filtered = allowed.size > 0 ? platforms.filter(p => allowed.has(String(p._id))) : platforms;
          // setPlatforms(filtered);
          setPlatforms(platforms);
        } else {
          setPlatforms(platforms);
        }
        
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        console.error("Failed to load platforms", err);
        addNotification("Failed to load platforms", "error");
      }
    })();

    return () => platformsReqRef.current?.abort?.();
  }, [includeMerchant, user?.merchantId, allMerchants]);

  const update = (patch) => {
    const next = { ...state, ...patch };
    setState(next);
    onChange?.(next);
  };

  const applyPreset = (preset) => {
    if (preset === "all") {
      update({ datePreset: "all", dateFrom: "", dateTo: "" });
      return;
    }
    if (preset === "custom") {
      update({ datePreset: "custom" }); // keep current manual dates
      return;
    }
    const { dateFrom, dateTo } = getPresetRange(preset);
    update({ datePreset: preset, dateFrom, dateTo });
  };

  const presets = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "this_week", label: "This Week" },
    { key: "last_7", label: "Last 7 Days" },
    { key: "last_30", label: "Last 30 Days" },
    { key: "this_year", label: "This Year" },
    { key: "custom", label: "Custom" },
  ];

  const isCustom = state.datePreset === "custom";

  return (
    <div className="flex flex-wrap items-center gap-3 bg-gray-900 p-3 rounded-md">
      {includeMerchant && (
        <select
          className="bg-gray-800 p-2 rounded text-white"
          value={state.merchantId}
          onChange={(e) => update({ merchantId: e.target.value })}
        >
          <option value="">All Merchants</option>
          {merchants.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
      )}

      <select
        className="bg-gray-800 p-2 rounded text-white"
        value={state.platformId}
        onChange={(e) => update({ platformId: e.target.value })}
      >
        <option value="">All Platforms</option>
        {platforms.map((platform) => (
          <option key={platform._id} value={platform._id}>
            {platform.name}
          </option>
        ))}
      </select>

      <select
        className="bg-gray-800 p-2 rounded text-white"
        value={state.type}
        onChange={(e) => update({ type: e.target.value })}
      >
        <option value="">Type</option>
        <option value="deposit">Deposit</option>
        <option value="withdraw">Redeem</option>
        {isStoreAdmin && <option value="withdraw_admin">Withdraw</option>}
      </select>

      <select
        className="bg-gray-800 p-2 rounded text-white"
        value={state.status}
        onChange={(e) => update({ status: e.target.value })}
      >
        <option value="">Status</option>
        <option value="unpaid">Unpaid</option>
        <option value="expired">Expired</option>
        <option value="completed">Completed</option>
        <option value="paid">Paid</option>
        <option value="pending">Pending</option>
        <option value="rejected">Rejected</option>
        <option value="sent">Sent</option>
      </select>

      <select
        className="bg-gray-800 p-2 rounded text-white"
        value={state.method}
        onChange={(e) => update({ method: e.target.value })}
      >
        <option value="">Method</option>
        <option value="lightning">Lightning</option>
        <option value="onchain">On-Chain</option>
      </select>

      <input
        className="bg-gray-800 p-2 rounded text-white"
        placeholder="Search (Order/Amount)"
        value={state.q}
        onChange={(e) => update({ q: e.target.value })}
      />

      <input
        className="bg-gray-800 p-2 rounded text-white"
        placeholder="Order ID"
        value={state.orderId}
        onChange={(e) => update({ orderId: e.target.value })}
      />

      {/* Preset Buttons Row (spans full width) */}
      <div className="flex flex-wrap gap-2 overflow-x-auto">
        {presets.map((p) => {
          const active = state.datePreset === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => applyPreset(p.key)}
              className={[
                "px-3 py-2 rounded-full whitespace-nowrap transition",
                active
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600",
                "border border-gray-600/50",
              ].join(" ")}
              aria-pressed={active}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom Dates (enabled only if preset = custom) */}
      <div className="flex gap-3">
        <input
          type="date"
          className={`bg-gray-800 p-2 rounded text-white ${
            !isCustom ? "opacity-60 cursor-not-allowed" : ""
          }`}
          value={state.dateFrom}
          disabled={!isCustom}
          onChange={(e) => update({ dateFrom: e.target.value })}
        />
        <input
          type="date"
          className={`bg-gray-800 p-2 rounded text-white ${
            !isCustom ? "opacity-60 cursor-not-allowed" : ""
          }`}
          value={state.dateTo}
          disabled={!isCustom}
          onChange={(e) => update({ dateTo: e.target.value })}
        />
      </div>

      <button
        className="px-3 py-2 bg-teal-600 rounded text-white"
        onClick={() => onChange?.(state)}
      >
        Filter
      </button>
      <button
        className="px-3 py-2 bg-gray-700 rounded text-white"
        onClick={() => {
          const reset = {
            q: "",
            orderId: "",
            type: "",
            status: "",
            method: "",
            actionBy: "",
            dateFrom: "",
            dateTo: "",
            merchantId: "",
            platformId: "",
            datePreset: "all",
          };
          setState(reset);
          onChange?.(reset);
        }}
      >
        Clear
      </button>
    </div>
  );
};

export default TransactionFilters;
