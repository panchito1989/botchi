"use client";

import { useTransition } from "react";
import { seedSampleData } from "./actions";
import { Button } from "@/components/ui";

export function SeedButton({ deviceId }: { deviceId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => start(() => seedSampleData(deviceId))}
      disabled={pending}
    >
      {pending ? "Generando…" : "Cargar datos de ejemplo"}
    </Button>
  );
}
