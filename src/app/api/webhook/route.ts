import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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
      console.log(`Webhook event received: ${event.type} [${event.id}]`);
    } catch (err) {
      console.error(
        `Webhook signature verification failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      return NextResponse.json({ error: "Webhook error" }, { status: 400 });
    }

    // Initialize Supabase admin client with service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Handle specific event types
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);

        // Optional: Record the payment in your database
        if (paymentIntent.metadata?.userId) {
          const userId = paymentIntent.metadata.userId;
          console.log(`Recording payment for user: ${userId}`);

          // Record the payment in your database
          const { error } = await supabase.from("payments").insert({
            user_id: userId,
            amount: paymentIntent.amount / 100, // Convert from cents to dollars
            currency: paymentIntent.currency,
            stripe_payment_intent_id: paymentIntent.id,
            status: "succeeded",
            description: "Payment completed",
          });

          if (error) {
            console.error("Error recording payment:", error);
          } else {
            console.log(`Payment recorded successfully for user: ${userId}`);
          }
        } else {
          console.log("Payment intent has no userId in metadata");
        }

        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout session completed: ${session.id}`);
        console.log(
          `Session data:`,
          JSON.stringify(
            {
              client_reference_id: session.client_reference_id,
              customer: session.customer,
              subscription: session.subscription,
              metadata: session.metadata,
            },
            null,
            2
          )
        );

        // Use metadata.userId if available, otherwise fallback to client_reference_id
        const userId = session.metadata?.userId || session.client_reference_id;

        if (!userId) {
          console.error(
            "No userId in metadata or client_reference_id in session"
          );
          return NextResponse.json(
            { error: "Invalid session: missing user identification" },
            { status: 400 }
          );
        }

        const planId = session.metadata?.planId || "pro"; // Default to 'pro' if planId is missing

        console.log(`Updating profile for user ${userId} with plan ${planId}`);

        try {
          // First check if the profile exists
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (profileError) {
            console.error(
              `Error fetching profile for user ${userId}:`,
              profileError
            );

            // If profile doesn't exist, try to create one
            if (profileError.code === "PGRST116") {
              console.log(
                `Profile not found for user ${userId}, creating new profile`
              );

              const { error: insertError } = await supabase
                .from("profiles")
                .insert({
                  id: userId,
                  subscription_tier: planId,
                  stripe_customer_id: session.customer as string,
                  stripe_subscription_id: session.subscription as string,
                  subscription_status: "active",
                });

              if (insertError) {
                console.error(
                  `Error creating profile for user ${userId}:`,
                  insertError
                );
                return NextResponse.json(
                  { error: `Failed to create profile: ${insertError.message}` },
                  { status: 500 }
                );
              }

              console.log(`Created new profile for user ${userId}`);
            } else {
              return NextResponse.json(
                { error: `Profile error: ${profileError.message}` },
                { status: 500 }
              );
            }
          } else {
            console.log(
              `Found existing profile for user ${userId}:`,
              profileData
            );

            // Update user's subscription in database
            const { error } = await supabase
              .from("profiles")
              .update({
                subscription_tier: planId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                subscription_status: "active",
              })
              .eq("id", userId);

            if (error) {
              console.error("Error updating user subscription:", error);
              return NextResponse.json(
                { error: `Database error: ${error.message}` },
                { status: 500 }
              );
            }

            console.log(
              `Successfully updated subscription for user ${userId} to ${planId}`
            );
          }

          // Also record this transaction in payments table
          if (session.amount_total) {
            console.log(
              `Recording payment of ${session.amount_total / 100} ${
                session.currency || "usd"
              } for session ${session.id}`
            );
            const { error: paymentError } = await supabase
              .from("payments")
              .insert({
                user_id: userId,
                amount: (session.amount_total / 100).toString(), // Match schema (amount is text)
                currency: session.currency || "usd",
                stripe_session_id: session.id,
                status: "succeeded",
                description: `Subscription payment for ${planId} plan`,
              });

            if (paymentError) {
              console.error("Error recording checkout payment:", paymentError);
            } else {
              console.log(
                `Payment record created for checkout session ${session.id}`
              );
            }
          }
        } catch (err) {
          console.error(
            "Unexpected error in checkout.session.completed handler:",
            err
          );
          return NextResponse.json(
            {
              error: `Server error: ${
                err instanceof Error ? err.message : "Unknown error"
              }`,
            },
            { status: 500 }
          );
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        console.log(
          `Subscription updated for customer: ${customerId}, status: ${subscription.status}`
        );

        // Get the current plan ID based on subscription status
        let planId = "free";
        if (
          subscription.status === "active" ||
          subscription.status === "trialing"
        ) {
          // Get price ID from subscription and map to your plan IDs
          const priceId = subscription.items.data[0]?.price.id;
          console.log(`Active subscription with price ID: ${priceId}`);

          // Map your Stripe price IDs to your plan IDs here
          // This is just a placeholder implementation
          if (priceId) {
            planId = "pro"; // Default to pro for any active subscription
          }
        }

        console.log(
          `Updating profile for customer ${customerId} to plan ${planId}`
        );

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
        } else {
          console.log(
            `Updated subscription status for customer ${customerId} to ${planId}`
          );
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        console.log(`Subscription deleted for customer: ${customerId}`);

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
        } else {
          console.log(
            `Downgraded subscription for customer ${customerId} to free plan`
          );
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
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
