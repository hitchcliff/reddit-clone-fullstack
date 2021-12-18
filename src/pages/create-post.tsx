import { Box, Flex, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/dist/client/router";
import React from "react";
import { Wrapper } from "../components";
import { InputField } from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";

interface CreatePostProps {}

const CreatePost: React.FC<CreatePostProps> = ({}) => {
  const [, login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
          // const response = await login(values);
          // const errors = response.data?.login.errors;
          // // if it has error
          // if (errors) {
          //   setErrors(toErrorMap(errors));
          // } else if (response.data?.login.user) {
          //   // if we have a user
          //   router.push("/");
          // }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="title"
              placeholder="Title"
              label="Title"
              type="text"
            />
            <Box mt={4}>
              <InputField
                name="text"
                placeholder="Text..."
                label="Body"
                type="text"
                textarea
              />
            </Box>
            <Flex justifyItems="center" alignItems="center" mt={4}>
              <Button
                mr={2}
                isLoading={isSubmitting}
                color="teal"
                type="submit"
              >
                Create Post
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
