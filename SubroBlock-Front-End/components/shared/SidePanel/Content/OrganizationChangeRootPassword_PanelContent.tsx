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
import { useOrganizationsStore } from "@/store/useOrganizationsStore";
import { useSidePanelStore } from "@/store/useSidePanelStore";

const formSchema = z.object({
  newRootPassword: z.string().min(8).max(100),
  confirmNewRootPassword: z.string().min(8).max(100)
})

const CurrentUserChangePassword_PanelContent =  () => {

  const { changeRootPassword } = useOrganizationsStore();
  const { setOpenPanel } = useSidePanelStore();

  const form = useForm({
    defaultValues: {
      newRootPassword: "",
      confirmNewRootPassword: ""
    },
    resolver: zodResolver(formSchema)
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    // console.log(values);
    //Should be changed with real id
    const organizationId = "14";
    const newPassword = values.newRootPassword;
    const response = await changeRootPassword(
      organizationId,
      newPassword
    );

    if (response.ok) {
      setOpenPanel(null);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          name="newRootPassword"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col mb-3">
              <InputPassword
                id="newRootPassword"
                placeholder="New Root Password"
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="confirmNewRootPassword"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <InputPassword
                id="confirmNewRootPassword"
                placeholder="Confirm New Root Password"
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
