import React, { useEffect, useState } from "react";
import { Edit, Trash2, Trophy } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import PlatformForm from "./PlatformForm";
import api from "../../utils/axios";
import { useNotification } from "../../hooks/useNotification";

const PlatformList = () => {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { addNotification } = useNotification();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/platforms");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load platforms", err);
      addNotification("Failed to load platforms!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this platform?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/platforms/${id}`);
      addNotification("Platform deleted.", "success");
      await load();
    } catch (err) {
      console.error("Delete failed", err);
      addNotification("Failed to delete platforms.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Trophy className="h-6 w-6 text-teal-400 mr-2" />
          Platforms
        </h2>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          + Create Platform
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-300">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    🎮 Platform
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ⚙️ Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {items.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {r.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => {
                            setEditing(r);
                            setModalOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="small"
                          variant="danger"
                          disabled={deletingId === r._id}
                          onClick={() => remove(r._id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-gray-400" colSpan="8">
                      No platforms.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl p-4 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">
                {editing ? "Edit platforms" : "Create platforms"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400"
              >
                ✕
              </button>
            </div>
            <PlatformForm
              initialData={editing}
              onClose={() => setModalOpen(false)}
              onSaved={async (action) => {
                setModalOpen(false);
                setEditing(null);
                if (action === "created") {
                  addNotification("Platform created successfully!", "success");
                } else if (action === "updated") {
                  addNotification("Platform updated successfully!", "success");
                } else if (action === "error") {
                  addNotification("Failed to save platform.", "error");
                }
                await load();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformList;
