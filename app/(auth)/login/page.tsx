"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] space-y-6">

        {/* Brand */}
        <div className="text-center mb-2">
          <div className="text-2xl font-extrabold tracking-tighter text-foreground mb-1">
            BATTLEZONE <span className="text-primary">PRO</span>
          </div>
          <p className="text-sm text-muted font-medium italic">Elite Esports Experience</p>
        </div>

        {/* Card */}
        <div className="card-base shadow-lg px-6 py-8">
          <h1 className="text-xl font-bold mb-6 text-foreground">Welcome Back</h1>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); router.push("/home"); }}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted ml-0.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="commander@battlezone.pro"
                className="auth-input"
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
              />
            </div>

            <Button type="submit" className="w-full py-3 text-sm mt-2">
              Login to Battlefield
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
        <div className="flex justify-center items-center gap-6 pt-2">
          <Link
            href="/staff/login"
            className="text-[11px] font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors"
          >
            Staff Access
          </Link>
          <span className="text-border text-xs select-none">|</span>
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
