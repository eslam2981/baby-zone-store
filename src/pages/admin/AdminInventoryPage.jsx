import { useState, useMemo, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { useAdmin } from '../../context/AdminContext';
import { REGEX_PATTERNS } from '../../utils/validators';
import InventoryHeader from '../../components/admin/inventory/InventoryHeader';
import InventoryMetricsGrid from '../../components/admin/inventory/InventoryMetricsGrid';
import InventoryFilterBar from '../../components/admin/inventory/InventoryFilterBar';
import InventoryTable from '../../components/admin/inventory/InventoryTable';
import StockAdjustmentModal from '../../components/admin/inventory/StockAdjustmentModal';

/* Inventory management page provides stock level audits and instant replenishment tools */
export default function AdminInventoryPage() {
  const { allProducts, isLoadingProducts, updateProductStock, categories, addToast } = useShop();
  const { isRealtimeConnected, isSyncing, refreshAllRealtimeData } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(10);
  const [adjustmentType, setAdjustmentType] = useState('add');

  // Lock background scroll when modal is open
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [selectedProduct]);

  /* Calculate inventory health indicators */
  const metrics = useMemo(() => {
    const totalItems = allProducts.length;
    const totalUnits = allProducts.reduce((sum, p) => sum + (Number(p.stockCount ?? p.stock) || 0), 0);
    const lowStockCount = allProducts.filter((p) => {
      const s = Number(p.stockCount ?? p.stock ?? 0);
      return s > 0 && s <= 5;
    }).length;
    const outOfStockCount = allProducts.filter((p) => Number(p.stockCount ?? p.stock ?? 0) === 0).length;
    const totalValuation = allProducts.reduce(
      (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stockCount ?? p.stock) || 0),
      0
    );

    return { totalItems, totalUnits, lowStockCount, outOfStockCount, totalValuation };
  }, [allProducts]);

  /* Filter items according to search and status criteria */
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.id).includes(searchQuery);

      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;

      const stock = Number(p.stockCount ?? p.stock ?? 0);
      let matchStock = true;
      if (stockFilter === 'out') {
        matchStock = stock === 0;
      } else if (stockFilter === 'low') {
        matchStock = stock > 0 && stock <= 5;
      } else if (stockFilter === 'normal') {
        matchStock = stock > 5;
      }

      return matchSearch && matchCategory && matchStock;
    });
  }, [allProducts, searchQuery, categoryFilter, stockFilter]);

  /* Apply stock adjustment to target product */
  const handleApplyAdjustment = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const strAmount = String(adjustmentAmount).trim();
    if (!REGEX_PATTERNS.POSITIVE_INTEGER.test(strAmount)) {
      if (addToast) addToast('يرجى إدخال عدد صحيح موجب لكمية التسوية', 'warning');
      return;
    }

    const amount = Number(strAmount);
    if (isNaN(amount) || amount < 1 || amount > 50000) {
      if (addToast) addToast('كمية التسوية يجب أن تكون بين 1 و 50,000 قطعة', 'warning');
      return;
    }

    const currentStock = Number(selectedProduct.stockCount ?? selectedProduct.stock ?? 0);
    const newStock =
      adjustmentType === 'add'
        ? currentStock + amount
        : Math.max(0, currentStock - amount);

    updateProductStock(selectedProduct.id, newStock);
    if (addToast) {
      addToast(
        `تم ${adjustmentType === 'add' ? 'إضافة' : 'خصم'} ${amount} قطعة للمنتج ${selectedProduct.name} (الرصيد الجديد: ${newStock})`,
        'success'
      );
    }
    setSelectedProduct(null);
    setAdjustmentAmount(10);
    setAdjustmentType('add');
  };

  const handleOpenAdjustment = (product) => {
    setSelectedProduct(product);
    setAdjustmentAmount(10);
    setAdjustmentType('add');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <InventoryHeader
        totalUnits={metrics.totalUnits}
        isRealtimeConnected={isRealtimeConnected}
        isSyncing={isSyncing}
        onRefresh={() => refreshAllRealtimeData()}
      />

      {/* Inventory KPI Cards */}
      <InventoryMetricsGrid metrics={metrics} />

      {/* Filter and Search controls */}
      <InventoryFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories || []}
        totalItemsCount={allProducts.length}
        lowStockCount={metrics.lowStockCount}
        outOfStockCount={metrics.outOfStockCount}
        filteredCount={filteredProducts.length}
        onReset={() => {
          setSearchQuery('');
          setStockFilter('all');
          setCategoryFilter('all');
        }}
      />

      {/* Inventory Table & Mobile Card View */}
      <InventoryTable
        isLoadingProducts={isLoadingProducts}
        filteredProducts={filteredProducts}
        categories={categories || []}
        onUpdateStock={updateProductStock}
        onOpenAdjustment={handleOpenAdjustment}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        adjustmentType={adjustmentType}
        setAdjustmentType={setAdjustmentType}
        adjustmentAmount={adjustmentAmount}
        setAdjustmentAmount={setAdjustmentAmount}
        onSubmit={handleApplyAdjustment}
      />
    </div>
  );
}
