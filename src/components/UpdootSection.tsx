import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, Button } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [{ fetching, operation }, vote] = useVoteMutation();
  const [voteStatus] = useState(post.voteStatus === -1 ? false : true);
  const [loadingIndicator, setLoadingIncator] = useState<
    "updoot" | "downdoot"
  >();

  return (
    <Flex direction="column" alignItems="center" pr={5}>
      <Button
        onClick={async () => {
          setLoadingIncator("updoot");
          await vote({
            postId: post.id,
            value: 1,
          });
          setLoadingIncator(undefined);
        }}
        isLoading={loadingIndicator === "updoot" ? fetching : undefined}
        background={voteStatus ? "teal" : undefined}
        color={voteStatus ? "white" : undefined}
      >
        <ChevronUpIcon fontSize={24} />
      </Button>
      {post.points}
      <Button
        onClick={async () => {
          setLoadingIncator("downdoot");
          await vote({
            postId: post.id,
            value: -1,
          });
          setLoadingIncator(undefined);
        }}
        isLoading={loadingIndicator === "downdoot" ? fetching : undefined}
        background={!voteStatus ? "tomato" : undefined}
        color={!voteStatus ? "white" : undefined}
      >
        <ChevronDownIcon fontSize={24} />
      </Button>
    </Flex>
  );
};
