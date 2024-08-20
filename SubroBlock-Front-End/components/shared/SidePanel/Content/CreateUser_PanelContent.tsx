"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { IOption } from "@/components/shared/DropdownOptionsMenu/dropdown-options.types";
import { InputPassword } from "@/components/shared/input-password";
import dropdownSearchedOptionRenderer from "@/components/shared/InputDropdownOptions/dropdownSearchedOptionRenderer";
import {
  useTableDataProps
} from "@/components/shared/TableCardList/use-table-data-props";
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
import { useToast } from "@/components/ui/use-toast";
import useCurrentRoute from "@/lib/hooks/useCurrentRoute";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { currentUserHasSomeRoles } from "@/lib/utils";
import { useOrganizationsStore } from "@/store/useOrganizationsStore";
import { useSidePanelStore } from "@/store/useSidePanelStore";
import { useUsersStore } from "@/store/useUsersStore";
import { InputDropdownOptions } from "../../InputDropdownOptions";

const formSubroUsersAdminSchema = z.object({
  organizationName: z.string().min(1, "Missing Organization Name"),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  // optional names
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

const formSubroUsersRootUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  // optional names
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

// Create user in any organization, because you are Root User here
const CreateUser_PanelContent =  () => {
  const currentUser = useCurrentUser();
  const { setOpenPanel } = useSidePanelStore();
  const { toast } = useToast();
  const { createUser } = useUsersStore();
  const {
    organizations,
    fetchOrganizations,
    lastFetchParams
  } = useOrganizationsStore();

  const {
    withLoadingDelayed
  } = useTableDataProps({ lastFetchParams });

  const currentRoute = useCurrentRoute();
  const isArbitratorsPage = currentRoute?.href === "/arbitrators";
  const isAdmin = currentUserHasSomeRoles(currentUser, ["admin"]);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      organizationName: "",
      firstName: "",
      lastName: ""
    },
    resolver: zodResolver(isAdmin && !isArbitratorsPage ? formSubroUsersAdminSchema : formSubroUsersRootUserSchema)
  });

  const organizationName = form.watch("organizationName");

  useEffect(() => {
    withLoadingDelayed(async () => fetchOrganizations({
      ...lastFetchParams,
      organizationName
    }));
  }, [organizationName]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: z.infer<typeof formSubroUsersAdminSchema>) {
    if (!currentUser) {
      toast({
        variant: "error",
        title: "Error",
        description: "User not found"
      });
      return;
    }

    // only needed for admin to choose org where create new user to
    const selectedOrganizationId =
      organizations?.find(
        (organization) => organization.company
          ? organization.company === organizationName
          : organization.id.toString() === organizationName
      )?.id || -1;

    const response = await createUser(
      currentUser,
      values.email,
      values.password,
      selectedOrganizationId,
      values.firstName,
      values.lastName,
      isArbitratorsPage
    );

    if (response.ok)
      setOpenPanel(null);
  }

  const options = organizations?.map((organization) => ({
    label: organization.company || organization.id.toString(),
    value: organization.id.toString(),
    render: option => dropdownSearchedOptionRenderer(option, organizationName)
  }) as IOption) || [];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        {isAdmin && !isArbitratorsPage && (
          <FormField
            name="organizationName"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel htmlFor="organizationName" className="text-sm">
                  Organization Name
                </FormLabel>
                <FormControl>
                  <InputDropdownOptions
                    inputProps={{
                      placeholder: "Enter organization name",
                      required: true,
                      ...field,
                      value: organizationName
                    }}
                    options={options}
                    onApplyOptionsChange={(selectedOptions) => form.setValue("organizationName", selectedOptions[0].label || "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel htmlFor="email" className="text-sm">
                {isArbitratorsPage ? "Arbitrator Email" : "Subro User Email"}
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  id="email"
                  placeholder="Enter user email"
                  className={`${
                    form.formState.errors.email
                      ? "border-destructive"
                      : "border-secondary"
                  }`}
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
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel htmlFor="password" className="text-sm">
                Password
              </FormLabel>
              <FormControl>
                <InputPassword
                  id="password"
                  placeholder="Enter password"
                  className={`${
                    form.formState.errors.password
                      ? "border-destructive"
                      : "border-secondary "
                  } h-[51px] hover:border-accent-foreground focus-visible:ring-offset-[-5px] focus-visible:ring-shadow-accent-foreground`}
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="firstName"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel htmlFor="firstName" className="text-sm">
                First Name
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  id="firstName"
                  placeholder="Enter first name"
                  className="border-secondary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="lastName"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel htmlFor="lastName" className="text-sm">
                Last Name
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  id="lastName"
                  placeholder="Enter last name"
                  className="border-secondary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-[467px] h-[48px] absolute bottom-[32px]"
        >
          Create {isArbitratorsPage ? "Arbitrator" : "Subro User"}
        </Button>
      </form>
    </Form>
  );
};
export default CreateUser_PanelContent;
