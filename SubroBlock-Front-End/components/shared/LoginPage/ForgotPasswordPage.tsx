import React from "react";
import ArrowBackLink from "@/components/shared/ArrowBackLink";
import ForgotPassword_CheckEmail from "@/components/shared/LoginPage/ForgotPassword_CheckEmail";
import ForgotPassword_EmailForm from "@/components/shared/LoginPage/ForgotPassword_EmailForm";
import LoginCard from "@/components/shared/LoginPage/LoginCard";
import LoginFooter from "@/components/shared/LoginPage/LoginFooter";
import { useToast } from "@/components/ui/use-toast";
import { URL_FORGOT_PASSWORD_INITIATE_RECOVERY } from "@/lib/constants/api-urls";
import fetchAPI from "@/lib/fetchAPI";
import { useGlobalStyles } from "@/lib/hooks/useGlobalStyles";
import useLoading from "@/lib/hooks/useLoading";
import { cn } from "@/lib/utils";

const ForgotPasswordPage = () => {
  const { globalClassName } = useGlobalStyles();
  const [email, setEmail] = React.useState("");
  const [emailSent, setEmailSent] = React.useState(false);
  const { toast } = useToast();
  const [ loading, withLoading ] = useLoading();

  const handleSubmit = async (email: string) => {
    await withLoading(async () => {
      setEmail(email);

      toast({
        variant: "warning",
        title: "Sending email...",
        description: "Please wait while we send you an email with instructions to reset your password"
      });

      const response = await fetchAPI(URL_FORGOT_PASSWORD_INITIATE_RECOVERY, {
        method: "POST",
        body: JSON.stringify({
          email,
          frontUrl: process.env.NEXT_PUBLIC_URL
        })
      },
      {
        successToast: {
          title: "Success",
          description: "We have emailed the reset instructions if your email is registered"
        }
      });

      if (response.ok)
        setEmailSent(true);
    });
  }

  return (
    <div className={cn("w-full h-dvh bg-background-secondary", globalClassName)}>
      <LoginCard>
        <ArrowBackLink
          href={emailSent ? "/login/forgot" : "/login"}
          onClick={() => setEmailSent(false)}
        />
        <div className="w-96 z-10">
          {
            !emailSent
              ? <ForgotPassword_EmailForm onSubmit={handleSubmit} loading={loading}/>
              : <ForgotPassword_CheckEmail email={email} onSubmit={handleSubmit} />
          }
        </div>
      </LoginCard>
      <LoginFooter />
    </div>
  );
};

ForgotPasswordPage.getLayout = (page: React.ReactNode) => page;

export default ForgotPasswordPage;
