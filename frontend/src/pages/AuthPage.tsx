import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "../lib/firebase";

const AuthPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const navigate = useNavigate();

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        navigate("/questions"); // Redirect once authenticated
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Email/Password submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setPersistence(auth, browserLocalPersistence);

      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created successfully! You can now sign in.");
        setIsRegister(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-lg shadow-xl border border-emerald-200 w-full max-w-md">
        {/* Logo + Heading */}
        <div className="flex items-center justify-center mb-6">
          <img src="/favicon.png" alt="OptiLogix Logo" className="h-10 w-10 mr-2" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            {isRegister ? "Register" : "Sign In"}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col items-center justify-between gap-4">
            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-2 px-4 rounded-md shadow-lg hover:from-emerald-600 hover:to-teal-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-opacity-75"
            >
              {isRegister ? "Register" : "Sign In"}
            </button>

            {/* Toggle register/sign-in */}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="inline-block align-baseline font-bold text-sm text-emerald-600 hover:text-emerald-800 transition duration-200"
            >
              {isRegister ? "Already have an account? Sign In" : "Need an account? Register"}
            </button>

            {/* Continue without login */}
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-md shadow-lg hover:bg-gray-300 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 mb-2"
            >
              Continue without Sign In
            </button>

            {/* Google login */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            >
              Sign In with Google
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
