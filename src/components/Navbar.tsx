import { Button } from "@chakra-ui/button";
import { Flex, Box, Link, Heading } from "@chakra-ui/layout";
import NextLink from "next/link";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
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
        <Flex
          flex={1}
          color="white"
          alignItems="center"
          justifyContent="space-between"
        >
          <NextLink href="/">
            <Link fontSize={24} fontWeight="bold">
              LiReddit
            </Link>
          </NextLink>
          <Flex flexDirection="row">
            <NextLink href="/create-post">
              <Link display="block" mr={4}>
                Create post
              </Link>
            </NextLink>
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
          </Flex>
        </Flex>
      </>
    );
  }

  return (
    <Flex position="sticky" top={0} zIndex={1} bg="teal" p={4} width="100%">
      {body}
    </Flex>
  );
};
