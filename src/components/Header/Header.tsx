import Link from "next/link";
import { useRouter } from "next/router";
import { useWalletClient } from "wagmi";
import { useState } from "react";
import { cx } from "@src/utils/classnames";
import { routesApp } from "@src/constants/routesApp";
import { ConnectButton } from "@components/ConnectButton";
import { Modal } from "@src/components/Modal";
import LoginWithLensModal from "@src/components/Lens/LoginWithLensModal";
import useLensSignIn from "@src/hooks/useLensSignIn";
import useIsMounted from "@src/hooks/useIsMounted";
import { Button } from "../Button";
import { Balance } from "./Balance";

export const Header = () => {
  const { route } = useRouter();
  const { data: walletClient } = useWalletClient();
  const { openSignInModal, setOpenSignInModal, isAuthenticated, authenticatedProfile } = useLensSignIn(walletClient);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const isMounted = useIsMounted();

  const baseHeaderLinks = [
    {
      label: "Feed",
      href: "/",
    },
    {
      label: "Agent creation",
      href: "/studio",
    },
  ];

  const authenticatedHeaderLinks = isAuthenticated
    ? [
        {
          label: "Your Posts",
          href: "/my-posts",
        },
      ]
    : [];

  const headerLinks = [...baseHeaderLinks.slice(0,1), ...authenticatedHeaderLinks, ...baseHeaderLinks.slice(1)];

  if (!isMounted) return null;

  return (
    <header className="sticky top-0 z-[100] bg-black border-b border-dark-grey shadow-sm max-w-[100vw] overflow-hidden">
      <nav className="mx-auto max-w-[100rem]" aria-label="Top">
        {/* Top row */}
        <div className="flex w-full items-center py-3 lg:border-none px-4 md:px-6 justify-between">
          <div className="flex items-center justify-start w-[40%]">
            <div className="w-max text-black">
              <a className="bonsaiLogo" href={routesApp.home}></a>
            </div>
            <div className="ml-10 hidden lg:flex items-center space-x-4">
              {headerLinks.map((link) => (
                <div key={link.href} className="h-[40px] py-[12px] px-4 justify-center items-center rounded-lg">
                  <Link
                    href={link.href}
                    passHref
                    className={cx(
                      "h-full leading-4 font-medium text-[16px] transition-opacity duration-200",
                      route === link.href ? "text-white" : "text-white/50 hover:text-white/80",
                    )}
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Right side of header */}
          <div className="flex items-center justify-end md:w-[40%] w-full">
            {/* On desktop show actions inline, on mobile they will be in the hamburger menu */}
            {/* Reordered for desktop: Create, Claim Fees, then ConnectButton */}
            <div className="hidden sm:flex items-center gap-2 mr-2">
              {isAuthenticated && (
                <Link href="/studio">
                  <Button variant="accentBrand" size="md" className="text-base font-bold md:px-6 rounded-lg">
                    Create
                  </Button>
                </Link>
              )}
              <Balance />
            </div>

            {/* Keep ConnectButton always visible, now outside the desktop-specific div */}
            <ConnectButton
              setOpenSignInModal={setOpenSignInModal}
              autoLensLogin={!isAuthenticated}
              className="sm:hidden" // Hide on desktop since it's included in the line above for desktop view
            />

            {/* Hamburger (visible on small screens only) */}
            <button
              className="sm:hidden ml-2 text-white focus:outline-none"
              onClick={() => setOpenMobileMenu(!openMobileMenu)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {openMobileMenu && (
        <div className="sm:hidden bg-black border-t border-dark-grey px-4 py-3">
          <div className="flex flex-col space-y-2 w-full">
            <Balance openMobileMenu />
            {isAuthenticated && (
              <Link href="/studio" className="w-full">
                <Button
                  variant="accentBrand"
                  size="md"
                  className="text-base font-bold md:px-6 bg-white rounded-lg w-full"
                >
                  Create
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Login Modal */}
      <Modal
        onClose={() => setOpenSignInModal(false)}
        open={openSignInModal}
        setOpen={setOpenSignInModal}
        panelClassnames="bg-card w-screen h-screen md:h-full md:w-[60vw] p-4 text-secondary"
      >
        <LoginWithLensModal closeModal={() => setOpenSignInModal(false)} />
      </Modal>
    </header>
  );
};
