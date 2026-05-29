// CODE V2

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, PackagePlus, LayoutDashboard, LogOut } from "lucide-react";
import { clearAuthCookies } from "@/lib/authClient";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("register");
  const [adminName, setAdminName] = useState("");

  // --- Register User State ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [registering, setRegistering] = useState(false);

  // --- Add Product State ---
  const [category, setCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [imgUrl, setImgUrl] = useState("");
  const [productMessage, setProductMessage] = useState("");
  const [addingProduct, setAddingProduct] = useState(false);

  // Fetch Admin Name on load
  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    };
    const userDataStr = getCookie("user_data");
    if (userDataStr) {
      const user = JSON.parse(decodeURIComponent(userDataStr));
      setAdminName(user.name || user.fullname);
    }
  }, []);

  const handleLogout = async () => {
    await clearAuthCookies();
    router.push("/");
  };

  async function handleRegister(e) {
    e.preventDefault();
    setRegistering(true);
    setRegisterMessage("");
    try {
      const res = await fetch("/AdminDashboard/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullname }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setRegisterMessage("User registered successfully");
      setEmail("");
      setPassword("");
      setFullname("");
    } catch (err) {
      setRegisterMessage(err.message);
    } finally {
      setRegistering(false);
    }
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    setAddingProduct(true);
    setProductMessage("");
    try {
      const res = await fetch("/AdminDashboard/api/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: category.trim(),
          name: productName,
          price: Number(price),
          stock: Number(stock),
          img: imgUrl || "default-image-url.jpg",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add product");

      setProductMessage("Product added successfully!");
      setProductName("");
      setPrice("");
      setStock("10");
      setImgUrl("");
    } catch (err) {
      setProductMessage(err.message);
    } finally {
      setAddingProduct(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black dark:text-zinc-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-col border-r border-zinc-200 bg-white p-6 hidden md:flex dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <LayoutDashboard size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Admin Panel
          </span>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("register")}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "register"
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white"
            }`}
          >
            <UserPlus size={18} />
            Register User
          </button>
          <button
            onClick={() => setActiveTab("product")}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "product"
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white"
            }`}
          >
            <PackagePlus size={18} />
            Add Product
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between border-b border-zinc-200 bg-white px-8 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center md:hidden">
            {/* Mobile Title (visible only on small screens) */}
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Admin Panel
            </span>
          </div>
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              {activeTab === "register"
                ? "User Management"
                : "Inventory Management"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Welcome, {adminName || "Admin"}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Form Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Mobile Tab Switcher */}
          <div className="mb-6 flex w-full overflow-hidden rounded-xl bg-zinc-200 p-1 md:hidden dark:bg-zinc-800">
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${activeTab === "register" ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white" : "text-zinc-600 dark:text-zinc-400"}`}
            >
              Register
            </button>
            <button
              onClick={() => setActiveTab("product")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${activeTab === "product" ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white" : "text-zinc-600 dark:text-zinc-400"}`}
            >
              Add Product
            </button>
          </div>

          <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10 dark:border-zinc-800 dark:bg-zinc-950">
            {/* --- REGISTER USER FORM --- */}
            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    Register New User
                  </h1>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Create an account for a new hostel resident.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Full Name
                    </span>
                    <input
                      type="text"
                      required
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      placeholder="e.g. John Doe"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Email Address
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      placeholder="user@example.com"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Password
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      placeholder="••••••••"
                    />
                  </label>
                </div>

                {registerMessage && (
                  <div
                    className={`rounded-lg p-4 text-sm ${registerMessage.includes("success") ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
                  >
                    {registerMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={registering}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {registering ? "Registering User..." : "Register User"}
                </button>
              </form>
            )}

            {/* --- ADD PRODUCT FORM --- */}
            {activeTab === "product" && (
              <form onSubmit={handleAddProduct} className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    Add New Product
                  </h1>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Add an item to the hostel inventory.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Product Name
                      </span>
                      <input
                        type="text"
                        required
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        placeholder="e.g. Lays Magic Masala"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Category
                      </span>
                      <input
                        type="text"
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        placeholder="e.g. Snacks"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Price (₹)
                      </span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        placeholder="0.00"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Initial Stock
                      </span>
                      <input
                        type="number"
                        required
                        min="1"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        placeholder="10"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Image URL (Optional)
                    </span>
                    <input
                      type="url"
                      value={imgUrl}
                      onChange={(e) => setImgUrl(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      placeholder="https://example.com/image.jpg"
                    />
                  </label>
                </div>

                {productMessage && (
                  <div
                    className={`rounded-lg p-4 text-sm ${productMessage.includes("success") ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
                  >
                    {productMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={addingProduct}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {addingProduct
                    ? "Adding Product..."
                    : "Add Product to Inventory"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
