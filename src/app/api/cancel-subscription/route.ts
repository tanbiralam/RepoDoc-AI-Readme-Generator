import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Stripe from "stripe";

// Initialize Stripe with correct API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
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

    // Get customer's subscription from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("id", userId)
      .single();

    if (profileError || !profileData?.stripe_subscription_id) {
      console.error("Error fetching profile", {
        userId,
        error: profileError,
      });
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    const { stripe_subscription_id } = profileData;

    // Cancel the subscription at period end (will not charge the customer again)
    await stripe.subscriptions.update(stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Update the subscription status in profiles table
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_status: "canceled",
        subscription_tier: "free",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating profile subscription status:", updateError);
      return NextResponse.json(
        { error: "Failed to update subscription status" },
        { status: 500 }
      );
    }

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
