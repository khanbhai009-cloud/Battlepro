"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { createSession } from "@/actions/session";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
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
      // 1. Firebase client-side sign in
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      // 2. Get fresh ID token
      const idToken = await user.getIdToken();

      // 3. Server action: verify token, set HTTP-only session + role cookies
      const result = await createSession(idToken);
      if (!result.success) throw new Error(result.error);

      // 4. Redirect based on role
      if (result.role === "admin") {
        router.push("/admin/dashboard");
      } else if (result.role === "staff") {
        router.push("/staff/dashboard");
      } else {
        router.push("/home");
      }
    } catch (err: any) {
      const msg: Record<string, string> = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/invalid-credential": "Invalid email or password.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/invalid-email": "Please enter a valid email address.",
      };
      setError(msg[err.code] ?? err.message ?? "Login failed. Please try again.");
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
          <p className="text-sm text-muted font-medium italic">Elite Esports Experience</p>
        </div>

        {/* Card */}
        <div className="card-base shadow-lg px-6 py-8">
          <h1 className="text-xl font-bold mb-6 text-foreground">Welcome Back</h1>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted ml-0.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="commander@battlezone.pro"
                className="auth-input"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted ml-0.5">
                Access Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="auth-input"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full py-3 text-sm mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Logging in…
                </>
              ) : (
                "Login to Battlefield"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted font-medium mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Join the Elite
            </Link>
          </p>
        </div>

        {/* Staff / Admin Links */}
        <div className="flex justify-center items-center gap-6">
          <Link
            href="/staff/login"
            className="text-[11px] font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors"
          >
            Staff Access
          </Link>
          <span className="text-border select-none text-xs">|</span>
          <Link
            href="/admin/login"
            className="text-[11px] font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors"
          >
            Admin Terminal
          </Link>
        </div>

      </div>
    </div>
  );
}
