import express ,{ Router } from "express";

const stripeRouter = Router();

stripeRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    console.log("🔥 WEBHOOK HIT");
    res.json({ received: true });
  }
);

export default stripeRouter 