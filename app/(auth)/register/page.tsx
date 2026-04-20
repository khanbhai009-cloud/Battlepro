"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { registerNewUser } from "@/actions/auth";
import { createSession } from "@/actions/session";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    ffName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.ffName.trim().length < 2) {
      setError("In-game name must be at least 2 characters.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Firebase Auth user
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);

      // 2. Create Firestore user document (role: "user" hardcoded)
      await registerNewUser(user.uid, form.email, form.ffName.trim());

      // 3. Get ID token and create session cookies
      const idToken = await user.getIdToken();
      const result = await createSession(idToken);

      if (!result.success) throw new Error(result.error);

      router.push("/home");
    } catch (err: any) {
      const msg: Record<string, string> = {
        "auth/email-already-in-use": "This email is already registered.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-email": "Please enter a valid email address.",
      };
      setError(msg[err.code] ?? err.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] space-y-6">

        {/* Brand */}
        <div className="text-center">
          <div className="text-2xl font-extrabold tracking-tighter text-foreground mb-1">
            BATTLEZONE <span className="text-primary">PRO</span>
          </div>
          <p className="text-sm text-muted font-medium italic">Join the Elite Warriors</p>
        </div>

        {/* Card */}
        <div className="card-base shadow-lg px-6 py-8">
          <h1 className="text-xl font-bold mb-6 text-foreground">Create Account</h1>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted ml-0.5">
                In-Game Name (BGMI / FF Name)
              </label>
              <input
                name="ffName"
                type="text"
                placeholder="e.g. SnipeKing99"
                className="auth-input"
                value={form.ffName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted ml-0.5">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                placeholder="commander@battlezone.pro"
                className="auth-input"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted ml-0.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="Min 6 characters"
                className="auth-input"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted ml-0.5">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="auth-input"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full py-3 text-sm mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating Account…
                </>
              ) : (
                "Join the Battlefield"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted font-medium mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
