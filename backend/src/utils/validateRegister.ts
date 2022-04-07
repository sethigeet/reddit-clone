import { Field, InputType, ObjectType } from "type-graphql";

@InputType()
export class RegisterInput {
  @Field()
  email: string;

  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
export class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

export const validateRegister = (
  credentials: RegisterInput
): FieldError[] | null => {
  const errors = [];

  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!re.test(credentials.email.toLowerCase())) {
    errors.push({
      field: "email",
      message: "Invalid email address",
    });
  }

  if (credentials.username.length < 3) {
    errors.push({
      field: "username",
      message: "Username should be at least 3 characters long",
    });
  }

  if (credentials.username.includes("@")) {
    errors.push({
      field: "username",
      message: 'Username should not include an "@" symbol',
    });
  }

  if (credentials.password.length < 3) {
    errors.push({
      field: "password",
      message: "Password should be at least 3 characters long",
    });
  }

  if (errors.length > 0) {
    return errors;
  } else {
    return null;
  }
};
