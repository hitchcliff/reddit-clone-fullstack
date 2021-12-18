import React from "react";
import { Wrapper } from ".";
import { Navbar } from "./Navbar";

interface LayoutProps {
  variant?: "small" | "regular";
}

export const Layout: React.FC<LayoutProps> = ({ children, variant }) => {
  return (
    <>
      <Navbar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
};
