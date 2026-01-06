import { createSlice, PayloadAction } from "@reduxjs/toolkit"
export interface CartItem {
    _id?: string;
    productId: string;
    productName: string;
    productImage: string[];
    price: number;
    quantity: number;
    stock: number;
    brand?: string;
    category: string[];
    discount?: number;
}
interface CartState {
    cartItems: CartItem[];
    isLoading: boolean;
}

const initialState: CartState = {
    cartItems: [],
    isLoading: false
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCartItems(state, action: PayloadAction<CartItem[]>) {
            state.cartItems = action.payload
        },
        addToCart(state, action: PayloadAction<CartItem>) {
            const existing = state.cartItems.find(item => item.productId === action.payload.productId)
            if (existing) {
                existing.quantity += 1
            } else {
                state.cartItems.push({ ...action.payload, quantity: 1 })
            }
        },
        removeFromCart(state, action: PayloadAction<string>) {
            state.cartItems = state.cartItems.filter(
                item => item.productId !== action.payload
            );
        },
        removeItemPermanently(state, action: PayloadAction<string>) {
            state.cartItems = state.cartItems.filter(
                item => item._id !== action.payload
            )
        },
        updateQuantity(state, action: PayloadAction<{ productId: string, quantity: number }>) {
            const item = state.cartItems.find(i => i.productId === action.payload.productId)
            if (item) item.quantity = action.payload.quantity
        },
        clearCart(state) {
            state.cartItems = []
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload
        }
    }
})

export const {
    setCartItems,
    addToCart,
    removeFromCart,
    removeItemPermanently,
    updateQuantity,
    clearCart,
    setLoading
} = cartSlice.actions
export default cartSlice.reducer