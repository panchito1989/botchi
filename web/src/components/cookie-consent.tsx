"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";

const KEY = "botchi-cookie-consent";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(KEY)) {
      setShow(true);
    }
  }, []);

  function decide(value: "accepted" | "essential") {
    localStorage.setItem(KEY, value);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-line bg-white p-5 shadow-xl">
      <p className="text-sm text-muted">
        Usamos solo cookies <strong className="text-ink">esenciales</strong>{" "}
        para mantener tu sesión segura. Sin publicidad ni rastreo de terceros.{" "}
        <Link href="/cookies" className="text-brand hover:underline">
          Política de Cookies
        </Link>
        .
      </p>
      <div className="mt-4 flex gap-2">
        <Button size="sm" onClick={() => decide("accepted")}>
          Aceptar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => decide("essential")}
        >
          Solo esenciales
        </Button>
      </div>
    </div>
  );
}
