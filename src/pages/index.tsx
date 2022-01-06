import { Wrapper } from "../components";
import { Navbar } from "../components/Navbar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import NextLink from "next/link";
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { UpdootSection } from "../components/UpdootSection";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div>you have no query</div>;
  }

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
        {!data && fetching ? (
          <div>loading...</div>
        ) : (
          <Stack spacing={8}>
            {data!.posts.posts.map((p) => (
              <Flex
                key={p.id}
                p={5}
                shadow="md"
                borderWidth="1px"
                alignItems="center"
              >
                <UpdootSection post={p} />
                <Box>
                  <NextLink href={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize="xl">{p.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text>{p.creator.username}</Text>
                  <Text mt={4}>{p.textSnippet}</Text>
                </Box>
              </Flex>
            ))}
          </Stack>
        )}
        {data && data.posts.hasMore ? (
          <Flex>
            <Button
              m="auto"
              my={8}
              onClick={() => {
                setVariables({
                  limit: variables.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                });
              }}
            >
              Load more
            </Button>
          </Flex>
        ) : null}
      </Wrapper>
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
