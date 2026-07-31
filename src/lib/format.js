export function formatPrice(price, status) {
  const formatted = new Intl.NumberFormat("he-IL").format(price);
  return status === "rent" ? `${formatted} ₪ / לחודש` : `${formatted} ₪`;
}

export const statusLabel = {
  sale: "למכירה",
  rent: "להשכרה",
};
