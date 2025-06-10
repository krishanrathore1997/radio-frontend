// hooks/useAuth.ts
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);
}
