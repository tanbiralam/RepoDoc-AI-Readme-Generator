import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { subscriptionPlans } from "@/services/stripe";
import Stripe from "stripe";

// Ensure Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-03-31.basil", // Use the latest API version
});

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Verify user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (_) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { planId, userId } = body;

    // Validate required fields
    if (!planId) {
      return NextResponse.json(
        { error: "Missing required field: planId" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 }
      );
    }

    // Validate plan exists
    const plan = subscriptionPlans.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json(
        { error: `Invalid plan ID: ${planId}` },
        { status: 400 }
      );
    }

    // Verify user exists in the database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: `Invalid user ID: ${userId}` },
        { status: 400 }
      );
    }

    // Handle zero-priced plans
    if (plan.price === "0" || plan.price === 0) {
      // Update user's subscription in your database
      const { error: updateError } = await supabase
        .from("users")
        .update({ subscription_tier: planId })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating user subscription:", updateError);
        return NextResponse.json(
          { error: "Failed to update subscription" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Validate required environment variable for success/cancel URLs
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.error("Missing NEXT_PUBLIC_BASE_URL environment variable");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create Stripe checkout session
    const price =
      typeof plan.price === "string" ? parseFloat(plan.price) : plan.price;

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${plan.name} Plan`,
              description: plan.description || `${plan.name} subscription plan`,
            },
            unit_amount: Math.round(price * 100), // Stripe expects amount in cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?checkout=canceled`,
      client_reference_id: userId,
      metadata: {
        userId,
        planId,
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);

    // Handle specific Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
