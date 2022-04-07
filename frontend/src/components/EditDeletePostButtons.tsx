import { FC } from "react";
import NextLink from "next/link";

import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";

interface EditDeletePostButtonsProps {
  postId: string;
  creatorId: string;
}
const EditDeletePostButtons: FC<EditDeletePostButtonsProps> = ({
  postId,
  creatorId,
}) => {
  const [deletePost] = useDeletePostMutation();
  const { data: meData } = useMeQuery();

  if (meData?.me?.id !== creatorId) {
    return null;
  }

  return (
    <Box>
      <NextLink
        href={{
          pathname: "/post/[id]/edit",
          query: { id: postId },
        }}
      >
        <IconButton icon={<EditIcon />} aria-label="Edit Post" mr={4} />
      </NextLink>
      <IconButton
        icon={<DeleteIcon />}
        aria-label="Delete Post"
        colorScheme="red"
        onClick={() => {
          if (confirm("Are you sure you want to delete this post?")) {
            deletePost({
              variables: { id: postId },
              update: (cache) => {
                cache.evict({ id: "Post:" + postId });
              },
            });
          }
        }}
      />
    </Box>
  );
};

export default EditDeletePostButtons;
