import { FC, useState } from "react";
import NextLink from "next/link";

import { Form, Formik } from "formik";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  CloseButton,
  Flex,
  Link,
} from "@chakra-ui/react";

import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";

import { useForgotPasswordMutation } from "../generated/graphql";
import withApollo from "../utils/withApollo";

const ForgotPassword: FC = () => {
  const [complete, setComplete] = useState(false);
  const [forgotPassword] = useForgotPasswordMutation();

  return (
    <Wrapper>
      <Wrapper variant="small">
        <Formik
          initialValues={{ email: "" }}
          onSubmit={async (values, { setSubmitting }) => {
            await forgotPassword({ variables: values });
            setSubmitting(false);
            setComplete(true);
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
              <Flex alignItems="center" justifyContent="space-between" mt={4}>
                <Button
                  colorScheme="teal"
                  isLoading={isSubmitting}
                  type="submit"
                >
                  Submit
                </Button>
                <NextLink href="/login">
                  <Link color="teal">Already know your password?</Link>
                </NextLink>
              </Flex>
            </Form>
          )}
        </Formik>
      </Wrapper>
      {complete && (
        <Alert status="success" mt={10} borderRadius={25}>
          <AlertIcon />
          <AlertTitle mr={2}>
            A link has been sent to your email address!
          </AlertTitle>
          <AlertDescription>
            Reset your password and then{" "}
            <NextLink href="/login">
              <Link>login</Link>
            </NextLink>
          </AlertDescription>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      )}
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(ForgotPassword);
