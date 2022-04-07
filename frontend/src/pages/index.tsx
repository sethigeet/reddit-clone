import { usePostsQuery } from "../generated/graphql";

import { Button, Flex, Stack } from "@chakra-ui/react";

import Layout from "../components/Layout";
import Post from "../components/Post";
import Error from "../components/Error";
import withApollo from "../utils/withApollo";

const Index = () => {
  const { data, loading, error, fetchMore, variables } = usePostsQuery({
    variables: { limit: 10, cursor: null },
    notifyOnNetworkStatusChange: true,
  });

  return (
    <Layout>
      {!data && loading ? (
        <div>Loading...</div>
      ) : error ? (
        <Error error={error.message} />
      ) : (
        <Stack spacing={8}>
          {data?.posts.posts.map((p) =>
            !p ? null : <Post key={p.id} post={p} />
          )}
        </Stack>
      )}
      {!error && (
        <Flex justifyContent="center" my={10}>
          <Button
            isLoading={loading}
            disabled={!data?.posts.hasMore}
            onClick={() =>
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor:
                    data?.posts.posts[data.posts.posts.length - 1].createdAt,
                },
              })
            }
          >
            Load More
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
