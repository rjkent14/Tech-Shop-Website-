import React, { useState, useEffect } from "react";

const Settings: React.FC = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setName(data.name || "");
        setAddress(data.address || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch user profile:", err);
        setLoading(false);
      });
  }, []);

  const handleSave = () => {
    const userId = localStorage.getItem("userId");
      localStorage.setItem("userName", name);
     localStorage.setItem("userAddress", address);  // 👈 save for checkout

    if (!userId) return;

    fetch(`http://localhost:5000/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || "Profile updated!");
        setPassword(""); // clear password field after update
      })
      .catch((err) => {
        console.error("Failed to update profile:", err);
        alert("Failed to update profile");
      });
  };

  if (loading) {
    return <p className="p-6">Loading profile...</p>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-medium">Full Name</label>
          <input
            type="text"
            className="mt-1 w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium">Address</label>
          <textarea
            className="mt-1 w-full border rounded px-3 py-2"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium">Change Password</label>
          <input
            type="password"
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <button
        className="mt-6 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleSave}
      >
        Save Changes
      </button>
    </div>
  );
};

export default Settings;
