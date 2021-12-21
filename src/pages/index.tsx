import { Wrapper } from "../components";
import { Navbar } from "../components/Navbar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import NextLink from "next/link";
import { Box, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";

const Index = () => {
  const [{ data, fetching }] = usePostsQuery({
    variables: {
      limit: 10,
    },
  });

  return (
    <>
      <Navbar />
      <Wrapper>
        <Flex alignItems="center" justifyContent="space-between" mb={4}>
          <Heading>LiReddit</Heading>
          <Link display="block">
            <NextLink href="/create-post">Create post</NextLink>
          </Link>
        </Flex>
        {!data ? (
          <div>loading...</div>
        ) : (
          <Stack spacing={8}>
            {data.posts.map((p) => (
              <Box key={p.id} p={5} shadow="md" borderWidth="1px">
                <Heading fontSize="xl">{p.title}</Heading>
                <Text mt={4}>{p.textSnippet}</Text>
              </Box>
            ))}
          </Stack>
        )}
      </Wrapper>
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
