import Link from "next/link";
import { LinkProps } from "next/link";
import { useRouter } from "next/router";
import React from "react";

type TLinkSafe = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps & LinkProps & {
  children?: React.ReactNode;
  href?: string;
} & React.RefAttributes<HTMLAnchorElement>>;

const LinkSafe = (props: TLinkSafe) => {
  const router = useRouter();

  // if current link same as target - don't render
  // otherwise error "Attempting hard redirect to same href"
  if (!props.href || router.asPath === props.href) {
    return <span {...props}>{props.children}</span>;
  }

  return (
    <Link
      {...props}
      href={props.href}
    />
  )
}

export default LinkSafe;
