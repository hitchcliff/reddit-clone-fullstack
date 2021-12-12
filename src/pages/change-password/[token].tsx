import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/dist/client/router";
import { useState } from "react";
import { Wrapper } from "../../components";
import { InputField } from "../../components/InputField";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";

interface ChangePasswordProps {
  token: string;
}

const ChangePassword = ({ token }: ChangePasswordProps) => {
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setErrorToken] = useState("");
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            newPassword: values.newPassword,
            token,
          });

          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);

            if ("token" in errorMap) {
              setErrorToken(errorMap.token);
            }

            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            // worked
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="New Password"
              label="New Password"
              type="password"
            />
            <Box mt={1} color="red">
              {tokenError}
            </Box>
            <Button mt={4} isLoading={isSubmitting} color="teal" type="submit">
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }: any) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
