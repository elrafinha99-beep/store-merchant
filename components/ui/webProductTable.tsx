import { StoreProduct } from "@/app/lib/definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"

type Props = {
    storeProducts: StoreProduct[],
    handleUpdateStoreProduct: (storeProductId: number, field: 'price' | 'availability', value: number | boolean | null) => void,
    handleRemoveProduct: (storeProductId: number) => void,
}

const WebProductTable = ({ storeProducts, handleUpdateStoreProduct, handleRemoveProduct }: Props) => {
    return (
        <table className="hidden md:table w-full text-sm border rounded overflow-hidden mb-6">
            <thead>
                <tr className="bg-gray-100 text-left">
                    <th className="px-4 py-2 font-medium">Product</th>
                    <th className="px-4 py-2 font-medium">Recommended Price</th>
                    <th className="px-4 py-2 font-medium">Store Price</th>
                    <th className="px-4 py-2 font-medium text-center">Available</th>
                    <th className="px-4 py-2 font-medium"></th>
                </tr>
            </thead>
            <tbody>
                {storeProducts.map((sp) => {
                    const isInactive = !sp.product || sp.product.active === false
                    return (
                        <tr key={sp.id} className={`border-t ${isInactive ? 'bg-red-50' : ''}`}>
                            <td className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                    <span className={isInactive ? 'text-gray-400 line-through' : ''}>
                                        {sp.product?.name ?? '—'}
                                    </span>
                                    {isInactive && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                            Unavailable
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-2 text-gray-500">
                                {!isInactive && sp.product?.recommended_price != null
                                    ? `$${sp.product.recommended_price}`
                                    : '—'}
                            </td>
                            <td className="px-4 py-2">
                                {isInactive ? (
                                    <span className="text-gray-400 text-xs">—</span>
                                ) : (
                                    <Input
                                        type="number"
                                        className="h-8 w-28"
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
                            </td>
                            <td className="px-4 py-2 text-center">
                                {isInactive ? (
                                    <span className="text-gray-400 text-xs">—</span>
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
                            </td>
                            <td className="px-4 py-2 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {isInactive && (
                                        <span className="text-xs text-red-500">Product deleted — please remove</span>
                                    )}
                                    <Button
                                        type="button"
                                        onClick={() => handleRemoveProduct(sp.id!)}
                                        className="h-8 px-3 text-xs bg-red-500 hover:bg-red-400 text-white rounded-lg"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

export default WebProductTable;