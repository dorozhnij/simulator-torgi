import type { Metadata } from "next";
import { ZemlyTechHeader } from "@/components/ZemlyTechHeader";
import { ZemlyTechBottomLinks } from "@/components/ZemlyTechBottomLinks";

export const metadata: Metadata = {
  title: "Симулятор торгов — земли.тех",
  description:
    "Игра для начинающих и опытных участников торгов по земельным участкам. Проверьте, насколько точно вы сможете оценить итоговую стоимость участка на аукционе."
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#26CD94"
};

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-svh bg-[#F6FFFC] text-[#0B1B14]"
      style={
        {
          ["--color-accent" as string]: "#26CD94",
          ["--color-accent-hover" as string]: "#1FB784",
          ["--color-accent-active" as string]: "#17966D"
        } as React.CSSProperties
      }
    >
      <ZemlyTechHeader />
      {children}
      <ZemlyTechBottomLinks />
    </div>
  );
}

