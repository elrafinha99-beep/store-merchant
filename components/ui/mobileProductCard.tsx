import { StoreProduct } from "@/app/lib/definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"

type Props = {
    sp: StoreProduct,
    handleUpdateStoreProduct: (storeProductId: number, field: 'price' | 'availability', value: number | boolean | null) => void,
    handleRemoveProduct: (storeProductId: number) => void,
}

const MobileProductCard = ({ sp, handleUpdateStoreProduct, handleRemoveProduct }: Props) => {
    const isInactive = !sp.product || sp.product.active === false
    return (
        <div
            key={sp.id}
            className={`rounded-lg border p-4 space-y-3 ${isInactive ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                }`}
        >
            {/* Product Name Row */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                    <span
                        className={`font-medium ${isInactive ? 'text-gray-400 line-through' : ''
                            }`}
                    >
                        {sp.product?.name ?? '—'}
                    </span>
                    {isInactive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                            Unavailable
                        </span>
                    )}
                </div>
            </div>

            {/* Price Row */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <p className="text-xs text-gray-500 mb-1">Recommended Price</p>
                    <p className="text-sm font-medium text-gray-700">
                        {!isInactive && sp.product?.recommended_price != null
                            ? `$${sp.product.recommended_price}`
                            : '—'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 mb-1">Store Price</p>
                    {isInactive ? (
                        <span className="text-sm text-gray-400">—</span>
                    ) : (
                        <Input
                            type="number"
                            className="h-8 w-full text-sm"
                            value={sp.price ?? ''}
                            onChange={(e) =>
                                handleUpdateStoreProduct(
                                    sp.id!,
                                    'price',
                                    e.target.value === '' ? null : Number(e.target.value)
                                )
                            }
                        />
                    )}
                </div>
            </div>

            {/* Availability & Remove Row */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Available</span>
                    {isInactive ? (
                        <span className="text-sm text-gray-400">—</span>
                    ) : (
                        <input
                            type="checkbox"
                            checked={sp.availability}
                            onChange={(e) =>
                                handleUpdateStoreProduct(sp.id!, 'availability', e.target.checked)
                            }
                            className="w-4 h-4 cursor-pointer"
                        />
                    )}
                </div>
                <div>
                    {isInactive && (
                        <span className="text-xs text-red-500 mr-2">Product deleted</span>
                    )}
                    <Button
                        type="button"
                        onClick={() => handleRemoveProduct(sp.id!)}
                        className="h-8 px-3 text-xs bg-red-500 hover:bg-red-400 text-white rounded-lg"
                    >
                        Remove
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default MobileProductCard;