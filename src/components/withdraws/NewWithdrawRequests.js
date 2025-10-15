// src/components/withdraws/NewWithdrawRequests.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "../ui/Card";

const NewWithdrawRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("/api/withdraws/pending"); // 🔧 adjust backend route
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching withdraw requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(`/api/withdraws/${id}/approve`);
      fetchRequests();
    } catch (err) {
      console.error("Error approving request", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`/api/withdraws/${id}/reject`);
      fetchRequests();
    } catch (err) {
      console.error("Error rejecting request", err);
    }
  };

  if (loading) return <p className="text-gray-400">Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">New Withdraw Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-400">No pending requests</p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req._id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{req.user?.email || "Unknown User"}</p>
                <p className="text-sm text-gray-400">
                  Amount: {req.amount} | Status: {req.status}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleApprove(req._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(req._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewWithdrawRequests;

