import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, Button } from "@chakra-ui/react";
import React from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [, vote] = useVoteMutation();

  return (
    <Flex direction="column" alignItems="center" pr={5}>
      <Button
        background="none"
        onClick={() => {
          vote({
            postId: post.id,
            value: 1,
          });
        }}
      >
        <ChevronUpIcon fontSize={24} />
      </Button>
      {post.points}
      <Button
        background="none"
        onClick={() => {
          vote({
            postId: post.id,
            value: -1,
          });
        }}
      >
        <ChevronDownIcon fontSize={24} />
      </Button>
    </Flex>
  );
};
