import type Client from "./index";
import {
	CartViewedPayload,
	CategoryViewedPayload,
	CheckoutBillingInfoCompletedPayload, CheckoutCompletedPayload,
	CheckoutPayload,
	CheckoutShippingInfoCompletedPayload,
	CheckoutStartedPayload,
	ProductAddedToCartPayload,
	ProductPayload,
	ProductRemovedFromCartPayload,
	ProductVariantPayload,
	ProductViewedPayload,
	SearchSubmittedPayload
} from "./event-payloads";

export type UserDetails = {
	id?: string | undefined | null
	email?: string | undefined | null
	phone?: string | undefined | null
	firstName?: string | undefined | null
	lastName?: string | undefined | null
	signedUpAt?: Date | string | undefined | null
}

export default class Events {
	public userDetails?: UserDetails

	constructor(private client: Client) {}

	pageViewed() {
		return this._sendEvent({ type: 'page_viewed', properties: {} })
	}

	productViewed(payload: ProductViewedPayload) {
		return this._sendEvent({
			type: 'product_viewed',
			properties: {
				...this.formatProductPayload(payload),
				...('variantID' in payload ? this.formatProductVariantPayload(payload) : {}),
			},
		})
	}

	searchSubmitted(payload: SearchSubmittedPayload) {
		return this._sendEvent({
			type: 'search_submitted',
			properties: {
				query: payload.query,
			},
		})
	}

	categoryViewed(payload: CategoryViewedPayload) {
		return this._sendEvent({
			type: 'category_viewed',
			properties: {
				name: payload.name,
			},
		})
	}

	productAddedToCart(payload: ProductAddedToCartPayload) {
		return this._sendEvent({
			type: 'product_added_to_cart',
			properties: {
				...this.formatProductPayload(payload),
				...this.formatProductVariantPayload(payload),
				quantity: payload.quantity,
			},
		})
	}

	productRemovedFromCart(payload: ProductRemovedFromCartPayload) {
		return this._sendEvent({
			type: 'product_removed_from_cart',
			properties: {
				...this.formatProductPayload(payload),
				...this.formatProductVariantPayload(payload),
				quantity: payload.quantity,
			},
		})
	}

	cartViewed(payload: CartViewedPayload) {
		return this._sendEvent({
			type: 'cart_viewed',
			properties: {
				cart_id: payload.cartID,
				lines: payload.lines?.map((line) => ({
					...this.formatProductPayload(line),
					...this.formatProductVariantPayload(line),
					quantity: line.quantity,
				})),
			},
		})
	}

	checkoutStarted(payload: CheckoutStartedPayload) {
		return this._sendEvent({
			type: 'checkout_started',
			properties: this.formatCheckoutPayload(payload),
		})
	}

	checkoutShippingInfoCompleted(payload: CheckoutShippingInfoCompletedPayload) {
		return this._sendEvent({
			type: 'checkout_shipping_info_completed',
			properties: this.formatCheckoutPayload(payload),
		})
	}

	checkoutBillingInfoCompleted(payload: CheckoutBillingInfoCompletedPayload) {
		return this._sendEvent({
			type: 'checkout_billing_info_completed',
			properties: this.formatCheckoutPayload(payload),
		})
	}

	checkoutCompletedPayload(payload: CheckoutCompletedPayload) {
		return this._sendEvent({
			type: 'checkout_completed',
			properties: this.formatCheckoutPayload(payload),
		})
	}

	setUserDetails(userDetails: UserDetails) {
		this.userDetails = userDetails
	}

	buildContext() {
		return {
			user_id: this.userDetails?.id,
			user_email: this.userDetails?.email,
			user_phone: this.userDetails?.phone,
			user_first_name: this.userDetails?.firstName,
			user_last_name: this.userDetails?.lastName,
			user_signed_up_at: this.userDetails?.signedUpAt instanceof Date
				? this.userDetails.signedUpAt.toISOString()
				: this.userDetails?.signedUpAt,
			page_url: document.location.href,
			page_title: document.title,
			referrer: document.referrer,
		}
	}

	private _sendEvent(opts: { type: string, properties: object }) {
		return this.client.request({
			method: 'POST',
			path: '/browser/v1/events',
			body: JSON.stringify({
				installation_id: this.client.installationId,
				context: this.buildContext(),
				platform: 'web',
				type: opts.type,
				properties: opts.properties,
			}),
		})
	}

	private formatProductPayload(payload: ProductPayload) {
		return {
			product_id: payload.productID,
			product_name: payload.productName,
			product_url: payload.productURL,
			product_brand: payload.productBrand,
			product_categories: payload.productCategories,
		}
	}

	private formatProductVariantPayload(payload: ProductVariantPayload) {
		return {
			product_variant_id: payload.variantID,
			product_variant_name: payload.variantName,
			product_variant_sku: payload.variantSKU,
			product_variant_image_url: payload.variantImageURL,
			unit_price: payload.unitPrice,
			currency: payload.currency,
		}
	}

	private formatCheckoutPayload(payload: CheckoutPayload) {
		return {
			checkout_id: payload.checkoutID,
			shipping_fees: payload.shippingFees,
			taxes: payload.taxes,
			discounts: payload.discounts,
			currency: payload.currency,
			lines: payload.lines?.map((line) => ({
				...this.formatProductPayload(line),
				...this.formatProductVariantPayload(line),
				quantity: line.quantity,
			})),
		}
	}
}
