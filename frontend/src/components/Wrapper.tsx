import { Box } from "@chakra-ui/react";
import { FC } from "react";

export type WrapperVariant = "small" | "regular";

interface Props {
  variant?: WrapperVariant;
}

const Wrapper: FC<Props> = ({ children, variant = "regular" }) => {
  return (
    <Box
      mt={8}
      mx="auto"
      maxW={variant === "regular" ? "800px" : "400px"}
      w="100%"
    >
      {children}
    </Box>
  );
};

export default Wrapper;
