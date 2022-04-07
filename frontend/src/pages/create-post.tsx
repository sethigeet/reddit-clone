import { FC } from "react";
import { useRouter } from "next/router";

import { useCreatePostMutation } from "../generated/graphql";

import { Box, Button } from "@chakra-ui/react";

import { Form, Formik } from "formik";

import { useIsAuth } from "../utils/useIsAuth";
import withApollo from "../utils/withApollo";

import InputField from "../components/InputField";
import Layout from "../components/Layout";

const CreatePost: FC = () => {
  const router = useRouter();
  const [createPost] = useCreatePostMutation();

  useIsAuth();

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setSubmitting }) => {
          const { errors } = await createPost({
            variables: { details: values },
            update: (cache) => cache.evict({ fieldName: "posts:{}" }),
          });
          if (!errors) {
            router.push("/");
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
              Create
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(CreatePost);
