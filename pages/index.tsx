import { NextPage } from "next";
import { useWalletClient } from "wagmi";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPostsByAuthor, getAllPosts } from "@src/services/lens/posts";
import useLensSignIn from "@src/hooks/useLensSignIn";
import { getProfileImage } from "@src/services/lens/utils";
import Link from "next/link";
import { Cursor } from "@lens-protocol/client";

const IndexPage: NextPage = () => {
  const { data: walletClient } = useWalletClient();
  const { isAuthenticated } = useLensSignIn(walletClient);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery<any, Error, { pages: { items: any[], pageInfo: { next: Cursor | null } }[], pageParams: any[] }>({
    queryKey: ["feed-posts"],
    // @ts-ignore
    queryFn: async ({ pageParam }) => {
      const result = await getAllPosts(pageParam as Cursor | null);
      console.log("result from getAllPosts for feed", result);
      return result.isOk() ? result.value : { items: [], pageInfo: { next: null } };
    },
    getNextPageParam: (lastPage) => lastPage?.pageInfo?.next,
    enabled: true,
    initialPageParam: null as Cursor | null,
  });

  if (status === "pending" && (!data || !data.pages || data.pages.length === 0)) {
    return (
      <div className="min-h-screen bg-background text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Loading Feed...</h1>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-400">Failed to load feed. Please try again later.</p>
      </div>
    );
  }

  const noPostsFound = !data || data.pages.every(page => !page || page.items.length === 0);

  if (noPostsFound) {
    return (
      <div className="min-h-screen bg-background text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Feed</h1>
        <p className="text-gray-400">No publications found in the feed right now. Try again later or create a post!</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background text-white p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-8">Feed</h1>

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

export default IndexPage;
