import { z } from "zod";

export const formCreateOfferSchema = z.object({
  responderCompany: z.string(),
  accidentDate: z.string().min(1, {
    message: "Accident date is required"
  }),
  offerVehicleVin: z.string().regex(/^[0-9A-HJ-NPR-Z]{17}$/i, {
    message: "Invalid VIN. Please check and try again"
  }),
  responderVehicleVin: z.string().regex(/^[0-9A-HJ-NPR-Z]{17}$/i, {
    message: "Invalid VIN. Please check and try again"
  }),

  publicOfferAmount: z.string(),
  secretOfferAmount: z.string(),
  cycleTimeDurDecimal: z.number()
});
