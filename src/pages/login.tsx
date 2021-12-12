import React from "react";
import { Form, Formik } from "formik";
import { Wrapper } from "../components";
import { InputField } from "../components/InputField";
import { Box, Link, Flex } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/dist/client/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";

interface loginProps {}

const login: React.FC<loginProps> = ({}) => {
  const [, login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          const errors = response.data?.login.errors;

          // if it has error
          if (errors) {
            setErrors(toErrorMap(errors));
          } else if (response.data?.login.user) {
            // if we have a user
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="Username or email"
              label="Username or Email"
              type="text"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="Password"
                label="Password"
                type="password"
              />
            </Box>
            <Flex justifyItems="center" alignItems="center" mt={4}>
              <Button
                mr={2}
                isLoading={isSubmitting}
                color="teal"
                type="submit"
              >
                Login
              </Button>
              <NextLink href="/forgot-password">
                <Link mt={0}>Forgot password?</Link>
              </NextLink>
            </Flex>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(login);
