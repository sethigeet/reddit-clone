import { FC, useState } from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  CloseButton,
  Link,
} from "@chakra-ui/react";
import { Formik, Form } from "formik";

import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";

import { toErrorMap } from "../../utils/toErrorMap";

import {
  MeDocument,
  MeQuery,
  useChangePasswordMutation,
} from "../../generated/graphql";
import withApollo from "../../utils/withApollo";

const ChangePassword: FC = () => {
  const [changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");
  const router = useRouter();

  const token =
    typeof router.query.token === "string" ? router.query.token : "";

  return (
    <Wrapper>
      <Wrapper variant="small">
        <Formik
          initialValues={{ newPassword: "" }}
          onSubmit={async (values, { setErrors, setSubmitting }) => {
            const response = await changePassword({
              variables: {
                newPassword: values.newPassword,
                token,
              },
              update: (cache, { data }) => {
                cache.writeQuery<MeQuery>({
                  query: MeDocument,
                  data: {
                    __typename: "Query",
                    me: data?.changePassword.user,
                  },
                });
              },
            });
            if (response.data?.changePassword.errors) {
              const errorMap = toErrorMap(response.data.changePassword.errors);
              if ("token" in errorMap) {
                setTokenError(errorMap.token);
              }
              setErrors(errorMap);
            } else if (response.data?.changePassword.user) {
              router.push("/login");
            }
            setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="newPassword"
                label="New Password"
                placeholder="New Password"
                type="password"
              />
              <Button
                mt={4}
                colorScheme="teal"
                isLoading={isSubmitting}
                type="submit"
              >
                Submit
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
      {tokenError && (
        <Alert status="error" mt={10} borderRadius={25}>
          <AlertIcon />
          <AlertTitle mr={2}>{tokenError}</AlertTitle>
          <AlertDescription>
            Try to{" "}
            <NextLink href="/forgot-password">
              <Link>reset</Link>
            </NextLink>{" "}
            it again!
          </AlertDescription>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      )}
    </Wrapper>
  );
};

export default withApollo({ ssr: true })(ChangePassword);
