import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Flex, Button } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useDeletePostMutation } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
}) => {
  const [, deletePost] = useDeletePostMutation();

  return (
    <Flex mt="auto">
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <Button mr={2}>
          <EditIcon />
        </Button>
      </NextLink>

      <Button
        onClick={() => {
          deletePost({ id });
        }}
      >
        <DeleteIcon />
      </Button>
    </Flex>
  );
};
