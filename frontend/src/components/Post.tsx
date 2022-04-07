import { FC, useState } from "react";
import NextLink from "next/link";

import { Flex, IconButton, Box, Heading, Text, Link } from "@chakra-ui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";

import {
  PostSnippetFragment,
  useVoteMutation,
  VoteMutation,
} from "../generated/graphql";

import EditDeletePostButtons from "./EditDeletePostButtons";
import { ApolloCache, gql } from "@apollo/client";

const updateAfterVote = (
  value: number,
  postId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: "Post:" + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  });
  if (data) {
    if (data.voteStatus === value) {
      return;
    }
    const newPoints =
      (data.points as number) + (data.voteStatus ? 2 : 1) * value;
    cache.writeFragment({
      id: "Post:" + postId,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,
      data: { points: newPoints, voteStatus: value },
    });
  }
};

interface PostProps {
  post: PostSnippetFragment;
}

const Post: FC<PostProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >();
  const [vote] = useVoteMutation();

  return (
    <Flex p={5} shadow="md" borderWidth="1px" pos="relative">
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        mr={4}
      >
        <IconButton
          icon={<ChevronUpIcon />}
          aria-label="Up vote post"
          onClick={async () => {
            setLoadingState("updoot-loading");
            await vote({
              variables: {
                postId: post.id,
                value: 1,
              },
              update: (cache) => updateAfterVote(1, post.id, cache),
            });
            setLoadingState("not-loading");
          }}
          colorScheme={post.voteStatus === 1 ? "green" : undefined}
          isLoading={loadingState === "updoot-loading"}
          disabled={post.voteStatus === 1}
        />
        {post.points}
        <IconButton
          icon={<ChevronDownIcon />}
          aria-label="Down vote post"
          onClick={async () => {
            setLoadingState("downdoot-loading");
            await vote({
              variables: {
                postId: post.id,
                value: -1,
              },
              update: (cache) => updateAfterVote(-1, post.id, cache),
            });
            setLoadingState("not-loading");
          }}
          colorScheme={post.voteStatus === -1 ? "red" : undefined}
          isLoading={loadingState === "downdoot-loading"}
          disabled={post.voteStatus === -1}
        />
      </Flex>
      <Box>
        <NextLink href={{ pathname: "/post/[id]", query: { id: post.id } }}>
          <Link>
            <Heading fontSize="xl">{post.title}</Heading>
          </Link>
        </NextLink>
        <Text ml={5}> - posted by {post.creator.username}</Text>
        <Text mt={4}>{post.textSnippet}</Text>
      </Box>
      <Box pos="absolute" top={0} right={0} m={5}>
        <EditDeletePostButtons
          creatorId={post.creatorId.toString()}
          postId={post.id.toString()}
        />
      </Box>
    </Flex>
  );
};

export default Post;
