import React, { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, TrendingDown, Truck, X } from 'lucide-react';
import { getAllInsumos, createInsumo, updateInsumo, deleteInsumo, toggleInsumoActive, getMovimientos, createMovimiento } from '../../api/insumos';
import { ui } from '../../utilities/ui';

// Components
import InsumoList from '../../features/inventory/components/InsumoList';
import HistoryList from '../../features/inventory/components/HistoryList';
import InsumoForm from '../../features/inventory/components/InsumoForm';
import StockMovementForm from '../../features/inventory/components/StockMovementForm';

const InsumosManager = () => {
    // --- State ---
    const [insumos, setInsumos] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Selection
    const [selectedItems, setSelectedItems] = useState(new Set());

    // Modals
    const [isInsumoModalOpen, setIsInsumoModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);

    // Edit Insumo Data
    const [currentInsumo, setCurrentInsumo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Stock Movement Data
    const [stockMovementType, setStockMovementType] = useState('CONSUMO'); // 'CONSUMO' or 'REPOSICION'

    // Filters
    const [filters, setFilters] = useState({ alert: 'ALL', status: 'ALL' });

    // --- Loading ---
    const loadData = async () => {
        try {
            setLoading(true);
            const [insumosData, movimientosData] = await Promise.all([
                getAllInsumos(),
                getMovimientos()
            ]);

            setInsumos(insumosData);
            setHistory(movimientosData);

        } catch (error) {
            console.error("Error loading data:", error);
            ui.error("Error al cargar inventario e historial");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- Selection Handlers ---
    const toggleSelection = (id) => {
        const newSelection = new Set(selectedItems);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedItems(newSelection);
    };

    const toggleAll = () => {
        if (selectedItems.size === filteredInsumos.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredInsumos.map(i => i.id)));
        }
    };

    // --- Modal Handlers: Insumo (Edit/Create) ---
    const openInsumoModal = (insumo = null) => {
        setCurrentInsumo(insumo);
        setIsInsumoModalOpen(true);
    };

    const handleInsumoSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            if (currentInsumo) {
                await updateInsumo(currentInsumo.id, formData);
                ui.success('Insumo actualizado');
            } else {
                await createInsumo(formData);
                ui.success('Insumo creado');
            }
            setIsInsumoModalOpen(false);
            loadData();
        } catch (error) {
            ui.error(ui.getApiErrorMessage(error, 'Error al guardar insumo'));
            throw error; // Re-throw so InsumoForm can display field errors
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Modal Handlers: Stock Movement (Consume/Restock) ---
    const openStockModal = (type) => { // type: 'CONSUMO' or 'REPOSICION'
        if (selectedItems.size === 0) {
            ui.error('Selecciona al menos un ítem');
            return;
        }
        setStockMovementType(type);
        setIsStockModalOpen(true);
    };

    const handleStockSubmit = async (payload) => {
        setIsSubmitting(true);
        try {
            await createMovimiento({ ...payload, tipo: stockMovementType });
            ui.success(stockMovementType === 'CONSUMO' ? 'Consumo registrado' : 'Reposición registrada');
            setIsStockModalOpen(false);
            setSelectedItems(new Set());
            loadData();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.non_field_errors?.[0] ||
                (Array.isArray(error.response?.data) ? error.response.data[0] : 'Error al procesar solicitud');
            ui.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await ui.confirm({
            title: '¿Eliminar insumo?',
            message: 'Solo se puede eliminar si no tiene movimientos de inventario asociados. De lo contrario, desactívelo.',
            confirmText: 'Eliminar',
            variant: 'danger',
        });
        if (!confirmed) return;
        try {
            await deleteInsumo(id);
            ui.success('Eliminado');
            loadData();
        } catch (error) {
            const msg = error.response?.data?.detail || error.response?.data?.[0] || 'Error al eliminar';
            ui.error(msg);
        }
    };

    const handleToggleActive = async (id) => {
        try {
            const res = await toggleInsumoActive(id);
            ui.success(res?.message || 'Estado actualizado');
            loadData();
        } catch (error) {
            ui.error('Error al cambiar estado del insumo');
        }
    };

    // --- Helpers ---
    const filteredInsumos = insumos.filter(insumo => {
        const matchesSearch = insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAlert = filters.alert === 'ALL' || insumo.alerta_stock === filters.alert;
        const matchesStatus = filters.status === 'ALL' ||
            (filters.status === 'AVAILABLE' && insumo.disponible) ||
            (filters.status === 'UNAVAILABLE' && !insumo.disponible);
        return matchesSearch && matchesAlert && matchesStatus;
    });

    const getSelectedInsumosObjects = () => {
        return insumos.filter(i => selectedItems.has(i.id));
    };

    return (
        <div className="space-y-8 font-inter pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión Inventario</h1>
                    <p className="text-slate-500 mt-1">Administra stock, registra consumos y reposiciones</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => openInsumoModal()} className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all">
                        <Plus size={18} /> Nuevo Insumo
                    </button>
                </div>
            </div>

            {/* Selection Toolbar (Floating or Static) */}
            {selectedItems.size > 0 && (
                <div className="bg-slate-800 text-white p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 animate-in slide-in-from-top-2 shadow-xl sticky top-4 z-30">
                    <div className="font-semibold flex items-center justify-center md:justify-start gap-2 text-center md:text-left">
                        <CheckCircle size={20} className="text-emerald-400 shrink-0" />
                        <span>{selectedItems.size} ítems seleccionados</span>
                    </div>
                    <div className="grid grid-cols-2 md:flex gap-3">
                        <button onClick={() => openStockModal('CONSUMO')} className="col-span-1 flex items-center justify-center gap-2 px-3 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg font-bold text-sm transition-colors">
                            <TrendingDown size={18} /> <span className="hidden sm:inline">Consumo (-)</span><span className="sm:hidden">Consumo</span>
                        </button>
                        <button onClick={() => openStockModal('REPOSICION')} className="col-span-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-bold text-sm transition-colors">
                            <Truck size={18} /> <span className="hidden sm:inline">Reponer (+)</span><span className="sm:hidden">Reponer</span>
                        </button>
                        <button onClick={() => setSelectedItems(new Set())} className="col-span-2 md:col-span-1 flex items-center justify-center p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <X size={20} /> <span className="md:hidden ml-2">Cancelar Selección</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Insumos Table Section */}
            <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar insumos..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                        <select className="px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white" value={filters.alert} onChange={(e) => setFilters({ ...filters, alert: e.target.value })}>
                            <option value="ALL">Todos los Stocks</option>
                            <option value="ALTO">Stock Alto</option>
                            <option value="BAJO">Stock Bajo</option>
                            <option value="AGOTADO">Agotado</option>
                        </select>
                        <select className="px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                            <option value="ALL">Todos los Estados</option>
                            <option value="AVAILABLE">Disponible</option>
                            <option value="UNAVAILABLE">No Disponible</option>
                        </select>
                    </div>
                </div>

                <InsumoList
                    loading={loading}
                    filteredInsumos={filteredInsumos}
                    selectedItems={selectedItems}
                    toggleSelection={toggleSelection}
                    toggleAll={toggleAll}
                    openInsumoModal={openInsumoModal}
                    handleDelete={handleDelete}
                    handleToggleActive={handleToggleActive}
                />
            </div>

            {/* Unified History Section */}
            <HistoryList history={history} />

            {/* --- Modals --- */}
            <InsumoForm
                isOpen={isInsumoModalOpen}
                onClose={() => setIsInsumoModalOpen(false)}
                onSubmit={handleInsumoSubmit}
                initialData={currentInsumo}
                isSubmitting={isSubmitting}
            />

            <StockMovementForm
                isOpen={isStockModalOpen}
                onClose={() => setIsStockModalOpen(false)}
                type={stockMovementType}
                selectedInsumos={getSelectedInsumosObjects()}
                onSubmit={handleStockSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default InsumosManager;
