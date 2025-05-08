import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil", // Use the latest API version
});

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get customer's subscription from database
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (subscriptionError || !subscriptionData?.stripe_subscription_id) {
      console.error("Error fetching subscription", {
        userId,
        error: subscriptionError,
      });
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    const { stripe_subscription_id } = subscriptionData;

    // Cancel the subscription at period end (will not charge the customer again)
    await stripe.subscriptions.update(stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Update the subscription status in our database
    await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    console.log("Subscription cancelled successfully", {
      userId,
      subscriptionId: stripe_subscription_id,
    });

    return NextResponse.json({
      success: true,
      message:
        "Subscription scheduled for cancellation at the end of the billing period",
    });
  } catch (error) {
    console.error("Error cancelling subscription", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
