import { assertProductionEnvironment } from "@/lib/production-env";

export function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;
  assertProductionEnvironment();
}
