"use client";

import { Alert } from "@heroui/alert";
import { Button, Input } from "@heroui/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

function LoginPage() {
  const [role, setRole] = useState<"ipnu" | "ippnu">("ipnu");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    const res = await signIn("credentials", {
      username: role,
      password,
      redirect: false,
    });

    if (res?.ok) {
      router.push(role === "ipnu" ? "/admin_ipnu/dashboard" : "/admin_ippnu");
    } else {
      setError(true);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl shadow-2xl">
      <div className="w-full max-w-md rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Silakan Masuk Rekan</h1>

        {error && (
          <div className="mb-4">
            <Alert color="danger" title="Anda Bukan Admin" />
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Tombol IPNU / IPPNU */}
          <div className="flex justify-center gap-4 mb-2">
            <Button
              type="button"
              variant={role === "ipnu" ? "solid" : "bordered"}
              color="success"
              className="flex-1"
              onClick={() => setRole("ipnu")}
            >
              IPNU
            </Button>
            <Button
              type="button"
              variant={role === "ippnu" ? "solid" : "bordered"}
              color="success"
              className="flex-1"
              onClick={() => setRole("ippnu")}
            >
              IPPNU
            </Button>
          </div>

          <Input
            type="password"
            placeholder="Kata Sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" color="primary" className="w-full">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;


