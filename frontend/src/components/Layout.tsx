import { FC } from "react";

import Navbar from "./Navbar";
import Wrapper, { WrapperVariant } from "./Wrapper";

interface Props {
  variant?: WrapperVariant;
}

const Layout: FC<Props> = ({ children, variant = "regular" }) => {
  return (
    <>
      <Navbar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
};

export default Layout;
