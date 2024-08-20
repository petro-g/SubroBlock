"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InputPassword } from "@/components/shared/input-password";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useOrganizationsStore } from "@/store/useOrganizationsStore";
import { useSidePanelStore } from "@/store/useSidePanelStore";

const formSubroOrgSchema = z.object({
  organizationName: z
    .string()
    .min(2, "Organization name must be at least 2 characters long")
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      "Organization name must contain alphanumeric characters only"
    ),
  rootUserEmail: z
    .string()
    .email("Invalid email format")
    .min(1, "Email is required"),
  rootUserPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100)
});

const CreateOrg_PanelContent =  () => {
  const { setOpenPanel } = useSidePanelStore();
  const { createOrganization } = useOrganizationsStore();

  const form = useForm({
    defaultValues: {
      organizationName: "",
      rootUserEmail: "",
      rootUserPassword: ""
    },
    resolver: zodResolver(formSubroOrgSchema)
  });

  async function onSubmit(values: z.infer<typeof formSubroOrgSchema>) {

    const response = await createOrganization(
      values.organizationName,
      values.rootUserEmail,
      values.rootUserPassword
    );

    if (response.ok)
      setOpenPanel(null);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="organizationName"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel htmlFor="organizationName" className="text-sm">
                Organization Name
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  id="organizationName"
                  placeholder="Enter organization name"
                  required
                  className={`${
                    form.formState.errors.organizationName
                      ? "border-destructive"
                      : ""
                  }`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="rootUserEmail"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col mt-[16px]">
              <FormLabel htmlFor="rootUserEmail" className="text-sm">
                Root User Email
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  id="rootUserEmail"
                  placeholder="Enter root user email"
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="rootUserPassword"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col mt-[16px]">
              <FormLabel htmlFor="password" className="text-sm">
                Root Password
              </FormLabel>
              <FormControl>
                <InputPassword
                  id="rootUserPassword"
                  placeholder="Enter root password"
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="submit"
              className="w-[467px] h-[48px] absolute bottom-[32px]"
            >
              Create Subro Org
            </Button>
          </SheetTrigger>
        </Sheet>
      </form>
    </Form>
  );
};

export default CreateOrg_PanelContent;
