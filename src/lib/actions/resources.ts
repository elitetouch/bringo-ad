"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiPatch, apiPost } from "@/lib/api";

function id(formData: FormData): string {
  return String(formData.get("id"));
}

// ---- Users ----
export async function suspendUser(formData: FormData) {
  await apiPatch(`/admin/users/${id(formData)}/suspend`);
  revalidatePath("/users");
}

export async function reactivateUser(formData: FormData) {
  await apiPatch(`/admin/users/${id(formData)}/reactivate`);
  revalidatePath("/users");
}

export async function updateUserRole(formData: FormData) {
  const role = String(formData.get("role"));
  await apiPatch(`/admin/users/${id(formData)}/role`, { role });
  revalidatePath("/users");
}

// ---- Merchants ----
export async function approveMerchant(formData: FormData) {
  await apiPatch(`/admin/merchants/${id(formData)}/approve`);
  revalidatePath("/merchants");
}

export async function rejectMerchant(formData: FormData) {
  const reason = String(formData.get("reason") ?? "");
  await apiPatch(`/admin/merchants/${id(formData)}/reject`, { reason });
  revalidatePath("/merchants");
}

export async function suspendMerchant(formData: FormData) {
  await apiPatch(`/admin/merchants/${id(formData)}/suspend`);
  revalidatePath("/merchants");
}

// ---- KYC documents ----
export async function approveKycDocument(formData: FormData) {
  await apiPatch(`/admin/kyc-documents/${id(formData)}/approve`);
  revalidatePath("/kyc-documents");
}

export async function rejectKycDocument(formData: FormData) {
  const reason = String(formData.get("reason") ?? "");
  await apiPatch(`/admin/kyc-documents/${id(formData)}/reject`, { reason });
  revalidatePath("/kyc-documents");
}

// ---- Shoppers ----
export async function approveShopper(formData: FormData) {
  await apiPatch(`/admin/shoppers/${id(formData)}/approve`);
  revalidatePath("/shoppers");
}

export async function rejectShopper(formData: FormData) {
  await apiPatch(`/admin/shoppers/${id(formData)}/reject`);
  revalidatePath("/shoppers");
}

export async function suspendShopper(formData: FormData) {
  await apiPatch(`/admin/shoppers/${id(formData)}/suspend`);
  revalidatePath("/shoppers");
}

// ---- Store brands / outlets / products (moderation toggle) ----
export async function toggleStoreBrandActive(formData: FormData) {
  const isActive = formData.get("is_active") === "true";
  await apiPatch(`/admin/store-brands/${id(formData)}/active`, { is_active: isActive });
  revalidatePath("/store-brands");
}

export async function toggleStoreOutletActive(formData: FormData) {
  const isActive = formData.get("is_active") === "true";
  await apiPatch(`/admin/store-outlets/${id(formData)}/active`, { is_active: isActive });
  revalidatePath("/store-outlets");
}

export async function toggleProductActive(formData: FormData) {
  const isActive = formData.get("is_active") === "true";
  await apiPatch(`/admin/products/${id(formData)}/active`, { is_active: isActive });
  revalidatePath("/products");
}

// ---- Subscription plans / prices ----
export async function createSubscriptionPlan(formData: FormData) {
  await apiPost("/admin/subscription-plans", {
    code: String(formData.get("code")),
    name: String(formData.get("name")),
    description: String(formData.get("description") ?? "") || undefined,
  });
  revalidatePath("/subscription-plans");
}

export async function createSubscriptionPlanPrice(formData: FormData) {
  const planId = String(formData.get("plan_id"));
  await apiPost(`/admin/subscription-plans/${planId}/prices`, {
    country_id: String(formData.get("country_id")),
    interval: String(formData.get("interval")),
    currency: String(formData.get("currency")),
    amount: Number(formData.get("amount")),
  });
  revalidatePath("/subscription-plans");
}

// ---- Payment verification (Pesapal safety net: the browser callback and IPN
// usually finalize a payment automatically, but if both miss - e.g. the
// customer closed the browser early, or the IPN delivery failed - this
// re-runs the same verify-with-Pesapal + activate logic on demand.) ----
async function verifyPesapalAttempt(kind: "subscriptions" | "orders", attemptId: string) {
  let result: "success" | "error";
  let message: string;

  try {
    await apiPost(`/admin/payments/${kind}/${attemptId}/verify`);
    message =
      kind === "subscriptions"
        ? "Payment verified with Pesapal - subscription activated."
        : "Payment verified with Pesapal - order(s) marked paid.";
    result = "success";
  } catch (err) {
    message = err instanceof ApiError ? err.message : "Unexpected error verifying payment.";
    result = "error";
  }

  revalidatePath("/payment-verification");
  redirect(`/payment-verification?result=${result}&message=${encodeURIComponent(message)}`);
}

export async function verifySubscriptionPayment(formData: FormData) {
  await verifyPesapalAttempt("subscriptions", id(formData));
}

export async function verifyOrderPayment(formData: FormData) {
  await verifyPesapalAttempt("orders", id(formData));
}

// ---- Countries ----
export async function createCountry(formData: FormData) {
  await apiPost("/admin/countries", {
    name: String(formData.get("name")),
    iso2: String(formData.get("iso2")),
    iso3: String(formData.get("iso3")),
    currency_code: String(formData.get("currency_code")),
    currency_symbol: String(formData.get("currency_symbol") ?? "") || undefined,
    dial_code: String(formData.get("dial_code") ?? "") || undefined,
  });
  revalidatePath("/countries");
}
