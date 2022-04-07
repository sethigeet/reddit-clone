import { FC } from "react";
import NextLink from "next/link";

import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Spacer,
  Spinner,
  Text,
} from "@chakra-ui/react";

import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useApolloClient } from "@apollo/client";

const Navbar: FC = () => {
  const { data, loading } = useMeQuery({ skip: isServer() });
  const [logout, { loading: logoutLoading }] = useLogoutMutation();
  const apolloClient = useApolloClient();

  return (
    <Box pos="sticky" top={0} zIndex={1} bg="tan" p={4}>
      {loading ? (
        <Spinner />
      ) : (
        <Flex justify="center">
          <Flex maxW={800} flex={1} align="center">
            <NextLink href="/">
              <Link>
                <Heading as="h1" size="md">
                  My Website
                </Heading>
              </Link>
            </NextLink>
            <Spacer />
            <Box>
              {data?.me ? (
                <Flex align="center">
                  <Box mr={10}>
                    <NextLink href="/create-post">
                      <Button as={Link} ml="auto">
                        Create Post
                      </Button>
                    </NextLink>
                  </Box>
                  <Button
                    variant="link"
                    isLoading={logoutLoading}
                    onClick={async () => {
                      await logout();
                      await apolloClient.resetStore();
                    }}
                  >
                    <Link mr={4}>Logout</Link>
                  </Button>
                  <Text>{data.me.username}</Text>
                </Flex>
              ) : (
                <>
                  <NextLink href="/login">
                    <Link mr={4}>Login</Link>
                  </NextLink>
                  <NextLink href="/register">
                    <Link mr={4}>Register</Link>
                  </NextLink>
                </>
              )}
            </Box>
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

export default Navbar;
