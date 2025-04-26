import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") as string;

    if (!webhookSecret || !signature) {
      console.error("Webhook secret or signature missing");
      return NextResponse.json({ error: "Webhook error" }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(
        `Webhook signature verification failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      return NextResponse.json({ error: "Webhook error" }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Handle specific event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.client_reference_id) {
          console.error("No client_reference_id in session");
          return NextResponse.json(
            { error: "Invalid session" },
            { status: 400 }
          );
        }

        const userId = session.client_reference_id;
        const planId = session.metadata?.planId || "pro"; // Default to 'pro' if planId is missing

        // Update user's subscription in database
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_tier: planId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq("id", userId);

        if (error) {
          console.error("Error updating user subscription:", error);
          return NextResponse.json(
            { error: "Database error" },
            { status: 500 }
          );
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get the current plan ID based on subscription status
        let planId = "free";
        if (
          subscription.status === "active" ||
          subscription.status === "trialing"
        ) {
          // Get price ID from subscription and map to your plan IDs
          const priceId = subscription.items.data[0]?.price.id;

          // Map your Stripe price IDs to your plan IDs here
          // This is just a placeholder implementation
          if (priceId) {
            planId = "pro"; // Default to pro for any active subscription
          }
        }

        // Update user's subscription in database
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_tier: planId,
            subscription_status: subscription.status,
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("Error updating subscription status:", error);
          return NextResponse.json(
            { error: "Database error" },
            { status: 500 }
          );
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Downgrade user to free plan
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_tier: "free",
            subscription_status: "canceled",
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("Error downgrading subscription:", error);
          return NextResponse.json(
            { error: "Database error" },
            { status: 500 }
          );
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
