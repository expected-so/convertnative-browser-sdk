export type ProductPayload = {
	productID: string
	productName?: string | undefined | null
	productURL?: string | undefined | null
	productBrand?: string | undefined | null
	productCategories?: string[] | undefined | null
}

export type ProductVariantPayload = {
	variantID: string
	variantName?: string | undefined | null
	variantSKU?: string | undefined | null
	variantImageURL?: string | undefined | null
	unitPrice: string | number | undefined | null
}

export type ProductViewedPayload = ProductPayload & (
	(ProductVariantPayload & { currency: string | undefined | null }) |
	{}
)

export type SearchSubmittedPayload = {
	query: string
}

export type CategoryViewedPayload = {
	name: string
}

export type CartLinePayload = ProductPayload & ProductVariantPayload & { quantity: number }

export type ProductAddedToCartPayload = CartLinePayload

export type ProductRemovedFromCartPayload = CartLinePayload

export type CartViewedPayload = {
	cartID: string
	lines?: CartLinePayload[] | undefined | null
}

export type CheckoutLinePayload = ProductPayload & ProductVariantPayload & { quantity: number }

export type CheckoutPayload = {
	checkoutID: string
	shippingFees?: string | number | undefined | null
	taxes?: string | number | undefined | null
	discounts?: string | number | undefined | null
	currency?: string | undefined | null
	lines?: CheckoutLinePayload[] | undefined | null
}

export type CheckoutStartedPayload = CheckoutPayload

export type CheckoutShippingInfoCompletedPayload = CheckoutPayload

export type CheckoutBillingInfoCompletedPayload = CheckoutPayload

export type CheckoutCompletedPayload = CheckoutPayload
