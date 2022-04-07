import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react";
import { FC } from "react";

interface ErrorProps {
  title?: string;
  error: string;
}
const Error: FC<ErrorProps> = ({ title, error }) => {
  return (
    <Alert
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="200px"
      borderRadius={10}
    >
      <AlertIcon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        {title ? title : "An error occurred while fetching the data!"}
      </AlertTitle>
      <AlertDescription maxWidth="sm">{error}</AlertDescription>
    </Alert>
  );
};

export default Error;
