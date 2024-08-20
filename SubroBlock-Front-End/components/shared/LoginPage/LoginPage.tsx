"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InputPassword } from "@/components/shared/input-password";
import LoginCard from "@/components/shared/LoginPage/LoginCard";
import LoginFooter from "@/components/shared/LoginPage/LoginFooter";
import LoginLogo from "@/components/shared/LoginPage/LoginLogo";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGlobalStyles } from "@/lib/hooks/useGlobalStyles";
import useLoading from "@/lib/hooks/useLoading";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

function LoginPage() {
  const { globalClassName } = useGlobalStyles();
  const session = useSession();
  const router = useRouter();
  const [ loading, withLoading ] = useLoading();

  // only on client
  if (typeof window !== "undefined")
    console.log("session:", session);

  const form = useForm({
    defaultValues: {
      email: "",
      password: ""
    },
    resolver: zodResolver(formSchema)
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await withLoading(async () => {
      const response = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false
      });

      if (response?.ok) {
        if (router.asPath.includes("/login") || router.asPath.includes("/404"))
          await router.replace("/");
        else
          await router.replace(router.asPath); // silent page refresh
      } else
        form.setError("password", { type: "manual", message: response?.error || "Unknown error occurred" });
    })
  }

  return (
    <div className={cn("w-full h-dvh bg-background-secondary", globalClassName)}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <LoginCard>
            <LoginLogo />
            <h1 className="text-primary-foreground text-center z-10">
              Welcome back
            </h1>

            <div className="flex flex-col gap-4 z-10 w-full">
              <FormField
                name="email"
                control={form.control}
                disabled={loading}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormControl>
                      <Input
                        type="text"
                        id="email"
                        placeholder="Enter email"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                disabled={loading}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormControl>
                      <InputPassword
                        id="password"
                        placeholder="Enter password"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <Button variant="link">
                      <Link
                        href="/login/forgot"
                      >
                        Forgot Password?
                      </Link>
                    </Button>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                Login
              </Button>
            </div>
          </LoginCard>
          <LoginFooter />
        </form>
      </Form>
    </div>
  );
}

LoginPage.getLayout = (page: React.ReactNode) => page;

export default LoginPage;
