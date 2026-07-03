import { BotchiMascot, type BotchiMode } from "./botchi-mascot";

const SHELLS: Record<string, { body: string; edge: string; ink: string }> = {
  arena:   { body: "#efe9dc", edge: "#ddd4bf", ink: "#5f6368" },
  menta:   { body: "#d6ebdd", edge: "#bcdcc6", ink: "#3c6b50" },
  lavanda: { body: "#e2dcf0", edge: "#cabfe3", ink: "#5b4b86" },
  grafito: { body: "#41424a", edge: "#2c2d33", ink: "#d7d8dc" },
};

export function BotchiDevice({
  color = "arena",
  size = 280,
  showText = true,
  floating = true,
  mode = "idle",
}: {
  color?: keyof typeof SHELLS;
  size?: number;
  showText?: boolean;
  floating?: boolean;
  mode?: BotchiMode;
}) {
  const shell = SHELLS[color] ?? SHELLS.arena;

  return (
    <div
      className={`relative select-none ${
        floating ? "botchi-device-floating" : ""
      }`}
      style={{ width: size, height: size * 1.18 }}
      aria-hidden
    >
      <style>{`
        @keyframes bd-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes bd-halo {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 0.85; transform: scale(1.04); }
        }
        .botchi-device-floating {
          animation: bd-float 5.5s ease-in-out infinite;
          will-change: transform;
        }
        .bd-halo {
          animation: bd-halo 3.4s ease-in-out infinite;
          transform-origin: center;
        }
        @media (prefers-reduced-motion: reduce) {
          .botchi-device-floating, .bd-halo { animation: none !important; }
        }
      `}</style>

      <div
        className="absolute inset-x-[7%] top-[3%] bottom-[1%]"
        style={{
          background: `linear-gradient(160deg, ${shell.body}, ${shell.edge})`,
          borderRadius: "47% 47% 46% 46% / 54% 54% 46% 46%",
          boxShadow:
            "0 24px 60px -20px rgba(32,33,36,.35), inset 0 2px 6px rgba(255,255,255,.5)",
        }}
      >
        {/* tornillos / detalle superior */}
        <div className="absolute left-1/2 top-[8%] flex -translate-x-1/2 gap-[3px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="h-[3px] w-[3px] rounded-full"
              style={{ background: "rgba(0,0,0,.18)" }}
            />
          ))}
        </div>

        {/* pantalla circular */}
        <div
          className="absolute left-1/2 top-[27%] aspect-square w-[63%] -translate-x-1/2"
        >
          {/* halo sutil "encendido" */}
          <div
            className="bd-halo absolute inset-[-6%] rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(94,234,212,.35), rgba(94,234,212,0) 70%)",
              filter: "blur(2px)",
            }}
          />
          <div
            className="relative h-full w-full rounded-full p-[5px]"
            style={{ background: "#15161c" }}
          >
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-full bg-[#0c0d12] ring-1 ring-inset ring-white/10">
              <BotchiMascot size={size * 0.21} mode={mode} />
              {showText && (
                <p className="text-center text-[8px] font-medium leading-tight text-sky-300">
                  I&apos;m Botchi
                </p>
              )}
            </div>
          </div>
        </div>

        {/* botones */}
        <div className="absolute bottom-[12%] left-1/2 flex -translate-x-1/2 items-center gap-3">
          <span
            className="h-6 w-6 rounded-full"
            style={{ background: "rgba(0,0,0,.12)" }}
          />
          <span
            className="h-8 w-8 rounded-full"
            style={{ background: "rgba(66,133,244,.5)" }}
          />
          <span
            className="h-6 w-6 rounded-full"
            style={{ background: "rgba(0,0,0,.12)" }}
          />
        </div>

        <p
          className="absolute bottom-[3.5%] left-1/2 -translate-x-1/2 text-[13px] font-bold tracking-tight"
          style={{ color: shell.ink }}
        >
          botchi
        </p>
      </div>
    </div>
  );
}
