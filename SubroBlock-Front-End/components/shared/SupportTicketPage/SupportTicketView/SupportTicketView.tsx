import { ITicket } from "../SupportTicketItem/SupportTicketItem";

interface Props {
  ticket: ITicket;
}

export const SupportTicketView = ({ ticket }: Props) => {
  return (
    <div className="bg-background flex flex-col md:flex-row rounded-lg border border-borderColor min-h-[555px] not-italic">
      <div className="flex flex-col md:w-[305px] gap-2 md:border-r text-sm px-4">
        <div className="flex items-center justify-between  pt-4">
          <div className="text-secondary-foreground">Ticket ID:</div>
          <div className="text-primary-foreground">{ticket?.id}</div>
        </div>
        <div className="flex items-center justify-between pt-4">
          <div className="text-secondary-foreground">Severity:</div>
          <div className="text-primary-foreground">{ticket?.severity}</div>
        </div>
        <div className="flex items-center justify-between pt-4">
          <div className="text-secondary-foreground">Organization name:</div>
          <div className="text-primary-foreground">{ticket?.originalName}</div>
        </div>
        <div className="flex items-center justify-between pt-4">
          <div className="text-secondary-foreground">User name:</div>
          <div className="text-primary-foreground">{ticket?.userName}</div>
        </div>
        <div className="flex items-center justify-between pt-4">
          <div className="text-secondary-foreground">Date Created:</div>
          <div className="text-primary-foreground">{ticket?.createdAt}</div>
        </div>
        <div className="flex items-center justify-between pt-4">
          <div className="text-secondary-foreground">Status:</div>
          <div className="bg-input text-primary-foreground rounded-2xl text-center px-3 py-1 font-normal">
            {ticket?.status}
          </div>
        </div>
      </div>
      <div className="flex-1 px-4 md:pr-2">
        <div className="pt-4 text-sm text-secondary-foreground">Details:</div>
        <div className="pt-4 text-base md:pr-10">
          Lorem ipsum dolor sit amet consectetur. Consequat accumsan aliquam
          fringilla pulvinar enim varius fringilla quisque. Volutpat sit morbi
          convallis tortor amet. Arcu commodo vitae sit sed id consectetur
          accumsan pretium mauris. In risus lectus nunc mauris in lectus amet
          orci massa.
        </div>
        <button className="mt-4 bg-secondary text-primary-foreground px-6 py-3.5 rounded-lg border border-primary font-medium text-sm">
          Download Ticket Data
        </button>
      </div>
    </div>
  );
};
