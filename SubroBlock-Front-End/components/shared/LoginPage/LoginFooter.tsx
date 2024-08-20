import * as React from "react";
import InformationDialog from "@/components/shared/InformationDialog/InformationDialog";
import PrivacyPolicy from "@/components/shared/InformationDialog/PrivacyPolicy";
import TermsOfUse from "@/components/shared/InformationDialog/TermsOfUse";
import { Button } from "@/components/ui/button";

const LoginFooter = () => {
  return (
    <div className="flex text-center fixed bottom-0 justify-between items-center p-6 border-t-2 left-6 w-[calc(100%-24px*2)]">
      <div>
        SubroBlock V1.1
      </div>
      <div className="flex gap-8 items-center">
        <InformationDialog
          title="Terms of Use"
          trigger={
            <Button
              variant="link"
              className="text-primary hover:text-primary text-lg font-normal">
                Terms of Use
            </Button>
          }
        >
          <TermsOfUse/>
        </InformationDialog>
        <InformationDialog
          title="Privacy Policy"
          trigger={
            <Button
              variant="link"
              className="text-primary hover:text-primary text-lg font-normal">
                      Privacy Policy
            </Button>
          }
        >
          <PrivacyPolicy/>
        </InformationDialog>
      </div>
    </div>
  );
};

export default LoginFooter;
