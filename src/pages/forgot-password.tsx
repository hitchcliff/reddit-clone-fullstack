import { Box, Flex, Button, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { useRouter } from "next/dist/client/router";
import React, { useState } from "react";
import { Wrapper } from "../components";
import { InputField } from "../components/InputField";
import {
  useForgotPasswordMutation,
  useLoginMutation,
} from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import NextLink from "next/link";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

interface forgotPasswordProps {}

const forgotPassword: React.FC<forgotPasswordProps> = ({}) => {
  const [, forgotPassword] = useForgotPasswordMutation();
  const [complete, setComplete] = useState(false);

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              If an account that email exists, we sent you an email
              <Box color="teal" mt={2}>
                <NextLink href="/">
                  <Link mt={0}>Go back to home</Link>
                </NextLink>
              </Box>
            </Box>
          ) : (
            <Form>
              <InputField
                name="email"
                placeholder="Email"
                label="Enter email"
                type="text"
              />
              <Flex justifyItems="center" alignItems="center" mt={4}>
                <Button
                  mr={2}
                  isLoading={isSubmitting}
                  color="teal"
                  type="submit"
                >
                  Forgot Password
                </Button>
                <NextLink href="/login">
                  <Link mt={0}>Already have an account?</Link>
                </NextLink>
              </Flex>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(forgotPassword);
