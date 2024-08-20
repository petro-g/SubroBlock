import Image from "next/image";
import { Button } from "@/components/ui/button";
import CheckEmailImage from "@/public/check-email.svg";

interface ForgotPassword_CheckEmailProps {
  email: string;
  onSubmit: (email: string) => void;
}

const ForgotPassword_CheckEmail = (props: ForgotPassword_CheckEmailProps) => {
  const { email, onSubmit } = props;

  return (
    <div className="flex flex-col gap-6 items-center text-center">
      <div className="m-auto bg-background p-5 rounded shadow">
        <Image
          src={CheckEmailImage}
          alt="Check Email"
        />
      </div>
      <div>
        <h1 className="mb-3">
          Check Your Email
        </h1>
        <p>
          Please check
          <span className="font-bold text-primary-foreground"> {email} </span>
          for a reset link. Remember to check your spam folder.
        </p>
      </div>
      <div>
        <p>Did not receive the email?</p>
        <Button
          onClick={() => onSubmit(email)}
          variant="link"
          size="lg"
        >
          Send Again
        </Button>
      </div>
    </div>
  );
};

export default ForgotPassword_CheckEmail;
