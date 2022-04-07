import { FC } from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";

import { MeDocument, MeQuery, useLoginMutation } from "../generated/graphql";
import withApollo from "../utils/withApollo";

import { Formik, Form } from "formik";
import { Button, Box, Link, Flex } from "@chakra-ui/react";

import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { toErrorMap } from "../utils/toErrorMap";

const Login: FC = () => {
  const router = useRouter();
  const [login] = useLoginMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors, setSubmitting }) => {
          const response = await login({
            variables: values,
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: "Query",
                  me: data?.login.user,
                },
              });
              cache.evict({ fieldName: "posts:{}" });
            },
          });
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            if (typeof router.query.next === "string") {
              router.push(router.query.next);
            } else {
              router.push("/");
            }
          }
          setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              label="Username or Email"
              placeholder="Username or Email"
            />
            <Box mt={4}>
              <InputField
                name="password"
                label="Password"
                placeholder="Password"
                type="password"
              />
            </Box>
            <Flex alignItems="center" justifyContent="space-between" mt={4}>
              <Button colorScheme="teal" isLoading={isSubmitting} type="submit">
                Submit
              </Button>
              <NextLink href="/register">
                <Link color="teal">Don't have an account?</Link>
              </NextLink>
            </Flex>
          </Form>
        )}
      </Formik>
      <NextLink href="/forgot-password">
        <Link color="teal">Forgot Password?</Link>
      </NextLink>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(Login);
