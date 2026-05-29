// "use client";

// import { useState, useEffect, use } from "react";
// import { useRouter } from "next/navigation";

// export default function UserPage() {
//   const [user, setUser] = useState(null);
//   const [categories, setCategories] = useState([]);
//   const [cart, setCart] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [placingOrder, setPlacingOrder] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     // 1. Get user from cookie
//     const getCookie = (name) => {
//       const value = `; ${document.cookie}`;
//       const parts = value.split(`; ${name}=`);
//       if (parts.length === 2) return parts.pop().split(";").shift();
//       return null;
//     };

//     const userDataCookie = getCookie("user_data");
//     if (!userDataCookie) {
//       router.push("/");
//       return;
//     }

//     const parsedUser = JSON.parse(decodeURIComponent(userDataCookie));
//     setUser(parsedUser);
//     console.log(user);
    

//     // 2. Fetch products for this hostel
//     const fetchProducts = async () => {
//       try {
//         const res = await fetch("/UserPage/api/products");
//         if (res.ok) {
//           const data = await res.json();
//           setCategories(data.products || []);
//         }
//       } catch (error) {
//         console.error("Failed to fetch products", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [router]);

//   // Cart Functions
//   const addToCart = (product) => {
//     setCart((prev) => {
//       const existing = prev.find((item) => item._id === product._id);
//       if (existing) {
//         return prev.map((item) =>
//           item._id === product._id ? { ...item, qty: item.qty + 1 } : item
//         );
//       }
//       return [...prev, { ...product, qty: 1 }];
//     });
//   };

//   const removeFromCart = (productId) => {
//     setCart((prev) => prev.filter((item) => item._id !== productId));
//   };

//   const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

//   // Submit Order
//   const handleCheckout = async () => {
//     if (cart.length === 0) return;
//     setPlacingOrder(true);
//     try {
//       const res = await fetch("/api/user/order", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ cart, total: cartTotal }),
//       });
      
//       if (res.ok) {
//         alert("Order placed successfully!");
//         setCart([]); // Clear cart
//       } else {
//         alert("Failed to place order.");
//       }
//     } catch (error) {
//       console.error(error);
//       alert("Error placing order.");
//     } finally {
//       setPlacingOrder(false);
//     }
//   };

//   if (loading) {
//     return <div className="flex min-h-screen items-center justify-center dark:bg-black dark:text-white">Loading menu...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black dark:text-zinc-100">
//       <div className="mx-auto max-w-6xl">
//         {/* Header */}
//         <header className="mb-8 flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
//           <div>
//             <h1 className="text-2xl font-bold">Welcome, {user?.fullname}</h1>
//             <p className="text-zinc-500 dark:text-zinc-400">{user?.hostelname} Provisions</p>
//           </div>
//           <button 
//             onClick={() => {
//               document.cookie = "user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//               router.push("/");
//             }}
//             className="rounded-lg border border-red-500 px-4 py-2 text-red-500 transition hover:bg-red-500 hover:text-white"
//           >
//             Logout
//           </button>
//         </header>

//         <div className="flex flex-col gap-8 md:flex-row">
//           {/* Product List */}
//           <div className="flex-1 space-y-8">
//             {categories.length === 0 ? (
//               <p>No products available yet.</p>
//             ) : (
//               categories.map((category) => (
//                 <div key={category._id} className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
//                   <h2 className="mb-4 text-xl font-semibold capitalize">{category.category}</h2>
//                   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                     {category.products.map((product) => (
//                       <div key={product._id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
//                         {/* If you have images later, you can add an <img> tag here using product.img */}
//                         <div className="h-32 w-full rounded-md bg-zinc-100 dark:bg-zinc-800 mb-3 flex items-center justify-center text-zinc-400">Image</div>
//                         <h3 className="font-medium">{product.name}</h3>
//                         <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">₹{product.price}</p>
//                         <button
//                           onClick={() => addToCart(product)}
//                           className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
//                         >
//                           Add to Cart
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>

//           {/* Shopping Cart Sidebar */}
//           <div className="w-full md:w-80">
//             <div className="sticky top-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
//               <h2 className="mb-4 text-xl font-semibold">Your Cart</h2>
//               {cart.length === 0 ? (
//                 <p className="text-sm text-zinc-500 dark:text-zinc-400">Cart is empty</p>
//               ) : (
//                 <div className="space-y-4">
//                   {cart.map((item) => (
//                     <div key={item._id} className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
//                       <div>
//                         <p className="text-sm font-medium">{item.name}</p>
//                         <p className="text-xs text-zinc-500">₹{item.price} x {item.qty}</p>
//                       </div>
//                       <button 
//                         onClick={() => removeFromCart(item._id)}
//                         className="text-xs text-red-500 hover:underline"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   ))}
//                   <div className="pt-2 text-lg font-bold">
//                     Total: ₹{cartTotal}
//                   </div>
//                   <button
//                     onClick={handleCheckout}
//                     disabled={placingOrder}
//                     className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
//                   >
//                     {placingOrder ? "Processing..." : "Place Order"}
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// code v2 better ui


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, LogOut, PackageOpen, Loader2 } from "lucide-react";
import { clearAuthCookies } from "@/lib/authClient";

export default function UserPage() {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. Get user from cookie
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    };

    const userDataCookie = getCookie("user_data");
    if (!userDataCookie) {
      router.push("/");
      return;
    }

    const parsedUser = JSON.parse(decodeURIComponent(userDataCookie));
    setUser(parsedUser);

    // 2. Fetch products for this hostel
    const fetchProducts = async () => {
      try {
        const res = await fetch("/UserPage/api/products");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.products || []);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [router]);

  // Cart Functions
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item._id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Submit Order
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setPlacingOrder(true);
    try {
      const res = await fetch("/UserPage/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, total: cartTotal }),
      });
      
      if (res.ok) {
        alert("Order placed successfully!");
        setCart([]); // Clear cart
      } else {
        alert("Failed to place order.");
      }
    } catch (error) {
      console.error(error);
      alert("Error placing order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black dark:text-zinc-100">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-zinc-500">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black dark:text-zinc-100">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md md:px-8 dark:border-zinc-800 dark:bg-zinc-950/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {user?.hostelname} Provisions
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Welcome back, {user?.name || user?.fullname}
          </p>
        </div>
        <button 
          onClick={async () => {
            await clearAuthCookies();
            router.push("/");
          }}
          className="flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 p-4 md:flex-row md:p-8">
        
        {/* Main Content: Product List */}
        <main className="flex-1 space-y-12">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-800">
              <PackageOpen className="mb-4 h-12 w-12 text-zinc-400" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No products yet</h3>
              <p className="text-sm text-zinc-500">Your admin hasn't added any provisions.</p>
            </div>
          ) : (
            categories.map((category) => (
              <section key={category._id}>
                <h2 className="mb-6 text-2xl font-bold capitalize text-zinc-900 dark:text-white">
                  {category.category}
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {category.products.map((product) => (
                    <div 
                      key={product._id} 
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <div>
                        {/* Image Placeholder - Replace src when you have real images */}
                        <div className="mb-4 aspect-square w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
                          {product.img && product.img !== "default-image-url.jpg" ? (
                            <img src={product.img} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-zinc-400">No Image</div>
                          )}
                        </div>
                        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-zinc-800 dark:text-zinc-200">
                          {product.name}
                        </h3>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-bold text-zinc-900 dark:text-white">
                          ₹{product.price}
                        </span>
                        <button
                          onClick={() => addToCart(product)}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 active:scale-95"
                          title="Add to cart"
                        >
                          <span className="text-xl leading-none">+</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </main>

        {/* Sidebar: Shopping Cart */}
        <aside className="w-full md:w-96 md:shrink-0">
          <div className="sticky top-28 flex flex-col rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            
            <div className="flex items-center gap-3 border-b border-zinc-100 p-6 dark:border-zinc-800">
              <ShoppingBag className="text-blue-600" />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Your Cart</h2>
              <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {cart.reduce((total, item) => total + item.qty, 0)}
              </span>
            </div>

            <div className="flex max-h-[50vh] flex-col gap-4 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <p className="text-center text-sm text-zinc-500">Your cart is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="flex items-center justify-between group">
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">{item.name}</span>
                      <span className="text-xs text-zinc-500">₹{item.price} × {item.qty}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        ₹{item.price * item.qty}
                      </span>
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="text-zinc-400 transition hover:text-red-500"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            <div className="border-t border-zinc-100 p-6 bg-zinc-50 rounded-b-3xl dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Total Amount</span>
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">₹{cartTotal}</span>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || placingOrder}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placingOrder ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>
            </div>
            
          </div>
        </aside>

      </div>
    </div>
  );
}

