"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InputPassword } from "@/components/shared/input-password";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import {
  URL_UPDATE_ROOT_USER_PASSWORD
} from "@/lib/constants/api-urls";
import fetchAPI from "@/lib/fetchAPI";

const formSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100)
});
const CurrentUserChangePassword_PanelContent =  () => {
  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: ""
    },
    resolver: zodResolver(formSchema)
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    // console.log(values);
    //Should be changed with real id
    const organizationId = "14";
    const newPassword = values.newPassword;

    // TODO move to store
    await fetchAPI(URL_UPDATE_ROOT_USER_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ organizationId, newPassword })
    }, {
      successToast: {
        title: "Password Successfully Changed",
        description: "Your password has been successfully changed. You can now sign in using your new password"
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          name="currentPassword"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col mb-3">
              <InputPassword
                id="currentPassword"
                placeholder="Enter current root password"
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="newPassword"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <InputPassword
                id="newPassword"
                placeholder="Enter new root password"
                required
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full absolute bottom-8"
        >
          Change Password
        </Button>
      </form>
    </Form>
  );
};
export default CurrentUserChangePassword_PanelContent;
