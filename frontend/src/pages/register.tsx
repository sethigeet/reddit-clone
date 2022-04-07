import { FC } from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";

import { MeDocument, MeQuery, useRegisterMutation } from "../generated/graphql";
import withApollo from "../utils/withApollo";

import { Formik, Form } from "formik";
import { Button, Box, Flex, Link } from "@chakra-ui/react";

import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { toErrorMap } from "../utils/toErrorMap";

const Register: FC = () => {
  const router = useRouter();
  const [register] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "", username: "", password: "" }}
        onSubmit={async (values, { setErrors, setSubmitting }) => {
          const response = await register({
            variables: { credentials: values },
            update: (cache, { data }) =>
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: "Query",
                  me: data?.register.user,
                },
              }),
          });
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            router.push("/");
          }
          setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="email"
              label="Email"
              placeholder="Email"
              type="email"
            />
            <Box mt={4}>
              <InputField
                name="username"
                label="Username"
                placeholder="Username"
              />
            </Box>
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
              <NextLink href="/login">
                <Link color="teal">Already have an account?</Link>
              </NextLink>
            </Flex>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(Register);
