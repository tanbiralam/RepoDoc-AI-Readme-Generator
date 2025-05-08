import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { subscriptionPlans } from "@/services/stripe";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil", // Use the latest API version
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId, userId } = await request.json();

    // Validate plan exists
    const plan = subscriptionPlans.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    // Handle zero-priced plans
    if (plan.price === "0" || plan.price === 0) {
      // Update user's subscription in your database
      // This would be an API call to your subscription service
      // For now, we'll just return success
      return NextResponse.json({ success: true });
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
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
