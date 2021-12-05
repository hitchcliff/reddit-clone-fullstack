import { Flex, Box, Link } from "@chakra-ui/layout";
import NextLink from "next/link";
import React from "react";

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  return (
    <Flex bg="teal" p={4} width="100%">
      <Box ml="auto" color="white">
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link mr={2}>Register</Link>
        </NextLink>
      </Box>
    </Flex>
  );
};
