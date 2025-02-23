import { useState } from "react";
import Web3 from "web3";

const vegetables = [
  { id: 1, name: "Tomato", price: 0.01, image: "url" },
  { id: 2, name: "Potato", price: 0.002, image: "url" },
  { id: 3, name: "Onion", price: 0.004, image: "url" },
  { id: 4, name: "Carrot", price: 0.005, image: "url" },
  { id: 5, name: "Cabbage", price: 0.007, image: "url" },
  { id: 6, name: "Capsicum", price: 0.1, image: "url" },
];

const WEBSITE_ACCOUNT = "0xYourWebsiteEthAddress";

export default function App() {
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState("login");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [web3, setWeb3] = useState(null);

  const addToCart = (veg) => setCart([...cart, veg]);
  const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));
  const total = cart.reduce((sum, item) => sum + item.price, 0).toFixed(4);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserEmail(formData.email);
    setIsLoggedIn(true);
    setPage("home");
  };

  const connectWallet = async () => {
    if (!isLoggedIn) {
      alert("Please log in first before connecting your wallet.");
      return;
    }

    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3Instance.eth.getAccounts();
        setWalletAddress(accounts[0]);
        setWeb3(web3Instance);
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert("Please install MetaMask to connect your wallet.");
    }
  };

  const handleCheckout = async () => {
    if (!walletAddress || !web3) {
      alert("Please connect your wallet first.");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      const transaction = await web3.eth.sendTransaction({
        from: walletAddress,
        to: WEBSITE_ACCOUNT,
        value: web3.utils.toWei(total, "ether"),
        gas: 21000,
      });

      console.log("Transaction successful:", transaction);
      alert("Order placed successfully! Transaction Hash: " + transaction.transactionHash);
      setCart([]);
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed. Please try again.");
    }
  };

  return (
    <div style={{ backgroundColor: "#ffffff", color: "#000000", fontFamily: "Arial, sans-serif", padding: "20px", width: "100vw", minHeight: "100vh", textAlign: "center" }}>
      <nav style={{ backgroundColor: "#4CAF50", padding: "15px", color: "white", fontSize: "20px", fontWeight: "bold", textAlign: "center", borderRadius: "5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>FarmConnect</span>
        <div>
          {["Home", "About"].map((item) => (
            <button key={item} style={{ margin: "0 10px", backgroundColor: "transparent", border: "none", color: "white", cursor: "pointer", fontSize: "16px" }} onClick={() => setPage(item.toLowerCase())}>
              {item}
            </button>
          ))}

          {isLoggedIn ? (
            walletAddress ? (
              <span style={{ backgroundColor: "#333", padding: "5px 10px", borderRadius: "5px", color: "yellow", fontSize: "14px" }}>
                {walletAddress.substring(0, 6)}...{walletAddress.slice(-4)}
              </span>
            ) : (
              <button style={{ backgroundColor: "blue", border: "none", color: "white", cursor: "pointer", padding: "5px 10px", borderRadius: "5px" }} onClick={connectWallet}>
                Connect Wallet
              </button>
            )
          ) : (
            <button style={{ margin: "0 10px", backgroundColor: "blue", border: "none", color: "white", cursor: "pointer", padding: "5px 10px", borderRadius: "5px" }} onClick={() => setPage("login")}>
              Login / Register
            </button>
          )}
        </div>
      </nav>

      {page === "login" && (
        <div>
          <h2>Login / Register</h2>
          <form onSubmit={handleSubmit} style={{ margin: "20px auto", maxWidth: "300px" }}>
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <button type="submit">Login / Register</button>
          </form>
        </div>
      )}

      {page === "home" && isLoggedIn && (
        <>
          <h1>Welcome to FarmConnect</h1>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            {vegetables.map((veg) => (
              <div key={veg.id} style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "10px", width: "200px", textAlign: "center" }}>
                <h2>{veg.name}</h2>
                <p>ETH {veg.price}</p>
                <button style={{ backgroundColor: "#4CAF50", color: "white", border: "none", padding: "5px 10px", cursor: "pointer", borderRadius: "5px" }} onClick={() => addToCart(veg)}>
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          <h2>Shopping Cart</h2>
          {cart.length > 0 ? (
            <>
              <ul style={{ listStyleType: "none", padding: "0" }}>
                {cart.map((item) => (
                  <li key={item.id} style={{ display: "flex", justifyContent: "space-between", margin: "10px auto", padding: "10px", width: "300px", border: "1px solid #ddd", borderRadius: "5px" }}>
                    <span>{item.name} - ETH {item.price}</span>
                    <button style={{ backgroundColor: "red", color: "white", border: "none", padding: "5px", cursor: "pointer", borderRadius: "5px" }} onClick={() => removeFromCart(item.id)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <h3>Total: {total} ETH</h3>
              <button onClick={handleCheckout} style={{ backgroundColor: "red", color: "white", padding: "10px", borderRadius: "5px" }}>
                Checkout & Pay
              </button>
            </>
          ) : (
            <p>Your cart is empty.</p>
          )}
        </>
      )}
    </div>
  );
}
