import React, { useState, useEffect } from "react";
import api from "../../utils/axios";
import Button from "../ui/Button";

const PlatformForm = ({ initialData, defaultMerchantId, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: ""
  });
  const [saving, setSaving] = useState(false);


  // Prime form on edit
  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        ...initialData,
        merchantId:
          initialData.merchantId?._id || initialData.merchantId || prev.merchantId,
      }));
    }
    // eslint-disable-next-line
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const isUpdate = Boolean(initialData?._id);

    try {
      const payload = {
        name: form.name?.trim(),

      };

      if (isUpdate) {
        await api.put(`/platforms/${initialData._id}`, payload);
      } else {
        await api.post("/platforms", payload);
      }
      onSaved?.(isUpdate ? "updated" : "created");
    } catch (err) {
      console.error("Save failed", err);
      onSaved?.("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className={defaultMerchantId ? "md:col-span-2" : ""}>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            🎮 Platform Name
          </label>
          <input
            name="name"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:border-teal-500 focus:ring-teal-500 focus:bg-gray-600"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="e.g., Golden Dragon"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default PlatformForm;
