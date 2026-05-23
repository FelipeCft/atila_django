import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'sileo';
import 'sileo/styles.css';
import ConfirmModal from './ConfirmModal';
import { _registerConfirmListener } from '../../utilities/ui';

const UIProvider = () => {
    const [modal, setModal] = useState({
        isOpen: false,
        title: '¿Estás seguro?',
        message: '',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        variant: 'danger',
        resolve: null,
    });

    const handleConfirmRequest = useCallback((opts) => {
        setModal({
            isOpen: true,
            title: opts.title || '¿Estás seguro?',
            message: opts.message || '',
            confirmText: opts.confirmText || 'Confirmar',
            cancelText: opts.cancelText || 'Cancelar',
            variant: opts.variant || 'danger',
            resolve: opts.resolve,
        });
    }, []);

    useEffect(() => {
        const unsubscribe = _registerConfirmListener(handleConfirmRequest);
        return unsubscribe;
    }, [handleConfirmRequest]);

    const handleConfirm = () => {
        modal.resolve?.(true);
        setModal((prev) => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        modal.resolve?.(false);
        setModal((prev) => ({ ...prev, isOpen: false }));
    };

    return (
        <>
            <Toaster position="top-right" />
            <ConfirmModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                confirmText={modal.confirmText}
                cancelText={modal.cancelText}
                variant={modal.variant}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </>
    );
};

export default UIProvider;
