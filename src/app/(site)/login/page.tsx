// src/app/(site)/login/page.tsx
"use client";

import { Alert } from "@heroui/alert";
import { Button, Input, Listbox } from "@heroui/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Cookies from 'js-cookie';

function LoginPage() {
  const [org, setOrg] = useState<"ipnu" | "ippnu">("ipnu");
  const [role, setRole] = useState<"admin" | "ketua" | "sekretaris">("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    const username = `${org}_${role}`;

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.ok) {
      // Clear all cookies
      Cookies.remove('next-auth.session-token');
      Cookies.remove('next-auth.csrf-token');
      Cookies.remove('next-auth.callback-url');

      router.push(org === "ipnu" ? "/admin_ipnu/dashboard" : "/admin_ippnu");
    } else {
      setError(true);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl shadow-2xl">
      <div className="w-full max-w-md rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Silakan Masuk Rekan
        </h1>

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
              variant={org === "ipnu" ? "solid" : "bordered"}
              color="success"
              className="flex-1"
              onPress={() => setOrg("ipnu")}
            >
              IPNU
            </Button>
            <Button
              type="button"
              variant={org === "ippnu" ? "solid" : "bordered"}
              color="success"
              className="flex-1"
              onPress={() => setOrg("ippnu")}
            >
              IPPNU
            </Button>
          </div>

          {/* Dropdown for Role Selection */}
          <div className="mb-4">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Pilih Role
            </label>
            <select
              id="role"
              name="role"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "admin" | "ketua" | "sekretaris")
              }
            >
              <option value="admin">Admin</option>
              <option value="ketua">Ketua</option>
              <option value="sekretaris">Sekretaris</option>
            </select>
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
