"use client";

import { Button } from "@/components/ui/Button";
import { Sidebar } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="text-2xl font-extrabold tracking-tighter mb-2">
            BATTLEZONE <span className="text-primary">PRO</span>
          </div>
          <p className="text-sm text-muted font-medium italic">Elite Esports Experience</p>
        </div>

        <div className="card-base shadow-xl">
          <h1 className="text-xl font-bold mb-6">Welcome Back</h1>
          
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="commander@battlezone.pro"
                className="auth-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Access Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="auth-input"
              />
            </div>

            <Button className="w-full py-6 text-base mt-2" asChild>
              <Link href="/home">Login to Battlefield</Link>
            </Button>
          </form>

          <p className="text-center text-xs text-muted font-medium mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Join the Elite
            </Link>
          </p>
        </div>

        <div className="text-center mt-10 space-x-6">
          <Link href="/staff/login" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            Staff Access
          </Link>
          <Link href="/admin/login" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors border-l border-border pl-6">
            Admin Terminal
          </Link>
        </div>
      </div>
    </div>
  );
}
