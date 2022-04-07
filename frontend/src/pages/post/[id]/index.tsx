import { FC } from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";

import { usePostQuery } from "../../../generated/graphql";

import { Heading, Text, Link, Box } from "@chakra-ui/react";

import Layout from "../../../components/Layout";
import Error from "../../../components/Error";
import EditDeletePostButtons from "../../../components/EditDeletePostButtons";
import withApollo from "../../../utils/withApollo";

interface PostProps {}
const Post: FC<PostProps> = () => {
  const router = useRouter();
  const postId = typeof router.query.id === "string" ? router.query.id : "";
  const { data, loading, error } = usePostQuery({
    skip: postId === "",
    variables: { id: postId },
  });

  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Error error={error.message} />
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Heading>No such post exists!</Heading>
        <Text>
          Go back{" "}
          <NextLink href="/">
            <Link>home</Link>
          </NextLink>
        </Text>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        <Heading mb={4}>{data.post.title}</Heading>
        <Text>{data.post.text}</Text>
      </Box>
      <Box mt={15}>
        <EditDeletePostButtons
          creatorId={data.post.creatorId.toString()}
          postId={data.post.id.toString()}
        />
      </Box>
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
