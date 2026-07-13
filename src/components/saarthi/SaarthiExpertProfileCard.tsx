import { LogOut } from "lucide-react";
import logo from "@/assets/logo.svg";
import type { SaarthiIdentity } from "@/types/saarthi";

interface SaarthiExpertProfileCardProps {
  identity: SaarthiIdentity;
  phoneNumber?: string | null;
  onLogout: () => void;
}

function formatPhoneNumber(phoneNumber?: string | null): string | null {
  if (!phoneNumber) return null;

  const digits = String(phoneNumber).replace(/\D/g, "");
  const localNumber = digits.length > 10 ? digits.slice(-10) : digits;

  return localNumber ? `+91 ${localNumber}` : null;
}

export function SaarthiExpertProfileCard({
  identity,
  phoneNumber,
  onLogout,
}: SaarthiExpertProfileCardProps) {
  const formattedPhone = formatPhoneNumber(phoneNumber);

  return (
    <section className="rounded-[28px] border border-[#FDD9CE] bg-white px-5 py-5 shadow-[0_4px_14px_rgba(62,35,25,0.10)]">
      <div className="flex items-center gap-4">
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[22px] bg-[#FEEEE9]">
          <img
            src={logo}
            alt="AstroLokal"
            className="h-14 w-14 object-contain"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[22px] font-bold leading-tight text-[#111827]">
            {identity.expertName}
          </h2>

          {formattedPhone ? (
            <p className="mt-1 text-[16px] text-[#68758A]">
              {formattedPhone}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <span className="rounded-full bg-[#FEEEE9] px-3 py-1.5 text-[13px] font-semibold text-[#F45722]">
            Expert ID: {identity.expertId}
          </span>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-2 py-1 text-[15px] font-semibold text-[#F45722] transition-colors hover:bg-[#FEEEE9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F45722]"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </section>
  );
}
