import { useQuery } from "@tanstack/react-query";
import { Cursor, evmAddress, PageSize, postId, PostReferenceType, PostType, SessionClient } from "@lens-protocol/client";
import { fetchPost, fetchPostReferences, fetchPosts, fetchTimeline, fetchWhoExecutedActionOnPost, repost } from "@lens-protocol/client/actions";
import promiseLimit from "promise-limit";
import { lensClient } from "./client";
import { resumeSession } from "@src/hooks/useLensLogin";
import { groupBy, sampleSize, uniqBy } from "lodash";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LENS_BONSAI_APP, LENS_BONSAI_DEFAULT_FEED } from "../madfi/utils";
import { getPostPresenceData } from "../madfi/terminal";

export const getPost = async (_postId: string, sessionClient?: SessionClient) => {
  try {
    const result = await fetchPost(sessionClient || lensClient, {
      post: postId(_postId),
    });

    if (result.isErr()) {
      return console.error(result.error);
    }

    const post = result.value;
    return post;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getPosts = async (publicationIds: string[], sessionClient?: SessionClient) => {
  try {
    const result = await fetchPosts(sessionClient || lensClient, {
      filter: { posts: publicationIds }
    });

    return result.isOk() ? result.value.items : [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getQuotes = async (_postId: string, sessionClient?: SessionClient) => {
  try {
    const result = await fetchPostReferences(sessionClient || lensClient, {
      referencedPost: postId(_postId),
      referenceTypes: [PostReferenceType.QuoteOf],
    });

    return result.isOk() ? result.value.items : [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const useGetPost = (publicationId?: string) => {
  return useQuery({
    queryKey: ["get-post", publicationId],
    queryFn: () => getPost(publicationId!),
    enabled: !!publicationId,
  });
};

export const getPostsByAuthor = async (authorId: string, cursor?: Cursor | null) => {
  let sessionClient;
  try {
    sessionClient = await resumeSession();
  } catch { }
  return await fetchPosts(sessionClient || lensClient, {
    filter: {
      authors: [evmAddress(authorId)],
      postTypes: [PostType.Root],
      feeds: [{ feed: evmAddress(LENS_BONSAI_DEFAULT_FEED) }]
    },
    pageSize: PageSize.Ten,
    cursor
  });
};


export const getAllPosts = async (cursor?: Cursor | null) => {
  let sessionClient;
  try {
    sessionClient = await resumeSession();
  } catch { }
  return await fetchPosts(sessionClient || lensClient, {
    filter: {
      postTypes: [PostType.Root],
      feeds: [{ feed: evmAddress(LENS_BONSAI_DEFAULT_FEED) }]
    },
    pageSize: PageSize.Ten,
    cursor
  });
};


export const getPostsCollectedBy = async (authorId: string, cursor?: Cursor | null) => {
  let sessionClient;
  try {
    sessionClient = await resumeSession();
  } catch { }
  return await fetchPosts(sessionClient || lensClient, {
    filter: {
      postTypes: [PostType.Root],
      feeds: [{ feed: evmAddress(LENS_BONSAI_DEFAULT_FEED) }],
      collectedBy: { account: evmAddress(authorId) }
    },
    pageSize: PageSize.Ten,
    cursor
  });
}

export const getPostData = async (postIds: string[]): Promise<Object> => {
  const FETCH_ACTORS_BATCH_SIZE = 10;
  let sessionClient;
  try {
    sessionClient = await resumeSession();
  } catch { }

  // Fetch both actors and presence data in parallel
  const [actorsResults, presenceData] = await Promise.all([
    Promise.all(postIds.map((_postId) =>
      promiseLimit(FETCH_ACTORS_BATCH_SIZE)(async () => {
        const result = await fetchWhoExecutedActionOnPost(sessionClient || lensClient, { post: postId(_postId) });
        if (result.isErr()) return;

        let actors = result.value.items;
        if (sessionClient) {
          actors = actors.filter((a) => a.account.operations?.isFollowedByMe);
        }
        return { postId: _postId, actors: sampleSize(actors, 3) };
      })
    )),
    getPostPresenceData(postIds)
  ]);

  const groupedActors = groupBy(actorsResults.filter((r) => r), 'postId');

  return Object.fromEntries(
    Object.entries(groupedActors).map(([postId, value]) => [
      postId,
      {
        // @ts-ignore
        ...value[0],
        presence: presenceData[postId] || { count: 0, topUsers: [] }
      }
    ])
  );
};

/**
 * Rpost
 * @param publicationId - The ID or slug of the publication to like
 */
export const sendRepost = async (_postId: string): Promise<boolean> => {
  const sessionClient = await resumeSession();
  if (!sessionClient) return false;

  const result = await repost(sessionClient, {
    post: postId(_postId),
  });

  return result.isOk();
};