"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { createSession } from "@/actions/session";
import { Swords, Loader2 } from "lucide-react";

export default function StaffLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await user.getIdToken();
      const result = await createSession(idToken);

      if (!result.success) throw new Error(result.error);
      if (result.role !== "staff" && result.role !== "admin") {
        throw new Error("Access denied. Staff or Admin role required.");
      }

      router.push("/staff/dashboard");
    } catch (err: any) {
      const msg: Record<string, string> = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/invalid-credential": "Invalid credentials.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
      };
      setError(msg[err.code] ?? err.message ?? "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[400px] space-y-6">

        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500 mx-auto flex items-center justify-center mb-4">
            <Swords size={24} className="text-white" />
          </div>
          <div className="text-2xl font-extrabold tracking-tighter text-white mb-1">
            STAFF <span className="text-amber-400">ACCESS</span>
          </div>
          <p className="text-sm text-gray-400 font-medium">Moderator & Match Manager Portal</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl px-6 py-8">
          <h1 className="text-lg font-bold mb-6 text-white">Staff Login</h1>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/40 border border-red-700 text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 ml-0.5">
                Staff Email
              </label>
              <input
                type="email"
                placeholder="staff@battlezone.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 ml-0.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Logging in…
                </>
              ) : (
                "Enter Staff Portal"
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link href="/login" className="text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
            ← Player Login
          </Link>
        </div>

      </div>
    </div>
  );
}
