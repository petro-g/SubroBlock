"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InputPassword } from "@/components/shared/input-password";
import LoginCard from "@/components/shared/LoginPage/LoginCard";
import LoginFooter from "@/components/shared/LoginPage/LoginFooter";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { URL_FORGOT_PASSWORD_NEW_PASSWORD, URL_FORGOT_PASSWORD_VALIDATE_TOKEN } from "@/lib/constants/api-urls";
import fetchAPI from "@/lib/fetchAPI";
import { useGlobalStyles } from "@/lib/hooks/useGlobalStyles";
import useLoading from "@/lib/hooks/useLoading";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  newPassword: z.string().min(8).max(100),
  confirmNewPassword: z.string().min(8).max(100)
});

function ResetPasswordPage() {
  const router = useRouter();
  const { globalClassName } = useGlobalStyles();
  const [ loading, withLoading ] = useLoading();
  const form = useForm({
    defaultValues: {
      newPassword: "",
      confirmNewPassword: ""
    },
    resolver: zodResolver(formSchema)
  });

  // on initial load check is reset token valid
  useEffect(() => {
    withLoading(async () => {
      const resetToken = new URL(window.location.href).searchParams.get("resetToken");

      const response = await fetchAPI(URL_FORGOT_PASSWORD_VALIDATE_TOKEN, {
        method: "POST",
        body: JSON.stringify({ token: resetToken })
      },
      {
        errorToast:{
          title: "Password Reset Link Expired",
          description: "The password reset link you've used is either invalid or expired. Please request a new password reset link by entering your email address below"
        }
      });

      // if failed to validate token, redirect back to forgot password page to request new token
      if (!response.ok)
        await router.push("/login/forgot");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await withLoading(async () => {
      const resetToken = new URL(window.location.href).searchParams.get("resetToken"); // token user for validating reset password
      const newPassword = values.newPassword;
      const confirmNewPassword = values.confirmNewPassword;

      if (newPassword !== confirmNewPassword) {
        form.setError("confirmNewPassword", { message: "Passwords do not match" });
        return;
      }

      const response = await fetchAPI(URL_FORGOT_PASSWORD_NEW_PASSWORD, {
        method: "POST",
        body: JSON.stringify({ resetToken, newPassword })
      },
      {
        successToast: {
          title: "Password Successfully Reset",
          description: "Your password has been successfully reset. You can now sign in using your new password"
        }
      });

      // redirect to login page
      if (response.ok)
        await router.push("/login");
    });
  }

  return (
    <div className={cn("w-full h-dvh bg-background-secondary", globalClassName)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <LoginCard>
            <div className="flex flex-col gap-6 w-96 z-10 mt-4">
              <div className="flex flex-col gap-3 text-center">
                <h1>Reset Password</h1>
                <p>Create new password below</p>
              </div>
              <FormField
                name="newPassword"
                control={form.control}
                disabled={loading}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <InputPassword
                      id="newPassword"
                      placeholder="New password"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="confirmNewPassword"
                control={form.control}
                disabled={loading}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <InputPassword
                      id="confirmNewPassword"
                      placeholder="Confirm new password"
                      required
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                Reset Password
              </Button>
            </div>
          </LoginCard>
          <LoginFooter />
        </form>
      </Form>
    </div>
  );
}

ResetPasswordPage.getLayout = (page: React.ReactNode) => page;

export default ResetPasswordPage;
