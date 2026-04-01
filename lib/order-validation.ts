import { OrderFormData } from "@/app/constants/schema";

interface OrderValidationErrors {
    customerName?: string;
    customerEmail?: string;
    items?: string;
    shippingAddress?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Validate order form data
 */
export function validateOrderForm(data: OrderFormData): { 
    isValid: boolean; 
    errors: OrderValidationErrors 
} {
    const errors: OrderValidationErrors = {};
    
    // Customer Name validation
    if (!data.customerName || data.customerName.trim().length === 0) {
        errors.customerName = "Customer name is required";
    } else if (data.customerName.trim().length < 2) {
        errors.customerName = "Customer name must be at least 2 characters";
    }
    
    // Customer Email validation
    if (!data.customerEmail || data.customerEmail.trim().length === 0) {
        errors.customerEmail = "Customer email is required";
    } else if (!validateEmail(data.customerEmail)) {
        errors.customerEmail = "Please enter a valid email address";
    }
    
    // Items validation
    if (!data.items || data.items.length === 0) {
        errors.items = "At least one product is required";
    } else {
        // Validate each item
        for (let i = 0; i < data.items.length; i++) {
            const item = data.items[i];
            
            if (!item.productId) {
                errors.items = `Product #${i + 1}: Product is required`;
                break;
            }
            
            if (!item.quantity || item.quantity <= 0) {
                errors.items = `Product #${i + 1}: Quantity must be greater than 0`;
                break;
            }
            
            if (!item.price || item.price < 0) {
                errors.items = `Product #${i + 1}: Invalid price`;
                break;
            }
        }
    }
    
    // Shipping Address validation (optional but validated if any field is filled)
    const hasAddress = data.shippingAddress && (
        data.shippingAddress.street?.trim() ||
        data.shippingAddress.city?.trim() ||
        data.shippingAddress.state?.trim() ||
        data.shippingAddress.zipCode?.trim() ||
        data.shippingAddress.country?.trim()
    );
    
    if (hasAddress) {
        errors.shippingAddress = {};
        
        if (data.shippingAddress.street && data.shippingAddress.street.trim().length > 50) {
            errors.shippingAddress.street = "Street must be less than 50 characters";
        }
        
        if (data.shippingAddress.city && data.shippingAddress.city.trim().length > 30) {
            errors.shippingAddress.city = "City must be less than 30 characters";
        }
        
        if (data.shippingAddress.state && data.shippingAddress.state.trim().length > 30) {
            errors.shippingAddress.state = "State must be less than 30 characters";
        }
        
        if (data.shippingAddress.zipCode && data.shippingAddress.zipCode.trim().length > 20) {
            errors.shippingAddress.zipCode = "ZIP code must be less than 20 characters";
        }
        
        if (data.shippingAddress.country && data.shippingAddress.country.trim().length > 30) {
            errors.shippingAddress.country = "Country must be less than 30 characters";
        }
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate order status update
 */
export function validateOrderStatus(status: string): boolean {
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    return validStatuses.includes(status.toLowerCase());
}
