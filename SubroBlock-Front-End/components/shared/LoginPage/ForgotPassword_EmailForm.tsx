import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string().email()
});

function ForgotPassword_EmailForm(props: { onSubmit: (email: string) => void; loading: boolean }) {
  const { onSubmit, loading } = props;

  const form = useForm({
    defaultValues: { email: "" },
    resolver: zodResolver(formSchema)
  });

  const handleSubmit = () => onSubmit(form.getValues("email"));

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="flex flex-col gap-3 text-center mt-2.5">
          <h1>
            Forgot Password
          </h1>
          <p>
            Enter your email and we will send you reset link
          </p>
        </div>
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
        <Button
          type="submit"
          disabled={loading}
        >
          Send Link
        </Button>
      </form>
    </Form>
  );
}

export default ForgotPassword_EmailForm;
