import { NextPage } from "next";
import { useRouter } from "next/router";
import { useWalletClient } from "wagmi";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPostsByAuthor } from "@src/services/lens/posts";
import useLensSignIn from "@src/hooks/useLensSignIn";
import { getProfileImage } from "@src/services/lens/utils";
import Link from "next/link";
import { Cursor } from "@lens-protocol/client";
import { useEffect } from "react";

const MyPostsPage: NextPage = () => {
  const router = useRouter();
  const { data: walletClient } = useWalletClient();
  const { isAuthenticated, authenticatedProfileId } = useLensSignIn(walletClient);

  useEffect(() => {
    // If not authenticated and authenticatedProfileId is not available (after hooks have run)
    // Redirect to home or show a login prompt.
    // Add a slight delay or check loading state of useLensSignIn if it has one,
    // to prevent redirecting before authentication status is confirmed.
    if (!authenticatedProfileId && !isAuthenticated) { // A more robust check might be needed depending on useLensSignIn behavior
      // router.push("/\"); // Option 1: Redirect to feed
      // Or show a message directly on this page
    }
  }, [isAuthenticated, authenticatedProfileId, router]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery<any, Error, { pages: { items: any[], pageInfo: { next: Cursor | null } }[], pageParams: any[] }>({
    queryKey: ["my-posts", authenticatedProfileId],
    // @ts-ignore
    queryFn: async ({ pageParam }) => {
      if (!authenticatedProfileId) {
        return { items: [], pageInfo: { next: null } }; // Should not fetch if no profile ID
      }
      const result = await getPostsByAuthor(authenticatedProfileId, pageParam as Cursor | null);
      return result.isOk() ? result.value : { items: [], pageInfo: { next: null } };
    },
    getNextPageParam: (lastPage) => lastPage?.pageInfo?.next,
    enabled: !!authenticatedProfileId, // Only run query if user is authenticated and profile ID is available
    initialPageParam: null as Cursor | null,
  });

  if (!isAuthenticated || !authenticatedProfileId) {
    return (
      <div className="min-h-screen bg-background text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-400">Please log in to view your publications.</p>
        {/* Optionally, add a Link to the login page or a connect button */}
      </div>
    );
  }

  if (status === "pending" && (!data || !data.pages || data.pages.length === 0)) {
    return (
      <div className="min-h-screen bg-background text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Loading Your Publications...</h1>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-400">Failed to load your publications. Please try again later.</p>
      </div>
    );
  }

  const noPostsFound = !data || data.pages.every(page => !page || page.items.length === 0);

  if (noPostsFound) {
    return (
      <div className="min-h-screen bg-background text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Your Publications</h1>
        <p className="text-gray-400">You haven't created any publications yet.</p>
        {/* Optionally, Link to creation page */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-8">Your Publications</h1>

      <div className="space-y-6">
        {data?.pages.map((page, i) => (
          <div key={i} className="space-y-6">
            {/* @ts-ignore */}
            {page?.items.map((post: any) => (
              <Link href={`/post/${post.slug}`} key={post.id}>
                <div className="bg-card rounded-2xl p-4 hover:bg-card/20 transition-colors cursor-pointer max-w-xl mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={getProfileImage(post.author)}
                      alt={post.author.metadata?.name || ""}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h2 className="font-semibold">{post.author.metadata?.name || post.author.username?.localName}</h2>
                      <p className="text-sm text-gray-400">{new Date(post.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-gray-200 line-clamp-3">{post.metadata.content}</p>

                  {/* Video Content */}
                  {post.metadata.video && (
                    <div className="mt-4 relative aspect-video rounded-xl overflow-hidden">
                      <video
                        src={post.metadata.video.item}
                        poster={post.metadata.video.cover}
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                      />
                    </div>
                  )}

                  {/* Image Content */}
                  {post.metadata.image?.item && !post.metadata.video && (
                    <img
                      src={post.metadata.image.item}
                      alt="Post media"
                      className="mt-4 rounded-xl max-h-96 w-full object-cover"
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-2 bg-accent rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyPostsPage; 