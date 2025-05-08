import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useMemo, useRef, useState } from "react";
import { CATEGORIES, PREMIUM_TEMPLATES, TemplateCategory } from "@src/services/madfi/studio";
import useRegisteredTemplates from "@src/hooks/useRegisteredTemplates";
import Spinner from "@src/components/LoadingSpinner/LoadingSpinner";
import { Header2, Subtitle } from "@src/styles/text";
import ImportTemplatesModal from "@pagesComponents/Studio/ImportTemplatesModal";
import { brandFont } from "@src/fonts/fonts";
import clsx from "clsx";
import { useAccount, useBalance, useReadContract, useWalletClient } from "wagmi";
import { LENS_CHAIN_ID, lensTestnet, PROTOCOL_DEPLOYMENT } from "@src/services/madfi/utils";
import { erc20Abi, parseEther } from "viem";
import toast from "react-hot-toast";
import { publicClient } from "@src/services/madfi/moneyClubs";
import { switchChain } from "viem/actions";

const BONSAI_ABI = [
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

const StudioCreatePage: NextPage = () => {
  const router = useRouter();
  const { address, isConnected, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const importButtonRef = useRef<HTMLButtonElement>(null);
  const [showImportTemplateModal, setShowImportTemplateModal] = useState(false);
  const [importedTemplateURL, setImportedTemplateURL] = useState<string | undefined>();
  const { data: registeredTemplates, isLoading } = useRegisteredTemplates(importedTemplateURL);
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | undefined>();
  const [isMinting, setIsMinting] = useState(false);

  const { data: bonsaiBalance } = useReadContract({
    address: PROTOCOL_DEPLOYMENT.lens.Bonsai as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address!],
    chainId: lensTestnet.id,
    query: {
      enabled: isConnected && address,
      refetchInterval: 10000,
    },
  });

  const handleMintBonsai = async () => {
    if (!walletClient || !address) return;

    if (lensTestnet.id !== chain?.id && walletClient) {
      try {
        await switchChain(walletClient, { id: lensTestnet.id });
      } catch (error) {
        console.log(error);
        toast.error("Please switch networks to comment");
        return;
      }
    }

    try {
      setIsMinting(true);
      const toastId = toast.loading("Minting Bonsai tokens...");

      const hash = await walletClient.writeContract({
        address: PROTOCOL_DEPLOYMENT.lens.Bonsai as `0x${string}`,
        abi: BONSAI_ABI,
        functionName: "mint",
        args: [address, parseEther("1000")],
      });

      await publicClient("lens").waitForTransactionReceipt({ hash });
      toast.success("Successfully minted 1000 Bonsai tokens!", { id: toastId });
    } catch (error) {
      console.error("Error minting Bonsai:", error);
      toast.error("Failed to mint Bonsai tokens");
    } finally {
      setIsMinting(false);
    }
  };

  const templatesFiltered = useMemo(() => {
    if (!categoryFilter) {
      return registeredTemplates;
    }

    return registeredTemplates?.filter(({ category }) => category === categoryFilter);
  }, [categoryFilter, isLoading, registeredTemplates]);

  const categories = useMemo(() => {
    const formatCategoryLabel = (category: string) => {
      return (
        category
          // Split by underscores and camelCase
          .split(/[\s_]|(?=[A-Z])/)
          // Capitalize first letter of each word
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          // Join with spaces
          .join(" ")
      );
    };

    const importedCategories =
      registeredTemplates
        ?.map((template) => ({
          key: template.category,
          label: formatCategoryLabel(template.category),
        }))
        .filter((category) => !CATEGORIES.some((c) => c.key === category.key)) || [];

    return [{ key: undefined, label: "All" }, ...CATEGORIES, ...importedCategories];
  }, [CATEGORIES, registeredTemplates]);

  const selectTemplate = (template: string) => {
    router.push(`/studio/create?template=${template}`);
  };

  return (
    <div className="bg-background text-secondary min-h-[90vh]">
      <main className="mx-auto max-w-full md:max-w-[100rem] px-4 sm:px-6 pt-6">
        <section aria-labelledby="studio-heading" className="pt-0 pb-24 max-w-full">
          <div className="flex flex-col md:flex-row gap-y-10 md:gap-x-6 max-w-full">
            {/* Main Content */}
            <div className="flex-grow">
              {/* Header Card */}
              <div className="bg-card rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <Header2>Studio</Header2>
                  </div>
                  {isConnected && (
                    <button
                      onClick={handleMintBonsai}
                      disabled={isMinting || (!!bonsaiBalance && bonsaiBalance > parseEther("1000"))}
                      className="bg-brand-highlight text-black px-4 py-2 rounded-full hover:bg-brand-highlight/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isMinting ? (
                        <div className="flex items-center gap-2">
                          <Spinner customClasses="h-4 w-4" color="#ffffff" />
                          <span>Minting...</span>
                        </div>
                      ) : (
                        "Bonsai Faucet"
                      )}
                    </button>
                  )}
                </div>
                <Subtitle className="mt-2">
                  Choose from our curated selection of templates organized by category, or import a third-party template
                  directly from your ElizaOS server.
                </Subtitle>
              </div>

              {/* Categories Card */}
              <div className="bg-card rounded-lg p-6 mt-6">
                <h3 className="text-sm font-medium text-brand-highlight mb-4">Categories</h3>
                <div className="relative">
                  <div className="bg-card-light rounded-full p-1 flex overflow-x-auto scrollbar-hide relative pr-24">
                    {categories.map((c) => (
                      <button
                        key={c.label}
                        className={`${
                          c.key === categoryFilter
                            ? `bg-brand-highlight text-white`
                            : "text-secondary/60 hover:bg-card transition-colors"
                        } px-6 py-2 rounded-full flex-shrink-0 whitespace-nowrap mr-2 ${brandFont.className}`}
                        onClick={() => setCategoryFilter(c.key)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  <div
                    className={clsx(
                      "absolute right-0 top-0 bottom-0 flex items-center bg-gradient-to-l from-card via-card to-transparent pl-10 pr-2 rounded-r-full",
                      `${brandFont.className}`,
                    )}
                  >
                    <button
                      ref={importButtonRef}
                      className="text-secondary/60 hover:bg-card-light transition-colors px-6 py-2 rounded-full flex-shrink-0"
                      onClick={() => setShowImportTemplateModal(true)}
                    >
                      + Import
                    </button>
                  </div>
                </div>
              </div>

              {/* Templates Card */}
              <div className="bg-card rounded-lg p-6 mt-6">
                <h3 className="text-sm font-medium text-brand-highlight mb-4">Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {isLoading && (
                    <div className="flex justify-center">
                      <Spinner customClasses="h-6 w-6" color="#5be39d" />
                    </div>
                  )}
                  {!isLoading &&
                    templatesFiltered?.map((template, idx) => {
                      return (
                        <div
                          key={`template-${idx}`}
                          className={`bg-card-light rounded-lg p-4 flex flex-col border border-dark-grey hover:border-brand-highlight transition-colors h-full`}
                          onClick={() => {
                            selectTemplate(template.name);
                          }}
                        >
                          <div className="rounded-lg overflow-hidden mb-4 border border-dark-grey">
                            <Image
                              src={template.image || "/placeholder.svg?height=200&width=300"}
                              alt={template.displayName}
                              width={300}
                              height={200}
                              className="w-full h-auto aspect-[1.5/1] object-cover"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <h3 className="font-semibold text-lg text-brand-highlight">{template.displayName}</h3>
                            <p className="text-sm text-secondary/60">{template.description}</p>
                            <div className="flex-1" />
                            <div className="flex justify-end mt-4">
                              <button
                                className={`text-base text-black px-4 py-1 rounded-full text-sm bg-brand-highlight hover:bg-brand-highlight/90 transition-colors`}
                              >
                                Create
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Import template modal */}
              {showImportTemplateModal && (
                <ImportTemplatesModal
                  onSubmit={(url: string) => {
                    setImportedTemplateURL(url);
                    localStorage.setItem("importedTemplateURL", url);
                  }}
                  anchorEl={importButtonRef.current}
                  onClose={() => setShowImportTemplateModal(false)}
                />
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudioCreatePage;
