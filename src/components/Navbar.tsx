import { Button } from "@chakra-ui/button";
import { Flex, Box, Link } from "@chakra-ui/layout";
import NextLink from "next/link";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery();
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  let body = null;

  // data is loading
  if (fetching) {
    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link mr={2}>Register</Link>
        </NextLink>
      </>
    );
    // user is logged in
  } else {
    body = (
      <>
        <NextLink href="/">
          <Link mr={2}>{data.me.username}</Link>
        </NextLink>
        <Button
          mr={2}
          variant="link"
          color="white"
          isLoading={logoutFetching}
          onClick={() => {
            logout();
          }}
        >
          Logout
        </Button>
      </>
    );
  }

  return (
    <Flex bg="teal" p={4} width="100%">
      <Box ml="auto" color="white">
        {body}
      </Box>
    </Flex>
  );
};
