import { FC } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";

import {
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";

import { Box, Button, Heading, Link, Text } from "@chakra-ui/react";

import { Form, Formik } from "formik";

import { useIsAuth } from "../../../utils/useIsAuth";
import withApollo from "../../../utils/withApollo";

import InputField from "../../../components/InputField";
import Layout from "../../../components/Layout";
import Error from "../../../components/Error";

const CreatePost: FC = () => {
  const router = useRouter();
  const postId = router.query.id as string;
  const { data, loading, error } = usePostQuery({
    skip: postId === "",
    variables: { id: postId },
  });
  const [updatePost] = useUpdatePostMutation();

  useIsAuth();

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
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values, { setSubmitting }) => {
          const { errors } = await updatePost({
            variables: { id: postId, ...values },
          });
          if (!errors) {
            router.back();
          }
          setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" label="Title" placeholder="Title" />
            <Box mt={4}>
              <InputField
                name="text"
                label="Text"
                placeholder="Text"
                textarea
              />
            </Box>
            <Button
              mt={4}
              colorScheme="teal"
              isLoading={isSubmitting}
              type="submit"
            >
              Update
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(CreatePost);
